import { getRepository, getManager, In, Not } from "typeorm";
import { ZoomMeeting } from "../entity/ZoomMeeting";
import { Classes } from "../entity/Classes";
import { BatchStudent } from "../entity/BatchStudent";
import { Student } from "../entity/Student";
import { StudentBatchesHistory } from "../entity/StudentBatchesHistory";
import zoomClient from "../utils/zoom/zoomClient";
import { COSMOS_API } from "../helpers/Constants";
const { logger } = require("../Logger.js");
import LoggerService from "./LoggerService";
const moment = require("moment");
import axios from "../helpers/axios";
import { getLessonByID } from "../data/lessons";
import { User } from "../entity/User";

export class ZoomAttendanceService {
  private batchRepository = getRepository(Classes);
  private batchHistroyRepository = getRepository(StudentBatchesHistory);
  public request: any = {};
  private logger = new LoggerService();
  private FULLY_ATTENDED_DURATION = 45 * 60;
  private UPSENT_TIME = 5 * 60;
  private IST = "+05:30";
  private today: string = moment().utc().format("YYYY-MM-DD");
  private attendanceTypes = {
    YES: "Yes",
    NO: "No",
    PARTIAL: "Partial",
  };
  private day: string = moment().utc().format("dddd");
  private frequencyList = {
    SS: ["Saturday", "Sunday"],
    TT: ["Tuesday", "Thursday"],
    MWF: ["Monday", "Wednesday", "Friday"],
    TTS: ["Tuesday", "Thursday", "Saturday"],
    MTWTF: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  };
  private MEETING_NOT_FOUND: number = 3001;

  ZoomAttendanceService() {}

  async getMeetings(batchData: any = {}): Promise<any[]> {
    const customWhere = `${
      batchData?.batchNumber
        ? `AND batch.batchNumber = '${batchData.batchNumber}'`
        : ""
    }`;
    return await getManager()
      .createQueryBuilder(ZoomMeeting, "meeting")
      .leftJoinAndSelect(Classes, "batch", "batch.id = meeting.batch_id")
      .where(
        `batch.id IS NOT NULL AND batch.useAutoAttendance = 1 ${customWhere}`
      )
      .getMany();
  }

