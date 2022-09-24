import { getRepository, getManager } from "typeorm";
import { User } from "../entity/User";
import { ZoomMeeting } from "../entity/ZoomMeeting";
import { Classes } from "../entity/Classes";
import { BatchStudent } from "../entity/BatchStudent";
import { UserZoomLink } from "../entity/UserZoomLink";
import zoomClient from "../utils/zoom/zoomClient";
import { generateRandomCode } from "../utils/batch/getUniqueTeacherCode";
import { COSMOS_API } from "../helpers/Constants";
const { logger } = require("../Logger.js");
import LoggerService from "./LoggerService";
const moment = require("moment");
import axios from "../helpers/axios";

export class UserZoomLinkService {
  private userZoomLinkRepositroy = getRepository(UserZoomLink);
  private userRepository = getRepository(User);
  private batchRepository = getRepository(Classes);
  private batchStudentRepository = getRepository(BatchStudent);
  private emailFormat = "@CODE.student.queensenglish.co";
  public request: any = {};
  private logger = new LoggerService();
  private today: string = moment().format("YYYY-MM-DD");

  UserZoomLinkService() {}

  async getStudentWithoutCorrectJoinLink(batchData: any = {}): Promise<any[]> {
    const customWhere = `${
      batchData?.batchNumber
        ? `AND batch.batchNumber = '${batchData.batchNumber}'`
        : ""
    }`;
    return await getManager()
      .createQueryBuilder(BatchStudent, "batch_students")
      .leftJoinAndSelect(Classes, "batch", "batch.id = batch_students.batchId")
      .leftJoinAndSelect(User, "user", "user.id = batch_students.studentId")
      .leftJoinAndSelect(
        ZoomMeeting,
        "meeting",
        "meeting.batch_id = batch_students.batchId"
      )
      .leftJoinAndSelect(
        UserZoomLink,
        "join_link",
        "meeting.id = join_link.meeting_id AND join_link.id = batch_students.studentId AND join_link.batch_id = batch.id"
      )
      .where(`meeting.id IS NOT NULL AND join_link.id IS NULL ${customWhere}`)
      .getRawMany();
  }

  async generateStudentsJoinLink(batchData: any = {}): Promise<any> {
    const result = {
      errors: 0,
      success: 0,
      successSync: 0,
      errorSync: 0,
      logs: [],
    };
    try {
      const students = await this.getStudentWithoutCorrectJoinLink(batchData);

      logger.info(
        `UserZoomLinkService::generateStudentsJoinLink start generating links for ${students.length}`
      );

      let counter = 0;

      for (let student of students) {
        counter += 1;
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
          logger.info(
            `UserZoomLinkService::generateStudentsJoinLink start generating join link for student ${student.user_id}`
          );

          let email: string = "";

          const previousRecord: any = await this.userZoomLinkRepositroy.findOne(
            student.user_id
          );

          if (
            previousRecord &&
            previousRecord?.email &&
            this.today !== previousRecord?.last_daily_exhausted_error
          ) {
            email = previousRecord.email;
          } else {
            email =
              student.user_id +
              this.emailFormat.replace("CODE", generateRandomCode());
          }

          const registrantUser = {
            first_name: student.user_firstName,
            last_name: student.user_lastName,
            email,
            purchasing_time_frame: "No timeframe",
          };

          const createdRegisterantUser: any =
            await zoomClient.addMeetingRegistrant(
              student.meeting_id,
              registrantUser
            );

          if (createdRegisterantUser.registrant_id) {
            const join_link: any = {
              id: student.user_id,
              join_url: createdRegisterantUser.join_url,
              registrant_id: createdRegisterantUser.registrant_id,
              email,
              meeting_id: student.meeting_id,
              batch_id: student.batch_id,
              last_daily_exhausted_error: null,
              updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };

            if (!previousRecord) {
              join_link.created_at = moment().format("YYYY-MM-DD HH:mm:ss");
            }

            const lengthText = `${counter} Out Of ${students.length}`;

            const code = student.user_userCode;

            const type = "us";

            const link = join_link.join_url;

            await axios.post(COSMOS_API.STORE_SHORT_LINK, {
              id: type + "-" + code,
              link,
            });

            await (
              await this.logger.customZoom(
                student.user_id,
                `Success Sync zoom join meeting for batch ${student.batch_batchNumber} student: ${registrantUser.first_name} ${registrantUser.last_name}, 
                    code: ${code}, ${lengthText}`,
                "SUCCESS_REDIRECT_TO_ZOOM_MEETING_" + type.toUpperCase(),
                { join_link, student },
                this.request.user || {}
              )
            ).save();

            result.successSync += 1;

            const createdJoinLink = await this.userZoomLinkRepositroy.save(
              join_link
            );

            if (createdJoinLink.id) {
              result.success += 1;
              await (
                await this.logger.customZoom(
                  student.user_id,
                  "Success generated student join link: " +
                    createdJoinLink.id +
                    ", " +
                    lengthText,
                  "SUCCESS_GENERATED_STUDENT_JOIN_LINK",
                  {
                    createdRegisterantUser,
                    createdJoinLink,
                    student,
                    previousRecord,
                  },
                  this.request.user || {}
                )
              ).save();
            }

            logger.info(
              `UserZoomLinkService::generateStudentsJoinLink completed generating join link for student ${createdJoinLink.id}`
            );

            continue;
          }

          if (parseInt(createdRegisterantUser?.code) === 429) {
            // retry if got rate limit error
            students.push(student);
            const last_daily_exhausted_error = this.today;
            await this.userZoomLinkRepositroy.update(student.user_id, {
              last_daily_exhausted_error,
            });
          }
          throw new Error(
            `student: ${student.user_id} error: ${createdRegisterantUser?.message}`
          );
        } catch (e) {
          logger.error(e.message);
          result.errors += 1;
          await (
            await this.logger.customZoom(
              student.user_id,
              "Failed to generate student join link: " + e.message,
              "FAILED_TO_GENERATE_STUDENT_JOIN_LINK",
              { error: e, message: e.message, student },
              this.request.user || {}
            )
          ).save();
          result.logs.push(e.message);
        }
      }
    } catch (e) {
      logger.error(e.message);
      await (
        await this.logger.customZoom(
          "FAILED_TO_GENERATE_STUDENTS_JOIN_LINK_OVERALL",
          "Failed to generate students join link: " + e.message,
          "FAILED_TO_GENERATE_STUDENTS_JOIN_LINK_OVERALL",
          { error: e, message: e.message },
          this.request.user || {}
        )
      ).save();
      result.logs.push(e.message);
    }

