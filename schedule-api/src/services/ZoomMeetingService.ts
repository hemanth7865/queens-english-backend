import { getRepository, getManager, createQueryBuilder } from "typeorm";
import { User } from "../entity/User";
import { ZoomUser } from "../entity/ZoomUser";
import { ZoomMeeting } from "../entity/ZoomMeeting";
import { ZoomUserService } from "./ZoomUsersService";
import { Classes } from "../entity/Classes";
const { logger } = require("../Logger.js");
import LoggerService from "./LoggerService";
const moment = require("moment");
import zoomClient from "./../utils/zoom/zoomClient";
import { generatePagiantionAndConditions } from "../utils/helpers";

export class ZoomMeetingService {
  private usersRepository = getRepository(User);
  private zoomUserRepository = getRepository(ZoomUser);
  private zoomMeetingRepository = getRepository(ZoomMeeting);
  private classesRepository = getRepository(Classes);
  public zoomMeetingTypes = {
    RESCHEDULED_MEETING: 2,
  };
  public zoomMeetingApproveType = {
    NO_REGISTRATION_REQUIRED: 2,
  };

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

  getCreateMeetingDetails(batch: Classes, zoomUser: ZoomUser) {
    return {
      agenda: batch.batchNumber,
      default_password: false,
      duration: 24 * 60 * 60,
      password: "QE",
      // pre_schedule: true,
      settings: {
        approval_type: this.zoomMeetingApproveType.NO_REGISTRATION_REQUIRED,
        join_before_host: true,
        meeting_authentication: false,
        waiting_room: false,
        auto_recording: "cloud",
      },
      waiting_room: false,
      start_time: batch.lessonStartTime,
      breakout_room: {
        enable: true,
      },
      co_host: true,
      topic:
        "Batch: " +
        batch.batchNumber +
        `, Teacher: ${zoomUser.first_name} ${zoomUser.last_name}.`,
      type: this.zoomMeetingTypes.RESCHEDULED_MEETING,
    };
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

        const meeting = this.getCreateMeetingDetails(batch, zoomUser);
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

  async reassignZoomMeeting(meetingId: string, userId: string): Promise<any> {
    let error;
    try {
      const meeting = await this.zoomMeetingRepository.findOne({
        id: meetingId,
      });

      if (!meeting) {
        throw new Error("Meeting Not Found");
      }

      const zoomUser: any = await this.zoomUserRepository.findOne({
        user_id: userId,
      });

      if (!zoomUser) {
        throw new Error("Selected User Not Found, Or Doesn't Have License");
      }

      const batch = await this.classesRepository.findOne(meeting.batch_id);

      if (!batch) {
        throw new Error("Selected Meeting Batch Not Found");
      }

      await this.zoomMeetingRepository.delete(meeting);

      const created = await this.generateZoomLinks([batch]);

      if (created.created > 0) {
        zoomUser.message = `Reassigned Zoom Link && Batch: ${batch?.batchNumber} to: ${zoomUser?.first_name} ${zoomUser.last_name}.`;
        await(
          await this.logger.zoom(
            { user: zoomUser },
            { zoomUser: zoomUser, user: zoomUser },
            this.request.user || {}
          )
        ).save();

        return {
          status: true,
          message: "Success Reassigned License",
        };
      }

      error = {
        message: "Failed to update zoom eeting on zoom API",
        meeting,
        zoomUser,
      };
    } catch (e) {
      error = e;
    }

    await (
      await this.logger.customZoom(
        userId,
        `Reassign Failed: ${error.message}`,
        "FAILED_MEETING_REASSIGNMENT",
        { error, meetingId, to: userId },
        this.request.user || {}
      )
    ).save();

    return { status: 400, message: error.message };
  }

  async generateActiveBatchesZoomLink(): Promise<{
    created: number;
    error: number;
    errors: any;
  }> {
    const batches = await this.getActiveBatchesWithoutZoomLink();
    return await this.generateZoomLinks(batches.batches);
  }

  async listZoomMeetings(
    parameters: { current?: string; pageSize?: string } = {}
  ): Promise<any> {
    try {
      const { current, limit, offsetRecords, condition } =
        generatePagiantionAndConditions(parameters);

      const query = await createQueryBuilder(ZoomMeeting, "meeting")
        .leftJoinAndSelect("meeting.batch", "batch")
        .leftJoinAndSelect("meeting.zoom_user", "zoom_user")
        .where(condition);

      const data = await query.offset(offsetRecords).limit(limit).getMany();
      const total = await query.getCount();

      return {
        success: true,
        pageSize: limit,
        current,
        total,
        data,
        status: 200,
      };
    } catch (e) {
      logger.error(e);
      return { status: 400, message: e.message };
    }
  }

  async generateUpdateZoomMeetingLicenseForBatch(batchData): Promise<any> {
    try {
      const batch = await this.classesRepository.findOne({
        batchNumber: batchData.batchNumber,
      });

      const teacher = batch.teacherId;
      const user = await this.usersRepository.findOne({ id: teacher });
      const batchId = batch.id;
      const zoomUserService = new ZoomUserService();
      let license = await this.zoomUserRepository.findOne({
        user_id: teacher,
      });
      let meeting = await this.zoomMeetingRepository.findOne({
        batch_id: batchId,
      });

      /**
       * Batch already has meeting and same teacher
       */
      if (meeting && meeting.user_id === teacher) {
        return {
          success: true,
          message: "Batch Already Has Zoom Meeting And Teacher",
        };
      }

      /**
       * selected teacher doesn't have a license
       */
      if (!license) {
        const result = await zoomUserService.generateLicenses([user]);
        if (result.created < 1) {
          throw new Error("Failed to generate license");
        }
        license = await this.zoomUserRepository.findOne({
          user_id: teacher,
        });
      }

      /**
       * generate the meeting
       */
      if (!meeting) {
        const result = await this.generateZoomLinks([batch]);
        if (result.created < 1) {
          throw new Error("Failed to generate meeting");
        }
        meeting = await this.zoomMeetingRepository.findOne({
          batch_id: batchId,
        });
      }

      /**
       * reassign the meeting to other teacher
       */
      if (meeting.user_id !== teacher) {
        const result = await this.reassignZoomMeeting(meeting.id, teacher);
        if (result.status === 400) {
          throw new Error("Failed to reassing zoom meeting");
        }
      }

      const result = {
        success: true,
        meeting,
        license,
        user,
      };

      return result;
    } catch (e) {
      logger.error(`Failed to assign zoom link to batch: ${e.message}`);
      await (
        await this.logger.customZoom(
          batchData.batchNumber,
          "Failed to assign zoom meeting to batch: " + e.message,
          "FAILED_TO_ASSIGN_ZOOM_MEETING_TO_BATCH",
          { error: e, message: e.message, batch: batchData },
          this.request.user || {}
        )
      ).save();
      return {
        success: false,
        message: e.message,
        e,
      };
    }
  }

  async redirectStudent(classCode: string): Promise<any> {
    let result: { link?: string; error?: boolean } = {};

    try {
      const batch = await this.classesRepository.findOne({
        classCode,
      });

      let meeting: any;

      if (!batch) {
        throw new Error(`Batch ${classCode} Not Found.`);
      }

      const teacher = await this.usersRepository.findOne(batch.teacherId);

      if (batch.useNewZoomLink) {
        meeting = await this.zoomMeetingRepository.findOne({
          batch_id: batch.id,
        });

        if (!meeting) {
          throw new Error(`Batch ${classCode} Doesn't Have A Meeting.`);
        }

        result.link = meeting.join_url;
      } else {
        result.link = batch.zoomLink;
      }

      if (!result.link) {
        throw new Error(`Batch ${classCode} Doesn't Have A Link.`);
      }

      await (
        await this.logger.customZoom(
          classCode,
          `Success redirect to zoom meeting for student: ${teacher?.firstName} ${teacher?.lastName} Batch: ${batch.batchNumber}`,
          "SUCCESS_REDIRECT_TO_ZOOM_MEETING_STUDENT",
          { meeting, batch, teacher },
          this.request.user || {
            email: batch.batchNumber,
          }
        )
      ).save();
    } catch (e) {
      console.log(e);
      logger.error(
        "Failed to redirect to zoom meeting for student: " + e.message
      );
      await (
        await this.logger.customZoom(
          classCode,
          "Failed to redirect to zoom meeting for student: " + e.message,
          "FAILED_TO_REDIRECT_TO_ZOOM_MEETING_STUDENT",
          { error: e, message: e.message },
          this.request.user || {}
        )
      ).save();
      result.error = true;
    }

    return result;
  }

  async redirectTeacher(teacherCode: string): Promise<any> {
    let result: { link?: string; error?: boolean } = {};

    try {
      const batch = await this.classesRepository.findOne({
        teacherCode,
      });

      let meeting: any;

      if (!batch) {
        throw new Error(`Batch ${teacherCode} Not Found.`);
      }

      const teacher = await this.usersRepository.findOne(batch.teacherId);

      if (batch.useNewZoomLink) {
        meeting = await this.zoomMeetingRepository.findOne({
          batch_id: batch.id,
        });

        if (!meeting) {
          throw new Error(`Batch ${teacherCode} Doesn't Have A Meeting.`);
        }

        const user = await this.zoomUserRepository.findOne({
          user_id: meeting.user_id,
        });
        if (!user) {
          throw new Error(`Teacher ${meeting.user_id} Doesn't Have A License.`);
        }
        result.link =
          meeting.start_url.split("?")[0] + "?zak=" + user.zak_token;
      } else {
        result.link = batch.zoomLink;
      }

      if (!result.link) {
        throw new Error(`Batch ${teacherCode} Doesn't Have A Link.`);
      }

      await (
        await this.logger.customZoom(
          teacherCode,
          `Success redirect to zoom meeting for teacher: ${teacher?.firstName} ${teacher?.lastName} Batch: ${batch.batchNumber}`,
          "SUCCESS_REDIRECT_TO_ZOOM_MEETING_TEACHER",
          { meeting, batch, teacher },
          this.request.user || {
            email: teacher?.email,
          }
        )
      ).save();
    } catch (e) {
      console.log(e);
      logger.error(
        "Failed to redirect to zoom meeting for teacher: " + e.message
      );
      await (
        await this.logger.customZoom(
          teacherCode,
          "Failed to redirect to zoom meeting for teacher: " + e.message,
          "FAILED_TO_REDIRECT_TO_ZOOM_MEETING_TEACHER",
          { error: e, message: e.message },
          this.request.user || {}
        )
      ).save();
      result.error = true;
    }

    return result;
  }

  async getZoomMeetingsCSV(): Promise<any> {
    try {
      const meetings = await createQueryBuilder(ZoomMeeting, "zoom_meeting")
        .leftJoinAndSelect("zoom_meeting.batch", "batch")
        .leftJoinAndSelect("zoom_meeting.zoom_user", "zoom_user")
        .getMany();

      if (meetings.length > 0) {
        const headers: { title: string; callBack?: any; key?: string }[] = [
          {
            title: "Batch",
            callBack(e) {
              return e.batch?.batchNumber || "Not Found";
            },
          },
          {
            title: "Teacher",
            callBack(e) {
              return e.zoom_user?.first_name + " " + e.zoom_user?.last_name;
            },
          },
          {
            title: "Old Zoom Link",
            callBack(e) {
              return e.batch?.zoomLink || "Not Found";
            },
          },
          {
            title: "Teacher Generic Link",
            callBack(e) {
              return `${process.env.ZOOM_GENERIC_LINK}c/t/${
                e.batch?.teacherCode || "NOT_FOUND"
              }`;
            },
          },
          {
            title: "Student Generic Link",
            callBack(e) {
              return `${process.env.ZOOM_GENERIC_LINK}c/s/${
                e.batch?.classCode || "NOT_FOUND"
              }`;
            },
          },
          {
            title: "New Zoom Teacher Link",
            callBack(e) {
              return (
                e.start_url.split("?")[0] + `?zak=${e.zoom_user.zak_token}`
              );
            },
          },
          {
            title: "New Zoom Student Link",
            callBack(e) {
              return e.join_url;
            },
          },
          {
            title: "Batch ID",
            callBack(e) {
              return e.batch_id;
            },
          },
          {
            title: "Teacher ID",
            callBack(e) {
              return e.user_id;
            },
          },
        ];

        let csv = [];
        csv.push('"' + headers.map((i) => i.title).join('","') + '"');
        for (let k of meetings) {
          let row = [];
          if (!k.batch) {
            continue;
          }
          for (let head of headers) {
            if (head.callBack) {
              row.push(head.callBack(k));
            } else if (head.key) {
              row.push(k[head.key]);
            }
          }
          csv.push('"' + row.join('","') + '"');
        }

        return csv.join("\n");
      }
    } catch (e) {
      logger.error(`Failed to get zoom meetings csv: ${e.message}`);
      await (
        await this.logger.customZoom(
          "",
          "Failed to get zoom meetings csv: " + e.message,
          "FAILED_TO_GET_ZOOM_MEETINGS_CSV",
          { error: e, message: e.message },
          this.request.user || {}
        )
      ).save();
      return {
        success: false,
        message: e.message,
        e,
      };
    }
  }
}
