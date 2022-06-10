import { NextFunction, Request, Response } from "express";
const { usersLogger } = require("../Logger.js");
import { PaymentService } from "../services/PaymentService";

export class PaymentController {
    private paymentService = new PaymentService();
    private ENABLE_ACTIVITY_API = process.env.ENABLE_ACTIVITY_API;

    async fetchCollectionAgent(request: Request, response: Response, next: NextFunction) {

        var parameters = {
            current: parseInt(request.query['current']),
            pageSize: parseInt(request.query['pageSize']),
            studentId: request.query['id'],

        }
        usersLogger.info("Fetching student payment details .... :: Start");
        var res = await this.paymentService.fetchCollectionAgent(request.query);
        usersLogger.info("Fetching student payment details .... :: END");
        return res;
    }

    async studentPaymentDetails(request: Request, response: Response, next: NextFunction) {

        var parameters = {
            current: parseInt(request.query['current']),
            pageSize: parseInt(request.query['pageSize']),
            studentId: request.query['studentId'],

        }
        usersLogger.info("Fetching student payment details .... :: Start");
        var res = await this.paymentService.studentPaymentDetails(request.query);
        usersLogger.info("Fetching student payment details .... :: END");
        return res;
    }

    /**
     * Post call to create/update student payment details
     * @param request 
     * @param response 
     * @param next 
     * @returns 
     */
    async paymentDetails(request: Request, response: Response, next: NextFunction) {
        usersLogger.info('Persist payment details::Start');
        usersLogger.info(`Request data ${JSON.stringify(request.body)}`);
        return await this.paymentService.paymentDetails(request.body);
    }

    
    async fetchPaymentsDetails(request: Request, response: Response, next: NextFunction) {

    }

    async paymentsDetails(request: Request, response: Response, next: NextFunction) {
      
    }

}