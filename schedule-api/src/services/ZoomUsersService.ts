import { getRepository, getManager, createQueryBuilder } from "typeorm";
import { User } from "../entity/User";
import { ZoomUser } from "../entity/ZoomUser";
import { ZoomMeeting } from "../entity/ZoomMeeting";
import { Classes } from "../entity/Classes";
import zoomClient from "./../utils/zoom/zoomClient";
const { logger } = require("../Logger.js");
import LoggerService from "./LoggerService";
const moment = require("moment");

export class ZoomUserService {
  private usersRepository = getRepository(User);
  private zoomUserRepository = getRepository(ZoomUser);
  private zoomMeetingRepository = getRepository(ZoomMeeting);
  private batchRepository = getRepository(Classes);
  private emailFormat = "@ISV.queensenglish.co.com";
  private debug: boolean = true;
  public defaultUserSettings = {
    in_meeting: {
      allow_host_to_enable_focus_mode: true,
      breakout_room: true,
      breakout_room_schedule: true,
      co_host: true,
      waiting_room: false,
    },
    schedule_meeting: {
      audio_type: "both",
      join_before_host: true,
    },
    recording: {
      auto_recording: "cloud",
      cloud_recording: true,
      host_pause_stop_recording: false,
    },
  };
  public request: any = {};
  private logger = new LoggerService();

  ZoomUserService() {}

  async teachers(where: { type?: string } = {}): Promise<any> {
    where.type = "teacher";
    try {
      const teachers = await this.usersRepository.find({
        where,
      });
      return teachers;
    } catch (e) {
      logger.error(e);
      return false;
    }
  }

