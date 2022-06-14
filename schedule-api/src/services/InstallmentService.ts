import { getRepository } from "typeorm";
import { Transactions } from "../entity/Transaction";
import { Constants, PAYMENT_STATUS } from "./../helpers/Constants";
import {
  getPaymentById as getRazorpayPaymentById,
  Payment as RazorpayPayment,
} from "../services/RazorpayService";
const moment = require("moment");
const { usersLogger } = require("../Logger.js");
import LoggerService from "./LoggerService";
import { isNullOrUndefined } from "util";

export class InstallmentService {
  private installmentStatus = Constants.AUTO_UPDATE_INSTALLMENT_STATUS;

  private logger = new LoggerService();
  private query = getRepository(Transactions);

  async getPendingInstallments(params) {
    var limit = 10;
    const where = { status: this.installmentStatus };
    if (params?.installment_id) {
      where["id"] = params.installment_id;
    }

    if (params?.reference_id) {
      where["transactionId"] = params.reference_id;
    }

    if (params?.limit) {
      limit = params.limit;
    }

    if (params?.lastCheckedMinutes) {
      // console.log('moment in unix: ' + moment().add(-params.lastCheckedMinutes, 'minutes'));
      console.log('moment formatted: ' + moment().add(-params.lastCheckedMinutes, 'minutes').format("YYYY-MM-DD HH:mm:ss"));
      // console.log('moment in date: ' + moment().add(-params.lastCheckedMinutes, 'minutes').toDate());
      where["lastCheckedAt"] < moment().add(-params.lastCheckedMinutes, 'minutes');
    }

    return await this.query.find({
      where,
      take: limit,
    });
  }

  async updateInstallment(id, data) {
    const oldTransaction = await this.query.findOne({ where: { id } });
    const updated = await this.query.update(id, data);
    //ignore logs for only updating last_checked_at which is considered in batch job
    if (isNullOrUndefined(data.last_checked_at)) {
      await (
        await this.logger.payment(
          { transaction: oldTransaction },
          { transaction: { ...data, id } },
          {}
        )
      ).save();
    }
    return updated;
  }

  async updateInstallmentStatus(paymentId) {
    usersLogger.info("rzp status update api call");
    try {
      const paymentStatus: RazorpayPayment = await getRazorpayPaymentById(
        paymentId
      );
      usersLogger.info("rzp resp: " + JSON.stringify(paymentStatus));
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
    } catch (error) {
      usersLogger.error(
        `Error in razor pay update status call: ${JSON.stringify(error)}`
      );
      await (
        await this.logger.customPayment(
          paymentId || "UNKNOWN",
          "Failed Update Installemnt Status",
          "PAYMENT_UPDATE_STATUS_ERROR",
          { paymentId, error, message: error.message },
          {}
        )
      ).save();
      return PAYMENT_STATUS.PENDING;
    }
  }
}
