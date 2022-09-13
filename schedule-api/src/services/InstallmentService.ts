import { getRepository, LessThan, Like, MoreThan } from "typeorm";
import { Transactions } from "../entity/Transaction";
import { Constants, PAYMENT_MODE, PAYMENT_STATUS, RAZORPAY_PAYMENT_STATUS } from "./../helpers/Constants";
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

  //Logic to update subsccripiton status && payment status && cycles 
  async updateSubscriptionStatus(paymentRequest) {
    usersLogger.debug("rzp subscription status update api call");
    try {
      const getInstallmentDetails = await this.query.findOne({ id: paymentRequest.installment_id });
      if (!getInstallmentDetails) {
        usersLogger.error(`Error in getting installment details: ${JSON.stringify(getInstallmentDetails)}`);
        return {
          status: "error",
          message: "Subcription id is not found!",
        };
      }

      //get subscription details from razorpay
      const subscriptionDetails: any = await getSubscriptionById(
        getInstallmentDetails.subscriptionId
      );
      if (!subscriptionDetails) {
        usersLogger.error(`Error in getting subscription id: ${JSON.stringify(subscriptionDetails)}`);
        return {
          status: "error",
          message: "Razorpay subscription not found for given id",
        };
      }
      usersLogger.info(`subscription details for razorpay: ${JSON.stringify(subscriptionDetails)}`);

      //get invoice details from razorpay
      const invoiceDetails = await getRazorpayInvoicesForSubscription(
        getInstallmentDetails.subscriptionId
      );
      let initialSuscriptionData: any = {
        subscriptionStatus: subscriptionDetails.status.toUpperCase(),
        cycles: subscriptionDetails.paid_count,
        status: PAYMENT_STATUS.PENDING,
        paymentLink: subscriptionDetails.short_url,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        lastCheckedAt: moment().format("YYYY-MM-DD HH:mm:ss")
      };
      if (!invoiceDetails || invoiceDetails?.items.length === 0) {
        usersLogger.error(`Error in Invoice details from razorpay: ${JSON.stringify(invoiceDetails)}`);
        usersLogger.debug('data for update: ' + JSON.stringify(initialSuscriptionData));
        await this.query.update(getInstallmentDetails.id, initialSuscriptionData);
        return {
          status: "error",
          message: "Payment Details not found for the subscription",
        };
      }
      usersLogger.info(`Invoice details from razorpay: ${JSON.stringify(invoiceDetails)}`);

      let data: any;
      for (const payments of invoiceDetails?.items) {
        if (checkRangeOfDate(payments.billing_start, payments.billing_end, getInstallmentDetails.dueDate)) {
          usersLogger.info(`Invoice for paid data: ${JSON.stringify(payments)}`);
          data = {
            invoiceStatus: payments.status,
            orderId: payments.order_id,
            paymentUrl: payments.short_url,
            updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            lastCheckedAt: moment().format("YYYY-MM-DD HH:mm:ss")
          };
          break;
        }
      }
      usersLogger.info(`Getting the billing date match logic: ${JSON.stringify(data)}`);
      if (!data) {
        usersLogger.error(`Inoice for this date not found ${JSON.stringify(invoiceDetails)}`);
        usersLogger.debug('data for update: ' + JSON.stringify(initialSuscriptionData));
        await this.query.update(getInstallmentDetails.id, initialSuscriptionData);
        return {
          status: "success",
          data: "Updated succesfully",
        };
      }

      //get order id details and payment status from razorpay
      const paymentStatusDetails: any = await getRazorpayOrder(
        data.orderId
      );
      usersLogger.info(`Payment status for order id: ${JSON.stringify(paymentStatusDetails)}`);

      let finalData: any = {
        subscriptionStatus: subscriptionDetails.status.toUpperCase(),
        cycles: subscriptionDetails.paid_count,
        paymentLink: subscriptionDetails.short_url,
      }
      if (!paymentStatusDetails || paymentStatusDetails.items.length === 0) {
        usersLogger.error(`Error in fetching payment details: ${JSON.stringify(paymentStatusDetails)}`);
        finalData['status'] = PAYMENT_STATUS.PENDING;
        finalData['updated_at'] = moment().format("YYYY-MM-DD HH:mm:ss");
        finalData['lastCheckedAt'] = moment().format("YYYY-MM-DD HH:mm:ss");
        usersLogger.debug('data for update: ' + JSON.stringify(finalData));
        await this.query.update(getInstallmentDetails.id, finalData);
        return {
          status: "success",
          data: "Updated succesfully",
        };
      }

      /* Todo
          2. Update the Due Date from razorpay 
      */

      if (paymentStatusDetails?.items[0].status === RAZORPAY_PAYMENT_STATUS.SUCCESS
        && (paymentStatusDetails?.items[0].amount / 100) >= Number(getInstallmentDetails.emiAmount)) {
        finalData['status'] = PAYMENT_STATUS.PAID;
        finalData['paidAmount'] = paymentStatusDetails?.items[0].amount / 100;
        finalData['paidDate'] = moment(paymentStatusDetails?.items[0].created_at * 1000).format("YYYY-MM-DD HH:mm:ss");
        finalData['updated_at'] = moment().format("YYYY-MM-DD HH:mm:ss");
        finalData['lastCheckedAt'] = moment().format("YYYY-MM-DD HH:mm:ss");
        await this.query.update(getInstallmentDetails.id, finalData);
      } else if (paymentStatusDetails?.items[0].status === RAZORPAY_PAYMENT_STATUS.FAILED) {
        finalData['status'] = PAYMENT_STATUS.FAILED;
        finalData['updated_at'] = moment().format("YYYY-MM-DD HH:mm:ss");
        finalData['lastCheckedAt'] = moment().format("YYYY-MM-DD HH:mm:ss");
        await this.query.update(getInstallmentDetails.id, finalData);
      } else {
        finalData['status'] = PAYMENT_STATUS.PENDING;
        finalData['updated_at'] = moment().format("YYYY-MM-DD HH:mm:ss");
        finalData['lastCheckedAt'] = moment().format("YYYY-MM-DD HH:mm:ss");
        await this.query.update(getInstallmentDetails.id, finalData);
      }
      usersLogger.debug('data for update: ' + JSON.stringify(finalData));
      await (
        await this.logger.customPayment(
          paymentRequest.installment_id || "UNKNOWN",
          "Updated Razorpay status",
          "PAYMENT_UPDATE_STATUS_RAZORPAY_SUCCESS",
          { paymentRequest, paymentStatusDetails },
          {}
        )
      ).save();
      return {
        status: "success",
        data: "Updated succesfully",
      };
    } catch (error) {
      usersLogger.error(
        `Error in razor pay status update status call: ${JSON.stringify(error)}`
      );
      await (
        await this.logger.customPayment(
          paymentRequest.installment_id || "UNKNOWN",
          "Failed Update Razorpay Status",
          "PAYMENT_UPDATE_STATUS_ERROR",
          { paymentRequest, error, message: error.message },
          this.request.user || {}
        )
      ).save();
      return PAYMENT_STATUS.PENDING;
    }
  }
}

export const LessThanDate = (date: Date) => LessThan(format(date, 'YYYY-MM-DD HH:mm:ss'))
export const MoreThanDate = (date: Date) => MoreThan(format(date, 'YYYY-MM-DD HH:mm:ss'))
