import { getRepository, getManager } from "typeorm";
import { User } from "../entity/User";
import { ZoomUser } from "../entity/ZoomUser";
import { ZoomMeeting } from "../entity/ZoomMeeting";
import { Classes } from "../entity/Classes";
const { logger } = require("../Logger.js");
import LoggerService from "./LoggerService";
const moment = require("moment");
import zoomClient from "./../utils/zoom/zoomClient";

export class ZoomMeetingService {
  private usersRepository = getRepository(User);
  private zoomUserRepository = getRepository(ZoomUser);
  private zoomMeetingRepository = getRepository(ZoomMeeting);

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
        .leftJoinAndSelect(
          ZoomMeeting,
          "meeting",
          "meeting.batch_id = batch.id"
        )
        .where(
          `user.id IS NOT NULL AND meeting.id IS NULL AND batch.classEndDate >= '${moment().format(
            "YYYY-MM-DD"
          )}'`
        )
        .getMany();

      const batchesNeedsTeacherLicense = await getManager()
        .createQueryBuilder(Classes, "batch")
        .leftJoinAndSelect(ZoomUser, "user", "batch.teacherId = user.user_id")
        .leftJoinAndSelect(
          ZoomMeeting,
          "meeting",
          "meeting.batch_id = batch.id"
        )
        .where(
          `user.id IS NULL AND meeting.id IS NULL AND batch.classEndDate >= '${moment().format(
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
        .leftJoinAndSelect(
          ZoomMeeting,
          "meeting",
          "meeting.batch_id = batch.id"
        )
        .where(`user.id IS NOT NULL AND meeting.id IS NULL`)
        .getMany();

      const batchesNeedsTeacherLicense = await getManager()
        .createQueryBuilder(Classes, "batch")
        .leftJoinAndSelect(ZoomUser, "user", "batch.teacherId = user.user_id")
        .leftJoinAndSelect(
          ZoomMeeting,
          "meeting",
          "meeting.batch_id = batch.id"
        )
        .where(`user.id IS NULL AND meeting.id IS NULL`)
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

  async updateCreateZoomMeeting(data: ZoomMeeting): Promise<any> {
    try {
      logger.info("create zoom meeting ", data);
      return await this.zoomMeetingRepository.save(data);
    } catch (e) {
      logger.error(e);
      return false;
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
        const zoomUser = await this.zoomUserRepository.findOne({
          where: { user_id: batch.teacherId },
        });
        await zoomClient.setUser(zoomUser);
        // const startLessonTime = moment(batch.lessonStartTime); //now
        // const endLessonTime = moment(batch.lessonEndTime);
        // const duration = startLessonTime.diff(endLessonTime, "minutes");

        const meeting = {
          agenda: batch.batchNumber,
          default_password: false,
          // duration: duration,
          password: "QE",
          // pre_schedule: true,
          settings: {
            approval_type: 2,
            join_before_host: true,
            meeting_authentication: false,
            waiting_room: false,
            auto_recording: "cloud",
          },
          waiting_room: false,
          start_time: batch.lessonStartTime,
          topic:
            "Batch: " +
            batch.batchNumber +
            `, Teacher: ${zoomUser.first_name} ${zoomUser.last_name}.`,
          type: 2,
        };
        const createdMeeting = await zoomClient.createUserMeeting(meeting);
        if (createdMeeting.id) {
          logger.info("Success created meeting remotely ", createdMeeting);
          const zoomMeeting = new ZoomMeeting();
          zoomMeeting.id = createdMeeting.id;
          zoomMeeting.uuid = createdMeeting.uuid;
          zoomMeeting.start_url = createdMeeting.start_url;
          zoomMeeting.host_id = createdMeeting.host_id;
          zoomMeeting.join_url = createdMeeting.join_url;
          zoomMeeting.password = createdMeeting.password;
          zoomMeeting.user_id = zoomUser.user_id;
          zoomMeeting.batch_id = batch.id;
          zoomMeeting.meeting = JSON.stringify(createdMeeting);
          zoomMeeting.created_at = new Date();
          zoomMeeting.updated_at = new Date();
          await this.updateCreateZoomMeeting(zoomMeeting);
          logger.info("Success created zoom meeting locally ", createdMeeting);
          result.created++;
          await (
            await this.logger.zoom(
              { zoomUser },
              {
                zoomUser,
                zoomMeeting,
                user: { ...zoomUser, id: zoomUser.user_id },
              },
              this.request.user || {}
            )
          ).save();
        } else {
          logger.info("Failed to teacher zoom account ", createdMeeting);
          result.error++;
          result.errors.push(createdMeeting);
          await (
            await this.logger.customZoom(
              zoomUser.user_id,
              "Failed to create meeting link",
              "FAILED_TO_CREATED_BATCH_MEETING",
              {
                batch,
                zoomUser,
                zoomMeeting: createdMeeting,
                user: { ...zoomUser, id: zoomUser.user_id },
              },
              this.request.user || {}
            )
          ).save();
          continue;
        }
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
