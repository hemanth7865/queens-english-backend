import { NextFunction, Request, Response } from "express";
const { usersLogger } = require("../Logger.js");
import { PaymentService } from "../services/PaymentService";

export class PaymentController {
    private paymentService = new PaymentService();
    private ENABLE_ACTIVITY_API = process.env.ENABLE_ACTIVITY_API;

    async studentPaymentDetails(request: Request, response: Response, next: NextFunction) {

        var parameters = {
            current: parseInt(request.query['current']),
            pageSize: parseInt(request.query['pageSize']),
            studentId: request.query['studentId'],
        }
        usersLogger.info("Fetching student payment details .... :: Start");
        var res = await this.paymentService.studentPaymentDetails(parameters);
        usersLogger.info("Fetching student payment details .... :: END");
        return res;
    }

    async fetchPaymentsDetails(request: Request, response: Response, next: NextFunction) {

    }

    async paymentsDetails(request: Request, response: Response, next: NextFunction) {
      
    }

}