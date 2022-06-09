import { NextFunction, Request, Response } from "express";
import { QueryFailedError } from "typeorm";
import { TransactionService } from "../services/TransactionService";

export class TransactionController {
  private service = new TransactionService();

  async updateTransctionPaymentStatus(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      return await this.service.test();
    } catch (error) {
      console.log(error);
    }
  }
}
