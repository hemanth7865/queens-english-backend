import { getRepository, getManager } from "typeorm";
import { User } from "../entity/User";
import { ZoomUser } from "../entity/ZoomUser";
import { Classes } from "../entity/Classes";
const { usersLogger } = require("../Logger.js");
const { ZoomAPI } = require("zoomAPIClient");

const { ZOOM_API_KEY, ZOOM_API_SECRET } = process.env;
const zoomClient = new ZoomAPI(ZOOM_API_KEY, ZOOM_API_SECRET);
zoomClient.init();
export class ZoomUserService {
  private usersRepository = getRepository(User);
  private zoomUserRepository = getRepository(ZoomUser);

  ZoomUserService() {}

  async teachers(where: { type?: string } = {}): Promise<any> {
    where.type = "teacher";
    try {
      const teachers = await this.usersRepository.find({
        where,
      });
      return teachers;
    } catch (e) {
      usersLogger.error(e);
      return false;
    }
  }

  async zoomUsers(where = {}): Promise<any> {
    try {
      const users = await this.zoomUserRepository.find({
        where,
      });
      return users;
    } catch (e) {
      usersLogger.error(e);
      return false;
    }
  }

  async getTeachersWithoutLicense(): Promise<User[]> {
    try {
      const teachers = await getManager()
        .createQueryBuilder(User, "teacher")
        .leftJoinAndSelect(ZoomUser, "user", "teacher.id = user.user_id")
        .where("teacher.type = 'teacher' AND user.id IS NULL")
        .getMany();
      return teachers;
    } catch (e) {
      usersLogger.error(e);
      return [];
    }
  }

  async updateCreateZoomUser(data: ZoomUser): Promise<any> {
    try {
      return await this.zoomUserRepository.save(data);
    } catch (e) {
      usersLogger.error(e);
      return false;
    }
  }

  async generateTeachersLicense(): Promise<{
    created: number;
    error: number;
    errors: any;
  }> {
    const zoomClient = new ZoomAPI(ZOOM_API_KEY, ZOOM_API_SECRET);

    const result = {
      created: 0,
      error: 0,
      errors: [],
    };
    const teachers = await this.getTeachersWithoutLicense();
    for (let teacher of teachers) {
      try {
        const zoomUser = new ZoomUser();
        zoomUser.user_id = teacher.id;
        const createdUser = await zoomClient.createCustUser({
          email: `${zoomUser.user_id}@queensenglish.co`,
          type: 2,
          first_name: teacher.firstName,
          last_name: teacher.lastName,
        });
        if (createdUser.id) {
          zoomUser.id = createdUser.id;
          zoomUser.first_name = createdUser.first_name;
          zoomUser.last_name = createdUser.last_name;
          zoomUser.email = createdUser.email;
          zoomUser.type = createdUser.type;
          zoomUser.created_at = new Date();
          zoomUser.updated_at = new Date();
          await this.updateCreateZoomUser(zoomUser);
          result.created++;
        } else {
          result.error++;
          result.errors.push(createdUser);
          continue;
        }
      } catch (e) {
        usersLogger.error(e);
        result.error++;
        result.errors.push(e);
      }

      await setTimeout(() => {}, 100);
    }
    return result;
  }
}
