import { getRepository } from "typeorm";
import { Transactions } from "../entity/Transaction";
import { Constants, PAYMENT_STATUS } from "./../helpers/Constants";
import {
  getPaymentById as getRazorpayPaymentById,
  Payment as RazorpayPayment,
} from "../services/RazorpayService";
const moment = require("moment");

export class InstallmentService {
  private installmentStatus = Constants.AUTO_UPDATE_INSTALLMENT_STATUS;

  private query = getRepository(Transactions);

  async getPendingInstallments(params) {
    const where = { status: this.installmentStatus };
    if (params?.installment_id) {
      where["id"] = params.installment_id;
    }

    if (params?.reference_id) {
      where["transactionId"] = params.reference_id;
    }

    return await this.query.find({
      where,
      take: 10,
    });
  }

  async updateInstallment(id, data) {
    return await this.query.update(id, data);
  }

  async updateInstallmentStatus(paymentId) {
    const paymentStatus: RazorpayPayment = await getRazorpayPaymentById(
      paymentId
    );
    if (paymentStatus.status === "paid") {
      await this.updateInstallment(paymentId, {
        status: PAYMENT_STATUS.PAID,
        paidAmount: paymentStatus.amount / 100,
        paidDate: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
      return PAYMENT_STATUS.PAID;
    } else {
      return PAYMENT_STATUS.PENDING;
    }
  }
}
