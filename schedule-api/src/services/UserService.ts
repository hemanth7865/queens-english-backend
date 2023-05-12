import { getRepository, Not, IsNull } from "typeorm";
import { User } from "../entity/User";
import { generateRandomCode } from "./../utils/batch/getUniqueTeacherCode";
import axios from "axios";
import { isNullOrUndefined } from "util";
const { usersLogger } = require("../Logger.js");

export class UserService {
  private usersRepository = getRepository(User);

  UserService() { }

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

  async getAllUsersService() {
    try {
      const users = await this.usersRepository.find({
        phoneNumber: Not("undefined"),
      });
      return users;
    } catch (e) {
      usersLogger.error(e);
      return false;
    }
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

  async generateUsersCode(data?:{ id:string, cosmosSync:boolean }): Promise<any> {
    const doCosmosSync = !(data.cosmosSync === false)
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
          if (user.type !== "student") {
            continue;
          }

          const code = await this.getUniqueCode();
          user.userCode = code;
          const cosmosUpdate = {
            url: `${process.env.COSMOS_URL}/api/user/?code=${process.env.COSMOS_CODE}`,
            json: true,
            body: {
              userCode: code,
              id: user.id,
              type: user.type,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              phoneNumber: user.phoneNumber,
              isAdministrator: false,
            },
          };

          // Do cosmos sync when its enabled or when its not enabled and id that passed as arg is not same as any other user id.
          if(doCosmosSync || (user?.id !== data?.id)) {
          await axios
            .put(cosmosUpdate.url, cosmosUpdate.body)
            .then(async (res) => {
              await this.usersRepository.update(user.id, user);
              result.success += 1;
              return user;
            })
            .catch(async (error) => {
              console.log(error);
              throw new Error(
                "Failed to update user on cosmos " + error.response.data
              );
            });
          } else {
            // When cosmosSync is false
            await this.usersRepository.update(user.id, user);
            result.success += 1;
          }
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

  async getLocations(request: any) {

    function isEmpty(obj) {
      return Object.keys(obj).length === 0;
    }

    const axiosPvt = require('axios')

    let API_URL = process.env.CSCAPI_URL;
    let res = [];

    if (isEmpty(request)) {
      API_URL = process.env.CSCAPI_URL;
    } else if (request.country && !request.state) {
      API_URL = `${process.env.CSCAPI_URL}/${request.country}/states`;
    } else if (request.country && request.state) {
      API_URL = `${process.env.CSCAPI_URL}/${request.country}/states/${request.state}/cities`;
    }

    const config = {
      method: 'get',
      url: API_URL,
      headers: {
        'X-CSCAPI-KEY': process.env.CSCAPI_KEY
      }
    };

    await axiosPvt(config)
      .then(function (response) {
        res = response.data;
      })
      .catch(function (error) {
        console.log(error);
      });

    return res;
  }
}
