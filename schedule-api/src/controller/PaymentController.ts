import { NextFunction, Request, Response } from "express";
import { PaymentService } from "../services/PaymentService";
const { usersLogger } = require("../Logger.js");

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

    async generateBulkPaymentLinks(request: Request, response: Response, next: NextFunction) {
        console.log("generating bulk payment links");
        try {
            return await this.paymentService.createPaymentLinksForInstallmentsWithLimit(request.body.limit);
        } catch (error) {
            console.log(error);
            return {
                status: "error",
                message: "Exception during bulk payment link generation"
            }
        }
    }

    async regeneratePaymentLink(request: Request, response: Response, next: NextFunction) {
        console.log("regenerating payment link");
        try {
            return await this.paymentService.regeneratePaymentLink(request.body);
        } catch (error) {
            console.log(error);
            return {
                status: "error",
                message: "Exception during payment link regeneration"
            }
        }
    }

    async uploadNetBankingResource(request: Request, response: Response, next: NextFunction) {
        console.log("Read netbanking payment receipt.....");      
            return await this.paymentService.uploadNetBankingResource(request.body);
    

    }
}
