import { getManager } from "typeorm";
import { isNullOrUndefined } from "util";
import { Payment } from "../entity/Payment";
import { Student } from "../entity/Student";
import { User } from "../entity/User";
const { paymentLogger } = require("../Logger.js");
const { createRazorPayLink } = require("../utils/payment/RazorPayUtils");

export class PaymentService {

  PaymentService() { }

  async createPaymentLinksForStudents(request) {
    return await this.fetchPaymentData(request);
  }

  fetchPaymentData = async (request: any) => {
    if (!request.id) {
      console.log('No Student available for generating payment link');
      return;
    }
    var id = request.id;
    console.log('Fetch Student details with id: {0}', id);

    var user = await getManager()
      .createQueryBuilder(User, "user")
      .where("user.id = :id", { id: id })
      .getOne();
    if (isNullOrUndefined(user)) {
      console.log('No user available for the given id: {0}', id);
      return;
    }
    var student = await getManager()
      .createQueryBuilder(Student, "student")
      .where("student.id = :id", { id: id })
      .getOne();
    if (isNullOrUndefined(student)) {
      console.log('No Student available for the given id: {0}', id);
      return;
    }
    var payment = await getManager()
      .createQueryBuilder(Payment, "payment")
      .where("payment.studentId = :id", { id: id })
      .getOne();
    if (isNullOrUndefined(payment)) {
      console.log('No payment available for the given id: {0}', id);
      return;
    }
    console.log(user);
    console.log(student);
    console.log(payment);

    var razorPayResponse = await createRazorPayLink(payment, student, user);

    return;
  }

}
