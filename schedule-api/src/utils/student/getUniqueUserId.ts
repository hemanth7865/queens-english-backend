import { getRepository } from "typeorm";
import { v4 as uuid } from "uuid";
import { User } from "../../entity/User";

export const getUniqueUserID = async (column: string) => {
  const userRepository = getRepository(User);
  try {
    let exists: boolean | User = true;
    let id;
    while (exists) {
      id = uuid();
      exists = await userRepository.findOne({ [column]: id });
    }
    return id;
  } catch (e) {
    console.log(e);
    return uuid();
  }
};
