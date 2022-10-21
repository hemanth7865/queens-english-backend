import { NextFunction, Request, Response } from "express";
import { isNullOrUndefined } from "util";
import { InstallmentService } from "../services/InstallmentService";
import {
  getPaymentById as getRazorpayPaymentById,
  Payment as RazorpayPayment,
  getSubscriptionById as getRazorpaySubscriptionById,
} from "../services/RazorpayService";
import { logger } from "./../Logger.js";
import { NULL_STRING } from "../helpers/Constants"
const moment = require("moment");
import { parse } from "csv-parse";

export class InstallmentController {
  private service = new InstallmentService();
  private COMPLETED_STATUS = "Installment Paid";

  async updateTransctionPaymentStatus(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    this.service.request = request;
    const result = {
      error: 0,
      paid: 0,
      ignored: 0,
      notFound: 0,
    };
    logger.debug("InstallmentController.updateTransctionPaymentStatus: Start.");
    try {
      const pendingPayments = await this.service.getPendingInstallments(
        request.query
      );
      logger.info('Fetch installments: ' + pendingPayments?.length);
      if (request.query.reference_id.length === 0 || request.query.reference_id === NULL_STRING.NULL) {
        return { status: 400, message: "Reference ID is invalid" };
      }
      //check for razorpay subscriptions
      if (request.query.reference_id.split("_")[0] === "sub") {
        logger.info(`Validate razorpay subscription: ${JSON.stringify(request.query)}`);
        const subscriptionValidation = await this.service.updateSubscriptionStatus(request.query);
        return subscriptionValidation;
      }
      for (const payment of pendingPayments) {
        try {
          const paymentId = payment.transactionId;
          const paymentLinkDetails: RazorpayPayment = await getRazorpayPaymentById(
            paymentId
          );
          logger.debug('Fetch payment link id: ' + paymentId + ' response: ' + JSON.stringify(paymentLinkDetails));
          if (paymentLinkDetails.status === "paid") {
            var paidDate = moment().format("YYYY-MM-DD HH:mm:ss");
            logger.debug('Default paid date: ' + paidDate);
            //get the paid date from payments
            if (!isNullOrUndefined(paymentLinkDetails.payments) && paymentLinkDetails.payments.length > 0 && paymentLinkDetails.payments[0].status == 'captured') {
              paidDate = moment(paymentLinkDetails.payments[0].created_at * 1000).format("YYYY-MM-DD HH:mm:ss");
              logger.debug('Actual paid date: ' + paidDate + ' ,for payment record: ' + JSON.stringify(paymentLinkDetails.payments[0]));
            }

            let data: any = {
              status: this.COMPLETED_STATUS,
              paidAmount: paymentLinkDetails.amount / 100,
              paidDate: paidDate,
              updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
              lastCheckedAt: moment().format("YYYY-MM-DD HH:mm:ss")
            };
            logger.info('refresh link: ' + request.query?.refreshLink);
            if (request.query?.refreshLink) {
              logger.info('refresh link url: ' + paymentLinkDetails.short_url);
              data['paymentLink'] = paymentLinkDetails.short_url;
              data['discount'] = 0;
              data['expireBy'] = null;
            }
            logger.debug('data for update: ' + JSON.stringify(data));
            await this.service.updateInstallment(payment.id, data);
            result.paid++;
            logger.info(
              `InstallmentController.updateTransctionPaymentStatus: Mark Payment: ${paymentId} As Paid.`
            );
          } else {
            result.ignored++;
            let data: any = {
              lastCheckedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            logger.info('refresh link: ' + request.query?.refreshLink);
            if (request.query?.refreshLink) {
              logger.info('refresh link url: ' + paymentLinkDetails.short_url);
              data['paymentLink'] = paymentLinkDetails.short_url;
              data['discount'] = 0;
              data['expireBy'] = null;
            }
            logger.debug('data for update: ' + JSON.stringify(data));
            await this.service.updateInstallment(payment.id, data);
          }
        } catch (e) {
          if (e?.error?.description === "The id provided does not exist") {
            result.notFound++;
            logger.error(
              `InstallmentController.updateTransctionPaymentStatus: Payment: ${payment.id} Not Found.`
            );
          } else {
            console.log(e);
            logger.error(
              `InstallmentController.updateTransctionPaymentStatus: Payment: ${payment.id} Faced Error ${e.message}.`
            );
            result.error++;
          }
        }
      }
    } catch (error) {
      logger.error(
        `InstallmentController.updateTransctionPaymentStatus: End Error, ${error?.message}.`
      );
      console.log(error);
    }

    logger.info(
      `InstallmentController.updateTransctionPaymentStatus: End Result: ${JSON.stringify(
        result
      )}.`
    );
    return result;
  }

  /* CSV Delete Installments */
  async updateDeleteInstallmentsCSV(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const file = request.files.deleteAddInstallment;
    let data = [];

    try {
      await new Promise(function (myResolve: any, myReject: any) {
        parse(
          file.data.toString(),
          { columns: true, trim: true },
          function (e, records) {
            data = records;
            if (data) {
              myResolve();
            } else {
              myReject();
            }
          }
        );
      });
      return this.service.updateDeleteInstallmentsCSV(
        data,
        request.query
      );
    } catch (e) {
      return { e, name: file.name, size: file.size, type: file.type };
    }
  }

  /* CSV Add Installments */
  async updateAddInstallmentsCSV(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const file = request.files.deleteAddInstallment;
    let data = [];

    try {
      await new Promise(function (myResolve: any, myReject: any) {
        parse(
          file.data.toString(),
          { columns: true, trim: true },
          function (e, records) {
            data = records;
            if (data) {
              myResolve();
            } else {
              myReject();
            }
          }
        );
      });
      return this.service.updateAddInstallmentsCSV(
        data,
        request.query
      );
    } catch (e) {
      return { e, name: file.name, size: file.size, type: file.type };
    }
  }
}