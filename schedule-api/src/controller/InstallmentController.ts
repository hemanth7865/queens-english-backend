import { NextFunction, Request, Response } from "express";
import { InstallmentService } from "../services/InstallmentService";

export class InstallmentController {
  private service = new InstallmentService();

  async updateTransctionPaymentStatus(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const result = {
        error: 0,
        paid: 0,
        ignored: 0,
        notFound: 0,
      };
      const pendingPayments = await this.service.getPendingPayments();
      return pendingPayments;
    } catch (error) {
      console.log(error);
    }
  }
}
