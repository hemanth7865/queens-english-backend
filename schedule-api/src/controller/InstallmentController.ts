import { NextFunction, Request, Response } from "express";
import { InstallmentService } from "../services/InstallmentService";
import { getPaymentById as getRazorpayPaymentById } from "../services/RazorpayService";
import { logger } from "./../Logger.js";

export class InstallmentController {
  private service = new InstallmentService();

  async updateTransctionPaymentStatus(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const result = {
      error: 0,
      paid: 0,
      ignored: 0,
      notFound: 0,
    };
    logger.info("InstallmentController.updateTransctionPaymentStatus: Start.");
    try {
      const pendingPayments = await this.service.getPendingPayments();
      for (let payment of pendingPayments) {
        try {
          const paymentId = payment.id;
          const paymentStatus = await getRazorpayPaymentById(paymentId);
          if (paymentStatus.status === "captured") {
            await this.service.updatePayment(paymentId, {
              status: "Installment Paid",
            });
            result.paid++;
            logger.info(
              `InstallmentController.updateTransctionPaymentStatus: Mark Payment: ${paymentId} As Paid.`
            );
          } else {
            result.ignored++;
          }
        } catch (e) {
          if (e?.error?.description === "The id provided does not exist") {
            result.notFound++;
            logger.info(
              `InstallmentController.updateTransctionPaymentStatus: Payment: ${payment.id} Not Found.`
            );
          } else {
            console.log(e);
            logger.info(
              `InstallmentController.updateTransctionPaymentStatus: Payment: ${payment.id} Faced Error ${e.message}.`
            );
            result.error++;
          }
        }
      }
    } catch (error) {
      logger.info(
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
