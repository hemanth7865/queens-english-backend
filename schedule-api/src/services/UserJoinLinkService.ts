import { getRepository, getManager } from "typeorm";
import { User } from "../entity/User";
import { ZoomUser } from "../entity/ZoomUser";
import { ZoomMeeting } from "../entity/ZoomMeeting";
import { Classes } from "../entity/Classes";
import { BatchStudent } from "../entity/BatchStudent";
import { UserJoinLinks } from "../entity/UserJoinLinks";
import zoomClient from "../utils/zoom/zoomClient";
import { ZoomMeetingService } from "./ZoomMeetingService";
import { generateRandomCode } from "../utils/batch/getUniqueTeacherCode";
const { logger } = require("../Logger.js");
import LoggerService from "./LoggerService";
const moment = require("moment");

export class UserJoinLinkService {
  private userJoinLinksRepositroy = getRepository(UserJoinLinks);
  private emailFormat = "@CODE.student.queensenglish.co";
  public request: any = {};
  private logger = new LoggerService();
  private today: string = moment().format("YYYY-MM-DD");

  UserJoinLinkService() {}

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
        UserJoinLinks,
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
      logs: [],
    };
    try {
      const students = await this.getStudentWithoutCorrectJoinLink(batchData);

      logger.info(
        `UserJoinLinkService::generateStudentsJoinLink start generating links for ${students.length}`
      );

      for (let student of students) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
          logger.info(
            `UserJoinLinkService::generateStudentsJoinLink start generating join link for student ${student.user_id}`
          );

          let email: string = "";

          const previousRecord: any =
            await this.userJoinLinksRepositroy.findOne(student.user_id);

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
          };

          const createdRegisterantUser: any =
            await zoomClient.addMeetingRegistrant(
              student.meeting_id,
              registrantUser
            );

          if (createdRegisterantUser.registrant_id) {
            const join_link = {
              id: student.user_id,
              join_url: createdRegisterantUser.join_url,
              registrant_id: createdRegisterantUser.registrant_id,
              email,
              meeting_id: student.meeting_id,
              batch_id: student.batch_id,
              last_daily_exhausted_error: null,
            };

            const createdJoinLink = await this.userJoinLinksRepositroy.save(
              join_link
            );

            if (createdJoinLink.id) {
              result.success += 1;
              await (
                await this.logger.customZoom(
                  student.user_id,
                  "Success generated student join link: " + createdJoinLink.id,
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
              `UserJoinLinkService::generateStudentsJoinLink completed generating join link for student ${createdJoinLink.id}`
            );

            continue;
          }

          if (
            createdRegisterantUser?.message?.split(
              "the daily rate limit of (3) for"
            )[1]
          ) {
            const last_daily_exhausted_error = this.today;
            await this.userJoinLinksRepositroy.update(student.user_id, {
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
}
