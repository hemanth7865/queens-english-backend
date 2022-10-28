import { getRepository, getManager } from "typeorm";
import { Student } from "../../entity/Student";
import { Payment } from "../../entity/Payment";
import { User } from "../../entity/User";
import MongoLead from "../../model/mongo/lead";
import MongoTrial from "../../model/mongo/trial";
import MongoPayment from "../../model/mongo/payment";
import MongoTeacher from "../../model/mongo/teacher";
import LoggerService from "./../LoggerService";

const getRecommendedLesson = ({ placementTests }) => {
  if (!placementTests) {
    return "NA";
  }
  const qw: any = Object.keys(placementTests).reduce((p, o) => {
    if (placementTests[o]?.active) {
      p = { ...placementTests[o], key: o };
    }
    return p;
  }, "");
  if (qw) {
    if (qw?.key == "noTest") {
      return "Lesson 1";
    } else if (qw?.key === "level1A") {
      return qw?.score < 6
        ? "Lesson 1"
        : qw?.score <= 25
          ? "Lesson 31"
          : qw?.score <= 35
            ? "Lesson 61"
            : qw?.score <= 40
              ? "lesson 61"
              : "";
    } else if (qw?.key === "level1B") {
      return qw?.score <= 6 ? "Lesson 61" : qw?.score <= 8 ? "lesson 61" : "";
    } else if (qw?.key === "level2") {
      return qw?.score <= 8
        ? "Lesson 121"
        : qw?.score <= 12
          ? "Lesson 201"
          : qw?.score <= 14
            ? "Lesson 301"
            : "";
    }
  } else {
    return "No Test Conducted";
  }
};

const getSubscriptionType = ({ subscriptionType }) => {
  if (subscriptionType === "Auto-Debit (Monthly)") {
    return "Auto-Debit";
  }

  if (subscriptionType === "Manual (One Time)") {
    return "One Time Payment";
  }

  return subscriptionType;
};

function updateUserData(user: User, { trial }): User {
  if (!user.phoneNumber || user.phoneNumber.length < 10) {
    user.phoneNumber = trial.phone;
  }

  if (!user.whatsapp || user.whatsapp.length < 10) {
    user.whatsapp = trial.wNumber;
  }

  if (!user.alternativeMobile || user.alternativeMobile.length < 10) {
    user.alternativeMobile = trial.aPhone;
  }

  if (!user.state || user.state.length < 3) {
    user.state = trial.city;
  }

  if (!user.email || user.email.length < 3) {
    user.email = trial.pEmail;
  }

  if (!user.customerEmail || user.customerEmail.length < 3) {
    user.customerEmail = trial.pEmail;
  }

  if (!user.address || user.address.length < 3) {
    user.address = trial.address;
  }

  if (!user.gender || user.gender.length < 1) {
    user.gender = trial.gender;
  }

  return user;
}

function updateStudentData(student: Student, { trial, teacher }): Student {
  if (teacher?.name) {
    student.teacherName = teacher.name;
  }

  if (!student.studentName || student.studentName.length < 3) {
    student.studentName = trial.sName;
  }

  if (!student.alternativeMobile || student.alternativeMobile.length < 10) {
    student.alternativeMobile = trial.aPhone;
  }

  if (!student.address || student.address.length < 2) {
    student.address = trial.address;
  }

  if (!student.pfirstName || student.pfirstName.length < 2) {
    student.pfirstName = trial.pName.split(" ")[0];
  }

  if (!student.plastName || student.plastName.length < 3) {
    student.plastName = trial.pName.split(" ")[1];
  }

  student.startLesson = getRecommendedLesson(trial);

  return student;
}

function updatePaymentData(paymentData: Payment, { payment }): Payment {
  paymentData.subscription = getSubscriptionType(payment);
  paymentData.paymentMode = payment.provider;
  paymentData.paymentid = payment.transactionId;
  paymentData.subscriptionNo = payment.subscriptionId;
  paymentData.saleamount = payment.totalAmount;
  paymentData.downpayment = payment.downPayment;
  paymentData.emi = payment.subscriptionAmount;
  paymentData.emiMonths = payment.subscriptionMonths;

  if (paymentData.subscription.split(" ")[0] === "Manual") {
    paymentData.subscriptionNo = "NA";
  }

  return paymentData;
}

export async function SyncStudentPaymentInfo(request): Promise<any> {
  const userRepository = getRepository(User);
  const studentRepository = getRepository(Student);
  const paymentRepository = getRepository(Payment);
  const logger = new LoggerService();
  const result: any = {
    logs: [],
    skipped: 0,
    success: 0,
    error: 0,
    total: 0,
  };

  const { userId } = request.query;

  const where = userId && userId.length > 5 ? ` AND user.id = '${userId}'` : "";

  const users = await getManager()
    .createQueryBuilder(User, "user")
    .innerJoinAndSelect(Student, "student", "student.id = user.id")
    .innerJoinAndSelect(Payment, "payment", "payment.id = user.id")
    .where(`user.status = "error"${where}`)
    .getMany();

  result.total = users.length;

  for (const user of users) {
    try {
      const lead = await MongoLead.findOne({
        ProspectID: user.id,
      });

      if (!lead) {
        result.logs.push({
          message: `Failed To Sync Student ${user.firstName} ${user.lastName}, Because Lead Doesn't Exist On TCM.`,
          user,
          lead,
          success: false,
        });

        result.skipped += 1;
        continue;
      }

      if (lead.isLeadAPSynced && where.length < 1) {
        result.logs.push({
          message: `Failed To Sync Student ${user.firstName} ${user.lastName}, Because Lead Already Synced Before.`,
          user,
          lead,
          success: false,
        });

        result.skipped += 1;
        continue;
      }

      const payment = await MongoPayment.findOne({
        LeadId: lead.id,
        paymentStatus: "Paid",
      });

      if (!payment) {
        result.logs.push({
          message: `Failed To Sync Student ${user.firstName} ${user.lastName}, Because Payment Doesn't Exist On TCM`,
          user,
          lead,
          success: false,
        });

        result.skipped += 1;
        continue;
      }

      const trial = await MongoTrial.findOne({
        lead_id: user.id,
      });

      if (trial) {
        const teacher = await MongoTeacher.findOne({
          _id: trial.selectedTeacher,
        });

        const userData: User = updateUserData(
          await userRepository.findOne(user.id),
          { trial }
        );
        const studentData: Student = updateStudentData(
          await studentRepository.findOne(user.id),
          { trial, teacher }
        );

        await userData.save();
        await studentData.save();
      }

      const paymentData = updatePaymentData(
        await paymentRepository.findOne(user.id),
        { payment }
      );

      await paymentData.save();

      await MongoLead.updateOne({ _id: lead.id }, { isLeadAPSynced: true });

      result.logs.push({
        message: `Success Sync Student ${user.firstName} ${user.lastName}`,
        user,
        success: true,
      });

      result.success += 1;
    } catch (e) {
      result.error += 1;
      result.logs.push({
        message: `Failed To Sync Student ${user.firstName} ${user.lastName}, Because of error: ${e.message}.`,
        user,
        success: false,
      });
    }
  }

  await (
    await logger.customPayment(
      `SYNC_USER_PAYMENT_INFO_RESULT_${userId && userId.length > 5 ? userId : "GENERAL"
      }`,
      "Sync User, Student and Payment Info From LSQ",
      "SYNC_USER_PAYMENT_INFO_RESULT",
      { result },
      request.user || {}
    )
  ).save();

  return result;
}
