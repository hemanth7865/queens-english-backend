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

export class ZoomAttendanceService {
  private userZoomLinkRepositroy = getRepository(UserZoomLink);
  private userRepository = getRepository(User);
  private batchRepository = getRepository(Classes);
  private batchStudentRepository = getRepository(BatchStudent);
  public request: any = {};
  private logger = new LoggerService();
  private today: string = moment().format("YYYY-MM-DD");

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
      .where(`batch.id IS NOT NULL AND join_link.id IS NULL ${customWhere}`)
      .getRawMany();
  }

  async syncAttendance(): Promise<any> {
    const result = {
      success: 0,
      error: 0,
      log: [],
    };

    const meetings = await this.getMeetings();

    for (const meeting of meetings) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      console.log(meeting);
    }

    return result;
  }
}
