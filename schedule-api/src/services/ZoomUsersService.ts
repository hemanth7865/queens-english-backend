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
      return { error: e.message };
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
        }
      }

      return {
        success: true,
        data,
      };
    } catch (e) {
      logger.error(e);
      return { error: e.message };
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
    const result = {
      created: 0,
      error: 0,
      errors: [],
    };
    for (let teacher of teachers) {
      try {
        logger.info("Start creating teacher zoom account ", teacher);
        const zoomUser = new ZoomUser();
        zoomUser.user_id = teacher.id;
        const createdUser = await zoomClient.createCustUser({
          email: `${zoomUser.user_id}@queensenglish.co`,
          type: 2,
          first_name: teacher.firstName,
          last_name: teacher.lastName,
        });
        if (createdUser.id) {
          logger.info(
            "Success created teacher zoom account remotely ",
            createdUser
          );
          zoomUser.id = createdUser.id;
          zoomUser.first_name = createdUser.first_name;
          zoomUser.last_name = createdUser.last_name;
          zoomUser.email = createdUser.email;
          zoomUser.type = createdUser.type;
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
          logger.info("Failed to teacher zoom account ", createdUser);
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
              await this.logger.zoom(
                { user: teacher },
                { zoomUser: createdUser, user: teacher },
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
}
