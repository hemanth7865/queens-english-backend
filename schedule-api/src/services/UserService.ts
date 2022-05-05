import { getRepository, Not } from "typeorm";
import { User } from "../entity/User";
const { usersLogger } = require("../Logger.js");

export class UserService {

  private usersRepository = getRepository(User);

  UserService() { }

  async isUserExists(column = "phoneNumber", value: string, id: string | undefined): Promise<any> {
    let where: any = { [column]: value };
    if (id) {
      where['id'] = Not(id);
    }
    try {
      const user = await this.usersRepository.findOne({ where });
      return user;
    } catch (e) {
      usersLogger.error(e);
      return false;
    }
  }

  async isUserNotSiblingExists(column = "phoneNumber", value: string, id: string | undefined): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          [column]: value,
          isSibling: 1
        }
      });
      if (user) {
        return false;
      }
    } catch (e) {
      usersLogger.error(e);
      return false;
    }

    return await this.isUserExists(column, value, id);
  }
}

