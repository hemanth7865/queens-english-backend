import { getRepository, IsNull } from "typeorm";
import { Classes } from "../../entity/Classes";

export const generateRandomCode = (): string => {
  var length = 5;
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  var retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

export const getUniqueCode = async (column: string) => {
  const classesRepository = getRepository(Classes);
  try {
    let exists: boolean | Classes = true;
    let code;
    while (exists) {
      code = generateRandomCode();
      exists = await classesRepository.findOne({ [column]: code });
    }

    return code;
  } catch (e) {
    console.log(e);
    return generateRandomCode();
  }
};

export const updateBatchesTeacherCode = async () => {
  const classesRepository = getRepository(Classes);
  const batches = await classesRepository.find({ teacherCode: IsNull() });
  for (const batch of batches) {
    try {
      const teacherCode = await getUniqueCode("teacherCode");
      await classesRepository.update({ id: batch.id }, { teacherCode });
    } catch (e) {
      console.log(e);
    }
  }
};
