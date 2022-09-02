import { getRepository, LessThan, Like, MoreThan } from "typeorm";
import { Transactions } from "../entity/Transaction";
import { Constants, PAYMENT_MODE, PAYMENT_STATUS } from "./../helpers/Constants";
import {
  getPaymentById as getRazorpayPaymentById,
  Payment as RazorpayPayment,
  getSubscriptionById,
  getRazorpayInvoicesForSubscription,
  getRazorpayOrder
} from "../services/RazorpayService";
const moment = require("moment");
const { usersLogger } = require("../Logger.js");
import LoggerService from "./LoggerService";
import { isNullOrUndefined } from "util";
import { format } from "date-and-time";
import { TransactionDetails } from "../entity/TransactionDetails";
const date = require('date-and-time')
import { getDateFromTimeStamp, checkRangeOfDate } from "../helpers/timeStampToDate"

export class InstallmentService {
  private installmentStatus = Constants.AUTO_UPDATE_INSTALLMENT_STATUS;
  public request: any = {};
  private logger = new LoggerService();
  private query = getRepository(Transactions);
  private transaDetailsRepository = getRepository(TransactionDetails);

  async getPendingInstallments(params) {
    var limit = 100;
    const where = {};
    if (params?.installment_id) {
      where["id"] = params.installment_id;
    }

    if (params?.reference_id) {
      where["transactionId"] = params.reference_id;
    }
    else {
      where["transactionId"] = Like("plink_%");
      where["status"] = this.installmentStatus;
    }

    if (params?.limit) {
      limit = params.limit;
    }

    if (params?.lastCheckedMinutesDifference) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - params.lastCheckedMinutesDifference);
      now.setSeconds(0);
      usersLogger.debug('Date for last checked: ' + now);
      where["lastCheckedAt"] = LessThanDate(now);
    }

    if (params?.dueMonth) {
      where["dueDate"] = Like(params.dueMonth + '%');
    }
    usersLogger.debug('where: ' + JSON.stringify(where));

    return await this.query.find({
      where,
      take: limit,
    });
  }

  async updateInstallment(id, data) {
    const oldTransaction = await this.query.findOne({ where: { id } });
    const updated = await this.query.update(id, data);
    const transactionDetail = await this.transaDetailsRepository.findOne({
      transactionId: id,
    });
    if (!isNullOrUndefined(data.subscriptionStatus)) {
      transactionDetail.paymentMode = PAYMENT_MODE.CASHFREE;
    }
    else {
      transactionDetail.paymentMode = PAYMENT_MODE.RAZORPAY;
    }
    await this.transaDetailsRepository.update(
      { transactionId: id },
      transactionDetail,
    );
    //ignore logs for only updating last_checked_at which is considered in batch job
    if (isNullOrUndefined(data.lastCheckedAt) || !isNullOrUndefined(data.paidDate)) {
      await (
        await this.logger.payment(
          { transaction: oldTransaction },
          { transaction: { ...data, id } },
          this.request.user || {}
        )
      ).save();
    }
    return updated;
  }

  async updateInstallmentStatus(paymentId) {
    usersLogger.debug("rzp status update api call");
    try {
      const paymentLinkDetails: RazorpayPayment = await getRazorpayPaymentById(
        paymentId
      );
      usersLogger.debug("rzp resp: " + JSON.stringify(paymentLinkDetails));
      if (paymentLinkDetails.status === "paid") {
        var paidDate = moment().format("YYYY-MM-DD HH:mm:ss");
        usersLogger.debug('Default paid date: ' + paidDate);
        //get the paid date from payments
        if (!isNullOrUndefined(paymentLinkDetails.payments) && paymentLinkDetails.payments.length > 0 && paymentLinkDetails.payments[0].status == 'captured') {
          paidDate = moment(paymentLinkDetails.payments[0].created_at * 1000).format("YYYY-MM-DD HH:mm:ss");
          usersLogger.info('Actual paid date: ' + paidDate + ' ,for payment record: ' + JSON.stringify(paymentLinkDetails.payments[0]));
        }
        await this.updateInstallment(paymentId, {
          status: PAYMENT_STATUS.PAID,
          paidAmount: paymentLinkDetails.amount / 100,
          paidDate: paidDate,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
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
          this.request.user || {}
        )
      ).save();
      return PAYMENT_STATUS.PENDING;
    }
  }

  //Logic to update subsccripiton status
  async updateSubscriptionStatus(paymentId) {
    usersLogger.debug("rzp subscription status update api call");
    try {
      const getInstallmentDetails = await this.query.findOne({ transactionId: paymentId });
      //console.log('installment details: ', getInstallmentDetails, JSON.stringify(getInstallmentDetails));
      const subscriptionDetails: RazorpayPayment = await getSubscriptionById(
        paymentId
      );
      //subscriptionDetails.status ---> subscription status 
      //console.log('status', subscriptionDetails);
      //to get invoices details
      //logic based on billing_start and billing_end / issued_at ---> status
      const invoiceDetails = await getRazorpayInvoicesForSubscription(
        paymentId
      );
      if (!invoiceDetails) {
        return {
          status: "error",
          message: "Payment Details not found for the subscription",
        };
      }
      for (const payments of invoiceDetails?.items) {
        //console.log('invoice each', payments)
        const dateB = getDateFromTimeStamp(payments.billing_start);
        console.log('date billing start', payments.billing_start, dateB);
        if (checkRangeOfDate(payments.billing_start, payments.billing_end, '02/10/2022')) {
          console.log('logic to get order Id here, success');
          break;
        }
      }
      //console.log('invoiceDetails', invoiceDetails);
      //orderId --> status 
      const paymentStatusDetails: RazorpayPayment = await getRazorpayOrder(
        'order_KCbDewhB9Ub3n6'
      );
      //console.log('payment details', paymentStatusDetails);
      //get payment status
    } catch (error) {
      usersLogger.error(
        `Error in razor pay status update status call: ${JSON.stringify(error)}`
      );
      // await (
      //   await this.logger.customPayment(
      //     paymentId || "UNKNOWN",
      //     "Failed Update Installemnt Status",
      //     "PAYMENT_UPDATE_STATUS_ERROR",
      //     { paymentId, error, message: error.message },
      //     this.request.user || {}
      //   )
      // ).save();
      return PAYMENT_STATUS.PENDING;
    }
  }
}

export const LessThanDate = (date: Date) => LessThan(format(date, 'YYYY-MM-DD HH:mm:ss'))
export const MoreThanDate = (date: Date) => MoreThan(format(date, 'YYYY-MM-DD HH:mm:ss'))
