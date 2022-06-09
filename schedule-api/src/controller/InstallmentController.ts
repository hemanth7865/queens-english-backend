import { NextFunction, Request, Response } from "express";
import { InstallmentService } from "../services/InstallmentService";
import { getPaymentById as getRazorpayPaymentById } from "../services/RazorpayService";

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
          } else {
            result.ignored++;
          }
        } catch (e) {
          if (e?.error?.description === "The id provided does not exist") {
            result.notFound++;
          } else {
            console.log(e);
            result.error++;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    return result;
  }
}