  async syncAttendance(): Promise<any> {
    const result = {
      success: 0,
      errors: 0,
      logs: [],
    };

    const meetings = await this.getMeetings({ batchNumber: "QE525" });

    let counter = 0;

    for (const meeting of meetings) {
      counter += 1;
      const lengthText = `${counter} Out Of ${meetings.length}`;
      const batch = await this.batchRepository.findOne(meeting.batch_id);
      let forceUpdateAttendance = false;
      if (this.frequencyList[batch.frequency]?.includes(this.day)) {
        forceUpdateAttendance = true;
      }

      /**
       * ? Disable this if statement if you want to track attendance whenever the batch run, and not based on frequency only.
       */
      if (!forceUpdateAttendance) {
        continue;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const attendance = await zoomClient.getMeetingParticipants(meeting.id, {
          page_size: 300,
        });

        if (attendance.code && attendance.code !== this.MEETING_NOT_FOUND) {
          throw new Error(attendance.message);
        }

        /**
         * ? Enable this if check if you want to enable tracking attendance whenever the batch starts.
         */
        // if (
        //   (!attendance.participants || attendance.participants.length < 1) &&
        //   !forceUpdateAttendance
        // ) {
        //   throw new Error("Attendance Particiapants Not Found.");
        // }

        const participants = attendance.participants;

        const summary = {};
        const alreadyExistsStudents = [];
        const allowedStudents = [meeting.user_id];
        const lesson = getLessonByID(batch.activeLessonId);
        let attendDate = moment(this.today, "YYYY-MM-DD").format("DD-MM-YYYY");

        /**
         * Get all students on the batch
         */
        let students = await getManager()
          .createQueryBuilder(BatchStudent, "batch_student")
          .leftJoinAndSelect(User, "user", "user.id = batch_student.studentId")
          .leftJoinAndSelect(Student, "student", "user.id = student.id")
          .where(`batch_student.batchId = '${meeting.batch_id}'`)
          .getRawMany();

        /**
         * Get only allowed students
         */
        for (const student of students) {
          const batchHistory = await this.batchHistroyRepository
            .createQueryBuilder()
            .where({
              studentId: student.user_id,
              batchId: student.batch_student_batchId,
            })
            .orderBy("created_at", "DESC")
            .getOne();

          if (
            !student.student_classesStartDate ||
            moment(student.student_classesStartDate)
              .utcOffset(this.IST)
              .format("X") <= moment(attendDate, "DD-MM-YYYY").format("X")
          ) {
            if (
              !batchHistory ||
              !batchHistory.batchesClassesStartDate ||
              moment(batchHistory.batchesClassesStartDate)
                .utcOffset(this.IST)
                .format("X") <= moment(attendDate, "DD-MM-YYYY").format("X")
            ) {
              allowedStudents.push(student.user_id);
            }
          }
        }

        /**
         * Summarize participants and create one record for each valid student.
         */
        if (Array.isArray(participants)) {
          for (let record of participants) {
            if (
              !record.user_email ||
              record.user_email.split("@")[0].length < 5
            ) {
              continue;
            }

            if (
              moment(record.join_time)
                .utcOffset(this.IST)
                .format("YYYY-MM-DD") != this.today
            ) {
              continue;
            }

            const userId = record.user_email.split("@")[0];

            if (!allowedStudents.includes(userId)) {
              continue;
            }

            // convert into IST
            record.join_time = moment(record.join_time)
              .utcOffset(this.IST)
              .format("YYYY-MM-DD HH:mm:ss");
            record.leave_time = moment(record.leave_time)
              .utcOffset(this.IST)
              .format("YYYY-MM-DD HH:mm:ss");

            let done = false;
            if (!summary[userId]) {
              done = true;
              summary[userId] = {
                name: record.name,
                startTime: record.join_time,
                endTime: record.leave_time,
                duration: record.duration,
                teacher: meeting.user_id === userId,
                connectionProblem: false,
                studentId: userId,
                dateAttended: attendDate,
                classProfileId: meeting.batch_id,
                id: `${userId}-${meeting.batch_id}-${attendDate}`,
                lessonId: batch.activeLessonId,
                teacherId: batch.teacherId,
                lessonNumber: lesson?.number,
                batchNumber: batch?.batchNumber,
              };
              alreadyExistsStudents.push(userId);
            }

            if (!done) {
              summary[userId].endTime = record.leave_time;
              summary[userId].duration += record.duration;
              // mark people the disconnect then connect again as having network issue.
              summary[userId].connectionProblem = true;
            }

            // mark attendance type
            if (this.FULLY_ATTENDED_DURATION <= summary[userId].duration) {
              summary[userId].studentAttended = this.attendanceTypes.YES;
              continue;
            }

            if (this.UPSENT_TIME > summary[userId].duration) {
              summary[userId].studentAttended = this.attendanceTypes.NO;
              continue;
            }

            summary[userId].studentAttended = this.attendanceTypes.PARTIAL;
          }
        }

        /**
         * Summarize students that didn't attend
         */
        for (let student of students) {
          if (!allowedStudents.includes(student.batch_student_studentId)) {
            continue;
          }

          if (alreadyExistsStudents.includes(student.batch_student_studentId)) {
            continue;
          }
          summary[student.batch_student_studentId] = {
            connectionProblem: false,
            studentId: student.batch_student_studentId,
            dateAttended: attendDate,
            classProfileId: meeting.batch_id,
            id: `${student.batch_student_studentId}-${meeting.batch_id}-${attendDate}`,
            studentAttended: this.attendanceTypes.NO,
            lessonId: batch.activeLessonId,
            teacherId: batch.teacherId,
            lessonNumber: lesson?.number,
            name: `${student.user_firstName} ${student.user_lastName}`,
            batchNumber: batch?.batchNumber,
          };
        }

        const attendanceResult = Object.values(summary);

        await axios.put(
          `${COSMOS_API.STORE_CLASS_ATTENDANCE}/${batch.id}`,
          attendanceResult
        );

        await (
          await this.logger.customZoom(
            batch.id,
            `Success Sync zoom attendance for batch ${batch.batchNumber} meeting: ${meeting.id}, ${lengthText}`,
            "SUCCESS_TO_SYNC_MEETING_ATTENDANCE",
            { meeting, batch, attendanceResult },
            this.request.user || {}
          )
        ).save();

        result.success += 1;
      } catch (e) {
        logger.error(e.message);
        result.errors += 1;
        await (
          await this.logger.customZoom(
            meeting.batch_id,
            "Failed to sync meeting attendance: " +
              e.message +
              ", " +
              lengthText,
            "FAILED_TO_SYNC_MEETING_ATTENDANCE",
            { error: e, message: e.message, meeting },
            this.request.user || {}
          )
        ).save();
        result.logs.push(e.message);
      }
    }

    await (
      await this.logger.customZoom(
        "SYNC_ZOOM_ATTENDANCE_RESULT",
        "Sync Zoom Attendnace For " + this.today,
        "SYNC_ZOOM_ATTENDANCE_RESULT",
        { result },
        this.request.user || {}
      )
    ).save();

    return result;
  }
}
