import { getRepository } from "typeorm";
import { v4 as uuid } from "uuid";
import { User } from "../../entity/User";

export const getUniqueUserCode = async (column: string) => {
  const userRepository = getRepository(User);
  try {
    let exists: boolean | User = true;
    let code;
    while (exists) {
      code = uuid();
      exists = await userRepository.findOne({ [column]: code });
    }
    return code;
  } catch (e) {
    console.log(e);
    return uuid();
  }
};
