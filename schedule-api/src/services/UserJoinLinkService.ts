import { getRepository, getManager, createQueryBuilder } from "typeorm";
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
    const students = await getManager()
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

    return students;
  }

  async generateStudentsJoinLink(): Promise<any> {
    const data = await this.getStudentWithoutCorrectJoinLink();

    return data;
  }
}