    await (
      await this.logger.customZoom(
        "GENERATE_STUDENTS_JOIN_LINK_RESULT",
        "Generate students join link result",
        "GENERATE_STUDENTS_JOIN_LINK_RESULT",
        { result },
        this.request.user || {}
      )
    ).save();

    return result;
  }

  async redirectUniqueStudent(userCode: string): Promise<any> {
    let result: { link?: string; error?: boolean } = {};

    try {
      const user = await this.userRepository.findOne({ userCode });

      let meeting: any;

      if (!user) {
        throw new Error(`User ${userCode} Not Found.`);
      }

      const studentRecord = await this.batchStudentRepository.findOne({
        studentId: user.id,
      });

      if (!studentRecord) {
        throw new Error(`Student Record ${user.id} Not Found.`);
      }

      const batch = await this.batchRepository.findOne({
        id: studentRecord.batchId,
      });

      const batchCode = batch?.classCode;

      if (!batch) {
        throw new Error(`Batch ${studentRecord.batchId} Not Found.`);
      }

      if (batch.useNewZoomLink) {
        meeting = await this.userZoomLinkRepositroy.findOne({
          id: user.id,
        });

        if (!meeting) {
          throw new Error(`User ${userCode} Doesn't Have A Join Link.`);
        }
        result.link = meeting.join_url;
      } else {
        result.link = batch.zoomLink;
      }

      if (!result.link) {
        throw new Error(
          `Student ${userCode} and batch ${batchCode} Doesn't Have A Link.`
        );
      }

      await (
        await this.logger.customZoom(
          batch.batchNumber,
          `Success redirect to zoom meeting for unique student: ${user?.firstName} ${user?.lastName} Batch: ${batch.batchNumber}, Code: ${batchCode}`,
          "SUCCESS_REDIRECT_TO_ZOOM_MEETING_UNQIUE_STUDENT",
          { meeting, batch, user },
          this.request.user || {
            email: user?.email,
          }
        )
      ).save();
    } catch (e) {
      console.log(e);
      logger.error(
        "Failed to redirect to zoom meeting for unique student: " + e.message
      );
      await (
        await this.logger.customZoom(
          userCode,
          "Failed to redirect to zoom meeting for unqiue student: " + e.message,
          "FAILED_TO_REDIRECT_TO_ZOOM_MEETING_UNIQUE_STUDENT",
          { error: e, message: e.message },
          this.request.user || {}
        )
      ).save();
      result.error = true;
    }

    return result;
  }
}