  async listZoomUsers(
    parameters: { current?: string; pageSize?: string } = {}
  ): Promise<any> {
    try {
      const current = parameters.current ? parseInt(parameters.current) : 0;
      const limit = parameters.pageSize ? parseInt(parameters.pageSize) : 0;
      const offsetRecords = (current - 1) * limit;

      const whereCondition: string[] = [];
      whereCondition.push(" 1 = 1 ");
      for (let param in parameters) {
        if (parameters[param].length < 1) {
          continue;
        }

        if (["current", "pageSize"].includes(param)) {
          continue;
        }
        if ([].includes(param)) {
          // custom operators
        } else {
          whereCondition.push(`${param} LIKE '%${parameters[param]}%'`);
        }
      }

      const condition =
        whereCondition.length > 1
          ? whereCondition.join(" and ")
          : whereCondition.toString();

      const query = await createQueryBuilder(ZoomUser, "zoom_user")
        .leftJoinAndSelect("zoom_user.meetings", "meetings")
        .leftJoinAndSelect("zoom_user.user", "user")
        .where(condition);

      const data = await query
        .offset(offsetRecords)
        .limit(limit)
        .orderBy("zoom_user.updated_at", "DESC")
        .getMany();
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

  async showZoomUser(id: string): Promise<any> {
    try {
      const query = await createQueryBuilder(ZoomUser, "zoom_user")
        .leftJoinAndSelect("zoom_user.meetings", "meetings")
        .leftJoinAndSelect("zoom_user.user", "user")
        .where(`zoom_user.id = "${id}"`);

      const data = await query.getOne();

      if (data?.meetings) {
        for (let meetingIndex in data.meetings) {
          const meetings = data.meetings[meetingIndex];
          data.meetings[meetingIndex].batch =
            await this.batchRepository.findOne(meetings.batch_id);
          data.meetings[meetingIndex].zoom_user =
            await this.zoomUserRepository.findOne(meetings.host_id);
        }
      }

      return {
        success: true,
        data,
      };
    } catch (e) {
      logger.error(e);
      return { status: 400, message: e.message };
    }
  }

  async zoomUsers(where = {}): Promise<any> {
    try {
      const users = await this.zoomUserRepository.find({
        where,
      });
      return users;
    } catch (e) {
      logger.error(e);
      return false;
    }
  }

  async getTeachersWithoutLicense(where: string = ""): Promise<User[]> {
    try {
      const teachers = await getManager()
        .createQueryBuilder(User, "teacher")
        .leftJoinAndSelect(ZoomUser, "user", "teacher.id = user.user_id")
        .where(`teacher.type = 'teacher' AND user.id IS NULL${where}`)
        .getMany();
      if (where.length < 1) {
        await (
          await this.logger.customZoom(
            "TEACHERS_WITHOUT_LICENSE",
            `You have ${teachers.length} Teachers That Don't Have Licensed Account On Zoom.`,
            "ALL_TEACHERS_WITHOUT_LICENSE",
            {},
            this.request?.user
          )
        ).save();
      }

      return teachers;
    } catch (e) {
      logger.error(e);
      return [];
    }
  }

  async getActiveTeachersWithoutLicense(): Promise<User[]> {
    try {
      const teachers = await getManager()
        .createQueryBuilder(User, "teacher")
        .leftJoinAndSelect(ZoomUser, "user", "teacher.id = user.user_id")
        .leftJoinAndSelect(Classes, "batch", "teacher.id = batch.teacherId")
        .where(
          `teacher.type = 'teacher' AND user.id IS NULL AND batch.classEndDate >= '${moment().format(
            "YYYY-MM-DD"
          )}'`
        )
        .getMany();
      await (
        await this.logger.customZoom(
          "TEACHERS_WITHOUT_LICENSE",
          `You have ${teachers.length} Active Teachers That Don't Have Licensed Account On Zoom.`,
          "ACTIVE_TEACHERS_WITHOUT_LICENSE",
          {},
          this.request?.user
        )
      ).save();
      return teachers;
    } catch (e) {
      logger.error(e);
      return [];
    }
  }

  async updateCreateZoomUser(data: ZoomUser): Promise<any> {
    try {
      logger.info("create zoom user ", data);
      return await this.zoomUserRepository.save(data);
    } catch (e) {
      logger.error(e);
      return false;
    }
  }

  async generateLicenses(teachers: User[]): Promise<{
    created: number;
    error: number;
    errors: any;
  }> {
    const result: any = {
      created: 0,
      error: 0,
      errors: [],
    };
    for (let teacher of teachers) {
      try {
        logger.info("Start creating teacher zoom account ", teacher);
        const zoomUser = new ZoomUser();
        zoomUser.user_id = teacher.id;
        if (this.debug) {
          result.token = zoomClient.JWTToken;
        }

        let createdUser: any = {};
        createdUser = await zoomClient.createCustUser({
          email: `${zoomUser.user_id}${this.emailFormat}`,
          type: 2,
          first_name: teacher.firstName,
          last_name: teacher.lastName,
        });

        if (!createdUser.id) {
          createdUser = await zoomClient.getUserByEmail(
            `${zoomUser.user_id}${this.emailFormat}`
          );
        }

        if (createdUser.id) {
          zoomClient.setUser(createdUser);
          const zak = await zoomClient.getZakToken();
          if (!zak?.token) {
            throw new Error("Failed to get zak token");
          }
          logger.info(
            "Success created teacher zoom account remotely ",
            createdUser
          );

          const updatedUserSettings = await zoomClient.updateUserSettings(
            this.defaultUserSettings
          );
          logger.info(
            "Success updated teacher user settings ",
            updatedUserSettings
          );
          zoomUser.id = createdUser.id;
          zoomUser.first_name = createdUser.first_name;
          zoomUser.last_name = createdUser.last_name;
          zoomUser.email = createdUser.email;
          zoomUser.type = createdUser.type;
          zoomUser.zak_token = zak.token;
          zoomUser.created_at = new Date();
          zoomUser.updated_at = new Date();
          await this.updateCreateZoomUser(zoomUser);
          logger.info(
            "Success created teacher zoom account locally ",
            createdUser
          );
          result.created++;
          await (
            await this.logger.zoom(
              { user: teacher },
              { zoomUser: createdUser, user: teacher },
              this.request.user || {}
            )
          ).save();
        } else {
          logger.info("Failed to generate teacher zoom account ", createdUser);
          result.error++;
          result.errors.push(createdUser);
          if (createdUser.code == 3412) {
            createdUser.message =
              "Stopped creating teacher accounts on zoom job, since there's no available licenses";
            await (
              await this.logger.zoom(
                { user: teacher },
                { zoomUser: createdUser, user: teacher },
                this.request.user || {}
              )
            ).save();
            break;
          } else {
            await (
              await this.logger.customZoom(
                teacher?.id,
                "Failed generate a license for teacher, mostly no more avaialble licenses",
                "FAILED_TO_GENERATE_A_LICENSE",
                { createdUser, teacher },
                this.request.user || {}
              )
            ).save();
          }

          continue;
        }
      } catch (e) {
        logger.error(e);
        result.error++;
        result.errors.push(e);
        await (
          await this.logger.customZoom(
            teacher?.id,
            "Failed generate a license: " + e.message,
            "FAILED_TO_GENERATE_A_LICENSE",
            { error: e, message: e.message, teacher },
            this.request.user || {}
          )
        ).save();
      }

      await setTimeout(() => {}, 100);
    }
    return result;
  }

  async generateTeachersLicense(): Promise<{
    created: number;
    error: number;
    errors: any;
  }> {
    const teachers = await this.getTeachersWithoutLicense();
    return await this.generateLicenses(teachers);
  }

  async generateActiveTeachersLicense(): Promise<{
    created: number;
    error: number;
    errors: any;
  }> {
    const teachers = await this.getActiveTeachersWithoutLicense();
    return await this.generateLicenses(teachers);
  }

  async addLicense(id: string): Promise<{
    created: number;
    error: number;
    errors: any;
  }> {
    const teachers = await this.getTeachersWithoutLicense(
      ` And teacher.id = '${id}'`
    );
    return await this.generateLicenses(teachers);
  }

  async deleteLicense(users: ZoomUser[]): Promise<{
    deleted: number;
    error: number;
    errors: any;
  }> {
    const result = {
      deleted: 0,
      error: 0,
      errors: [],
    };
    for (let user of users) {
      try {
        logger.info("Start delete user zoom account ", user);
        await zoomClient.setUser(user);
        const resultRemote = await zoomClient.deleteUser();
        if (resultRemote.length < 1) {
          logger.info(
            "Success deleted teacher zoom account remotely ",
            resultRemote
          );
          const deleteMeetings = await this.zoomMeetingRepository.delete({
            host_id: user.id,
          });
          const deleteResult = await this.zoomUserRepository.remove(user);

          logger.info(
            "Success deleted teacher zoom account locally ",
            deleteResult
          );

          // const deleteMeetingsResult = await this.zoomMeetingRepository.delete({
          //   host_id: user.id,
          // });
          // logger.info(
          //   "Success deleted zoom meeting locally ",
          //   deleteMeetingsResult
          // );
          result.deleted++;
          await (
            await this.logger.customZoom(
              deleteResult.user_id,
              "Delete Zoom User Account",
              "SUCCESS_DELETED_USER_ZOOM_ACCOUNT",
              { user, result, deleteResult, resultRemote },
              this.request?.user
            )
          ).save();
        } else {
          logger.info("Failed to remove zoom account ", user);
          result.error++;
          result.errors.push(user);
          await (
            await this.logger.customZoom(
              user.id,
              "Failed To Delete Zoom User Account: " + resultRemote?.message,
              "FAILED_DELETED_USER_ZOOM_ACCOUNT",
              { user, result, resultRemote },
              this.request?.user
            )
          ).save();

          continue;
        }
      } catch (e) {
        logger.error(e);
        result.error++;
        result.errors.push({ e, message: e?.message });
        await (
          await this.logger.customZoom(
            user.id,
            "Failed To Delete Zoom User Account: " + e.message,
            "FAILED_DELETED_USER_ZOOM_ACCOUNT",
            { user, result, e },
            this.request?.user
          )
        ).save();
      }

      await setTimeout(() => {}, 100);
    }
    return result;
  }

  async deleteTeachersLicense(id: string): Promise<{
    deleted: number;
    error: number;
    errors: any;
  }> {
    const users = await this.zoomUserRepository.findOne(id);
    users.id = id;
    return await this.deleteLicense([users]);
  }

  async deleteAllTeachersLicense(): Promise<{
    deleted: number;
    error: number;
    errors: any;
  }> {
    const users = await this.zoomUserRepository.find();
    return await this.deleteLicense(users);
  }

  async reassignLicense(from: string, to: string): Promise<any> {
    let error;
    try {
      const teachers = await this.getTeachersWithoutLicense(
        ` And teacher.id = '${to}'`
      );

      if (teachers.length < 1) {
        return {
          status: 400,
          message: "Teacher Already Has License",
        };
      }

      const zoomUser = await this.zoomUserRepository.findOne({
        user_id: from,
      });

      if (!zoomUser) {
        return {
          status: 400,
          message: "Selected license not found",
        };
      }

      const teacher = teachers[0];
      const newUser = {
        first_name: teacher.firstName,
        last_name: teacher.lastName,
        email: teacher.id + this.emailFormat,
      };

      zoomClient.setUser(zoomUser);

      const updatedUser = await zoomClient.updateUser(newUser);

      if (updatedUser.length < 1) {
        const data: any = await this.zoomUserRepository.save({
          id: zoomUser.id,
          ...newUser,
          user_id: to,
        });

        data.message = `Reassigned License: ${from} to: ${to}.`;
        await (
          await this.logger.zoom(
            { user: teacher },
            { zoomUser: { ...zoomUser, ...data }, user: teacher },
            this.request.user || {}
          )
        ).save();

        return {
          status: true,
          message: "Success Reassigned License",
        };
      }

      error = {
        message: "Failed to update user on zoom API",
        teacher,
        newUser,
        zoomUser,
        updatedUser,
      };
    } catch (e) {
      error = e;
    }

    await (
      await this.logger.customZoom(
        to,
        `Reassign Failed: ${error.message}`,
        "FAILED_REASSIGNMENT",
        { error, from, to },
        this.request.user || {}
      )
    ).save();

    return { status: 400, message: error.message };
  }

  async updateZakToken(id?: string): Promise<any> {
    let result = {
      errors: 0,
      updated: 0,
    };
    const users =
      id && id.length > 2
        ? [await this.zoomUserRepository.findOne({ user_id: id })]
        : await this.zoomUserRepository.find();

    for (const user of users) {
      try {
        if (!user) {
          throw new Error("User not found");
        }

        // wait 100 millisecond between each request
        await new Promise((resolve, reject) => setTimeout(resolve, 100));

        zoomClient.setUser(user);
        const zak = await zoomClient.getZakToken();
        if (!zak?.token) {
          throw new Error("Failed to get zak token");
        }

        user.zak_token = zak.token;
        user.updated_at = new Date();
        await this.updateCreateZoomUser(user);

        logger.info(`Success updated user zak token: ${user.id}`);
        result.updated += 1;
      } catch (e) {
        result.errors += 1;
        await (
          await this.logger.customZoom(
            user?.id || "NOT_FOUND",
            `Failed To Update ZAK Token: ${e.message}`,
            "FAILED_TO_UPDATE_ZAK_TOKEN",
            { error: e, message: e.message, user },
            this.request.user || {}
          )
        ).save();
      }
    }

    return result;
  }
}
