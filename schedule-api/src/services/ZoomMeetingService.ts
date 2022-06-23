import { getRepository, getManager } from "typeorm";
import { User } from "../entity/User";
import { ZoomUser } from "../entity/ZoomUser";
import { Classes } from "../entity/Classes";
const { logger } = require("../Logger.js");
import LoggerService from "./LoggerService";
const moment = require("moment");
import zoomClient from "./../utils/zoom/zoomClient";

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

  async generateZoomLinks(batches: Classes[]): Promise<{
    created: number;
    error: number;
    errors: any;
  }> {
    const result = {
      created: 0,
      error: 0,
      errors: [],
    };
    for (let batch of batches) {
      try {
        logger.info("Start creating zoom meeting ", batch);
        // const zoomUser = new ZoomUser();
        // zoomUser.user_id = teacher.id;
        // const createdUser = await zoomClient.createCustUser({
        //   email: `${zoomUser.user_id}@queensenglish.co`,
        //   type: 2,
        //   first_name: teacher.firstName,
        //   last_name: teacher.lastName,
        // });
        // if (createdUser.id) {
        //   logger.info(
        //     "Success created teacher zoom account remotely ",
        //     createdUser
        //   );
        //   zoomUser.id = createdUser.id;
        //   zoomUser.first_name = createdUser.first_name;
        //   zoomUser.last_name = createdUser.last_name;
        //   zoomUser.email = createdUser.email;
        //   zoomUser.type = createdUser.type;
        //   zoomUser.created_at = new Date();
        //   zoomUser.updated_at = new Date();
        //   await this.updateCreateZoomUser(zoomUser);
        //   logger.info(
        //     "Success created teacher zoom account locally ",
        //     createdUser
        //   );
        //   result.created++;
        //   await (
        //     await this.logger.zoom(
        //       { user: teacher },
        //       { zoomUser: createdUser, user: teacher },
        //       this.request.user || {}
        //     )
        //   ).save();
        // } else {
        //   logger.info("Failed to teacher zoom account ", createdUser);
        //   result.error++;
        //   result.errors.push(createdUser);
        //   if (createdUser.code == 3412) {
        //     createdUser.message =
        //       "Stopped creating teacher accounts on zoom job, since there's no available licenses";
        //     await (
        //       await this.logger.zoom(
        //         { user: teacher },
        //         { zoomUser: createdUser, user: teacher },
        //         this.request.user || {}
        //       )
        //     ).save();
        //     break;
        //   } else {
        //     await (
        //       await this.logger.zoom(
        //         { user: teacher },
        //         { zoomUser: createdUser, user: teacher },
        //         this.request.user || {}
        //       )
        //     ).save();
        //   }

        //   continue;
        // }
      } catch (e) {
        logger.error(e);
        result.error++;
        result.errors.push(e);
      }

      await setTimeout(() => {}, 100);
    }
    return result;
  }

  async generateActiveBatchesZoomLink(): Promise<{
    created: number;
    error: number;
    errors: any;
  }> {
    const batches = await this.getActiveBatchesWithoutZoomLink();
    return await this.generateZoomLinks(batches.batches);
  }
}
