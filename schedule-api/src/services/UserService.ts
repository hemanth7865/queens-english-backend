import { getRepository, Not, IsNull } from "typeorm";
import { User } from "../entity/User";
import { generateRandomCode } from "./../utils/batch/getUniqueTeacherCode";
import axios from "axios";
const { usersLogger } = require("../Logger.js");

export class UserService {
  private usersRepository = getRepository(User);

  UserService() {}

  async isUserExists(
    column = "phoneNumber",
    value: string,
    id: string | undefined
  ): Promise<any> {
    let where: any = { [column]: value };
    if (id) {
      where["id"] = Not(id);
    }
    try {
      const user = await this.usersRepository.findOne({ where });
      return user;
    } catch (e) {
      usersLogger.error(e);
      return false;
    }
  }

  async isUserNotSiblingExists(
    column = "phoneNumber",
    value: string,
    id: string | undefined
  ): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          [column]: value,
          isSibling: 1,
        },
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

  async getUniqueCode() {
    try {
      let exists: boolean | User = true;
      let code;
      while (exists) {
        code = generateRandomCode();
        exists = await this.usersRepository.findOne({ userCode: code });
      }

      return code;
    } catch (e) {
      console.log(e);
      return generateRandomCode();
    }
  }

  async generateUsersCode(): Promise<any> {
    const result = {
      success: 0,
      error: 0,
      log: [],
    };
    try {
      const users = await this.usersRepository.find({
        where: { userCode: IsNull() },
      });

      for (let user of users) {
        try {
          const code = await this.getUniqueCode();
          user.userCode = code;
          const cosmosUpdate = {
            url: `${process.env.COSMOS_URL}/api/user/?code=${process.env.COSMOS_CODE}`,
            json: true,
            body: {
              userCode: code,
              id: user.id,
            },
          };

          await axios
            .put(cosmosUpdate.url, cosmosUpdate.body)
            .then(async (res) => {
              this.usersRepository.update(user.id, user);
              result.success += 1;
              return user;
            })
            .catch(async (error) => {
              throw new Error(
                "Failed to update user on cosmos " + error.response.data
              );
            });
        } catch (e) {
          result.error += 1;
          usersLogger.error(e.message);
          result.log.push(e.mesage);
          continue;
        }
      }
    } catch (e) {
      usersLogger.error(e.message);
      result.log.push(e.mesage);
    }

    return result;
  }
}
