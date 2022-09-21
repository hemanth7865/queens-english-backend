import { getRepository, getManager, createQueryBuilder } from "typeorm";
import { User } from "../entity/User";
import { ZoomUser } from "../entity/ZoomUser";
import { ZoomMeeting } from "../entity/ZoomMeeting";
import { Classes } from "../entity/Classes";
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

  async generateStudentsJoinLink(): Promise<any> {}
}
