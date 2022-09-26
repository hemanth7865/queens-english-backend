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
  public request: any = {};
  private logger = new LoggerService();
  private today: string = moment().format("YYYY-MM-DD");
  private FULLY_ATTENDED_DURATION = 45 * 60;
  private IST = "+05:30";
  private attendanceTypes = {
    YES: "Yes",
    NO: "No",
    PARTIAL: "Partial",
  };

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
      .where(`batch.id IS NOT NULL ${customWhere}`)
      .getMany();
  }

  async syncAttendance(): Promise<any> {
    const result = {
      success: 0,
      errors: 0,
      logs: [],
    };

    const meetings = await this.getMeetings();

    let counter = 0;

    for (const meeting of meetings) {
      counter += 1;
      const lengthText = `${counter} Out Of ${meetings.length}`;
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const attendance = await zoomClient.getMeetingParticipants(meeting.id, {
          page_size: 300,
        });

        if (attendance.code) {
          throw new Error(attendance.message);
        }

        if (!attendance.participants || attendance.participants.length < 1) {
          throw new Error("Attendance Particiapants Not Found.");
        }

        const participants = attendance.participants;

        const summary = {};
        const alreadyExistsStudents = [];
        const batch = await this.batchRepository.findOne(meeting.batch_id);
        const lesson = getLessonByID(batch.activeLessonId);
        let attendDate = undefined;
        /**
         * Summarize students that didn't attend
         */
        let students = await getManager()
          .createQueryBuilder(BatchStudent, "batch_student")
          .leftJoinAndSelect(User, "user", "user.id = batch_student.studentId")
          .leftJoinAndSelect(Student, "student", "user.id = student.id")
          .leftJoinAndSelect(
            StudentBatchesHistory,
            "student_batch_history",
            "student_batch_history.studentId = batch_student.studentId AND student_batch_history.batchId = batch_student.batchId"
          )
          .where(
            `batch_student.batchId = '${meeting.batch_id}' ORDER BY student_batch_history.created_at DESC`
          )
          .getRawMany();

        console.log(students);

        result.logs.push(students);

        /**
         * Summarize participants and create one record for each valid student.
         */
        for (let record of participants) {
          if (record.user_email && record.user_email.split("@")[0].length > 5) {
            const userId = record.user_email.split("@")[0];

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
              attendDate = moment(
                record.join_time.split("T")[0],
                "YYYY-MM-DD"
              ).format("DD-MM-YYYY");
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

            summary[userId].studentAttended = this.attendanceTypes.PARTIAL;
          }
        }

        for (let student of students) {
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

  validateStudentStartDate(): boolean {
    return false;
  }
}
