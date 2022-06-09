import { NextFunction, Request, Response } from "express";
import { PaymentService } from "../services/PaymentService";

var moment = require('moment');
const cron = require('node-cron');

export class PaymentController {

    private paymentService = new PaymentService();

    async generatePaymentLink(request: Request, response: Response, next: NextFunction) {
        console.log("generating payment links");
        try {
            await this.paymentService.createPaymentLinksForStudents(request.body);
            return { "success": true };
        } catch (error) {
            console.log()
        }
    }


}