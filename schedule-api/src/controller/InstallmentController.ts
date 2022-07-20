import { NextFunction, Request, Response } from "express";
import { isNullOrUndefined } from "util";
import { SUBSCRIPTION_TYPE } from "../helpers/Constants";
import { InstallmentService } from "../services/InstallmentService";
import {
  getPaymentById as getRazorpayPaymentById,
  Payment as RazorpayPayment,
} from "../services/RazorpayService";
import { logger } from "./../Logger.js";
const moment = require("moment");

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
  
              let data:any = {
                status: this.COMPLETED_STATUS,
                paidAmount: paymentLinkDetails.amount / 100,
                paidDate: paidDate,
                subscriptionType: SUBSCRIPTION_TYPE.MANUAL,
                updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                lastCheckedAt: moment().format("YYYY-MM-DD HH:mm:ss")
              };
              logger.info('refresh link: '+request.query?.refreshLink);
              if(request.query?.refreshLink){
                logger.info('refresh link url: '+paymentLinkDetails.short_url);
                data['paymentLink'] = paymentLinkDetails.short_url;
                data['discount'] = 0;
                data['expireBy'] = null;
              }
              logger.debug('data for update: '+JSON.stringify(data));
              await this.service.updateInstallment(payment.id, data);
              result.paid++;
              logger.info(
                `InstallmentController.updateTransctionPaymentStatus: Mark Payment: ${paymentId} As Paid.`
              );
            } else {
              result.ignored++;
              let data:any = {
                lastCheckedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
              };
              logger.info('refresh link: '+request.query?.refreshLink);
              if(request.query?.refreshLink){
                logger.info('refresh link url: '+paymentLinkDetails.short_url);
                data['paymentLink'] = paymentLinkDetails.short_url;
                data['discount'] = 0;
                data['expireBy'] = null;
              }
              logger.debug('data for update: '+JSON.stringify(data));
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
}