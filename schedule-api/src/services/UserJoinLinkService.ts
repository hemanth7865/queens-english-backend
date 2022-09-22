import { getRepository, getManager } from "typeorm";
import { User } from "../entity/User";
import { ZoomUser } from "../entity/ZoomUser";
import { ZoomMeeting } from "../entity/ZoomMeeting";
import { Classes } from "../entity/Classes";
import { BatchStudent } from "../entity/BatchStudent";
import { UserJoinLinks } from "../entity/UserJoinLinks";
import zoomClient from "../utils/zoom/zoomClient";
import { ZoomMeetingService } from "./ZoomMeetingService";
const { logger } = require("../Logger.js");
import LoggerService from "./LoggerService";
const moment = require("moment");

export class UserJoinLinkService {
  private usersRepository = getRepository(User);
  private zoomUserRepository = getRepository(ZoomUser);
  private zoomMeetingRepository = getRepository(ZoomMeeting);
  private batchRepository = getRepository(Classes);
  private userJoinLinksRepositroy = getRepository(UserJoinLinks);
  private zoomMeetingService = new ZoomMeetingService();
  private emailFormat = "@student.queensenglish.co";
  private debug: boolean = true;
  public request: any = {};
  private logger = new LoggerService();

  UserJoinLinkService() {}

  async getStudentWithoutCorrectJoinLink(): Promise<any[]> {
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
      .where(`meeting.id IS NOT NULL AND join_link.id IS NULL`)
      .getRawMany();
  }

  async generateStudentsJoinLink(): Promise<any> {
    const result = {
      errors: 0,
      success: 0,
      logs: [],
    };
    try {
      const students = await this.getStudentWithoutCorrectJoinLink();

      for (let student of students) {
        const email = student.user_id + this.emailFormat;

        const registrantUser = {
          first_name: student.user_firstName,
          last_name: student.user_lastName,
          email,
        };

        const createdRegisterantUser: {
          id: number;
          join_url: string;
          registrant_id: string;
        } = await zoomClient.addMeetingRegistrant(
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
          };

          const createdJoinLink = await this.userJoinLinksRepositroy.save(
            join_link
          );

          if (createdJoinLink.id) {
            result.success += 1;
          }
        }

        break;
      }
    } catch (e) {
      result.logs.push(e.message);
    }

    return result;
  }
}
