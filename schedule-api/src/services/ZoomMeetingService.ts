import { getRepository, getManager } from "typeorm";
import { User } from "../entity/User";
import { ZoomUser } from "../entity/ZoomUser";
import { Classes } from "../entity/Classes";
const { logger } = require("../Logger.js");
const { ZoomAPI } = require("zoomAPIClient");
import LoggerService from "./LoggerService";
const moment = require("moment");

const { ZOOM_API_KEY, ZOOM_API_SECRET } = process.env;
const zoomClient = new ZoomAPI(ZOOM_API_KEY, ZOOM_API_SECRET);
zoomClient.init();
export class ZoomMeetingService {
  private usersRepository = getRepository(User);
  private zoomUserRepository = getRepository(ZoomUser);
  public request: any = {};
  private logger = new LoggerService();

  ZoomMeetingService() {}

  async getActiveBatchesWithoutZoomLink(): Promise<{
    batches: Classes[];
    batchesNeedsTeacherLicense: Classes[];
  }> {
    try {
      const batches = await getManager()
        .createQueryBuilder(Classes, "batch")
        .leftJoinAndSelect(ZoomUser, "user", "batch.teacherId = user.user_id")
        .where(
          `user.id IS NOT NULL AND batch.classEndDate >= '${moment().format(
            "YYYY-MM-DD"
          )}'`
        )
        .getMany();

      const batchesNeedsTeacherLicense = await getManager()
        .createQueryBuilder(Classes, "batch")
        .leftJoinAndSelect(ZoomUser, "user", "batch.teacherId = user.user_id")
        .where(
          `user.id IS NULL AND batch.classEndDate >= '${moment().format(
            "YYYY-MM-DD"
          )}'`
        )
        .getMany();
      await (
        await this.logger.customZoom(
          "BATCHES_WITHOUT_MEETING_URL",
          `You have ${batches.length} Active Batches That Don't Have Meeting Link But Has Assigned Licensed Teacher, And ${batchesNeedsTeacherLicense.length} That Don't Have Meeting Link Nor Assigned Licensed Teacher`,
          "ACTIVE_BATCHES_WITHOUT_MEETING_URL",
          {},
          this.request?.user
        )
      ).save();
      return { batches, batchesNeedsTeacherLicense };
    } catch (e) {
      logger.error(e);
      logger.error(`Failed To Get Batches ${e.message}`);
      await (
        await this.logger.customZoom(
          "NOT_FOUND",
          `Failed To Fetch Batches Without Zoom Link: ${e.message}`,
          "ZOOM_FAILED_TO_FETCH_BATCHES",
          { e },
          this.request?.user
        )
      ).save();
      return {
        batches: [],
        batchesNeedsTeacherLicense: [],
      };
    }
  }

  async getBatchesWithoutZoomLink(): Promise<{
    batches: Classes[];
    batchesNeedsTeacherLicense: Classes[];
  }> {
    try {
      const batches = await getManager()
        .createQueryBuilder(Classes, "batch")
        .leftJoinAndSelect(ZoomUser, "user", "batch.teacherId = user.user_id")
        .where(`user.id IS NOT NULL`)
        .getMany();

      const batchesNeedsTeacherLicense = await getManager()
        .createQueryBuilder(Classes, "batch")
        .leftJoinAndSelect(ZoomUser, "user", "batch.teacherId = user.user_id")
        .where(`user.id IS NULL`)
        .getMany();

      await (
        await this.logger.customZoom(
          "BATCHES_WITHOUT_MEETING_URL",
          `You have ${batches.length} Batches That Don't Have Meeting Link But Has Assigned Licensed Teacher, And ${batchesNeedsTeacherLicense.length} That Don't Have Meeting Link Nor Assigned Licensed Teacher`,
          "ALL_BATCHES_WITHOUT_MEETING_URL",
          {},
          this.request?.user
        )
      ).save();

      return { batches, batchesNeedsTeacherLicense };
    } catch (e) {
      logger.error(e);
      logger.error(`Failed To Get Batches ${e.message}`);
      await (
        await this.logger.customZoom(
          "NOT_FOUND",
          `Failed To Fetch Batches Without Zoom Link: ${e.message}`,
          "ZOOM_FAILED_TO_FETCH_BATCHES",
          { e },
          this.request?.user
        )
      ).save();
      return {
        batches: [],
        batchesNeedsTeacherLicense: [],
      };
    }
  }
}
