import { getRepository, getManager } from "typeorm";
import { Student } from "../../entity/Student";
import { Payment } from "../../entity/Payment";
import { User } from "../../entity/User";
import MongoLead from "../../model/mongo/lead";
import MongoTrial from "../../model/mongo/trial";
import MongoPayment from "../../model/mongo/payment";

const { logger } = require("../../Logger.js");

export async function SyncStudentPaymentInfo(): Promise<any> {
  const userRepository = getRepository(User);
  const studentRepository = getRepository(Student);
  const paymentRepository = getRepository(Payment);
  const result: any = {
    logs: [],
  };

  const users = await getManager()
    .createQueryBuilder(User, "user")
    .innerJoinAndSelect(Student, "student", "student.id = user.id")
    .innerJoinAndSelect(Payment, "payment", "payment.id = user.id")
    .where(`user.status = "error"`)
    .getMany();

  for (const user of users) {
    const lead = await MongoLead.findOne({ ProspectID: user.id }).populate(
      "payment"
    );

    if (!lead) {
      result.logs.push({
        message: `Failed To Sync Student ${user.firstName} ${user.lastName}, Because Lead Doesn't Exist On TCM.`,
        user,
        lead,
      });

      continue;
    }

    result.activeLead = lead;

    if (!lead.payment) {
      result.logs.push({
        message: `Failed To Sync Student ${user.firstName} ${user.lastName}, Because Payment Doesn't Exist On TCM Or Not Paid Yet.`,
        user,
        lead,
      });

      continue;
    }

    const trial = await MongoTrial.findOne({
      lead_id: user.id,
    });

    if (!trial) {
      result.logs.push({
        message: `Failed To Sync Student ${user.firstName} ${user.lastName}, Because Trial Doesn't Exist On TCM.`,
        user,
        lead,
      });

      continue;
    }

    console.log(user);
  }

  result.count = users.length;

  return result;
}
