import { NextFunction, Request, Response } from "express";
import { isNullOrUndefined } from "util";
import { PaymentService } from "../services/PaymentService";
const { usersLogger } = require("../Logger.js");

export class PaymentController {
    private paymentService = new PaymentService();
    private ENABLE_ACTIVITY_API = process.env.ENABLE_ACTIVITY_API;

    async fetchCollectionAgent(request: Request, response: Response, next: NextFunction) {
        this.paymentService.request = request;
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
        this.paymentService.request = request;

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
        this.paymentService.request = request;
        usersLogger.info("Persist payment details::Start");
        usersLogger.info(`Request data ${JSON.stringify(request.body)}`);
        return await this.paymentService.paymentDetails(request.body);
    }


    async fetchPaymentsDetails(request: Request, response: Response, next: NextFunction) {

    }

    async paymentsDetails(request: Request, response: Response, next: NextFunction) {

    }

    async generateBulkPaymentLinks(request: Request, response: Response, next: NextFunction) {
        this.paymentService.request = request;
        console.log("generating bulk payment links");
        try {
            if (isNullOrUndefined(request.body) || isNullOrUndefined(request.body.limit) || isNullOrUndefined(request.body.dueMonth)) {
                return {
                    status: "error",
                    message: "Missing request parameters for bulk payment link generation - limit & dueMonth"
                }
            }
            return await this.paymentService.createBulkPaymentsLink(request.body.limit, request.body.dueMonth);
        } catch (error) {
            console.log(error);
            return {
                status: "error",
                message: "Exception during bulk payment link generation"
            }
        }
    }

    async regeneratePaymentLink(request: Request, response: Response, next: NextFunction) {
        this.paymentService.request = request;
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
        this.paymentService.request = request;
        console.log("Read netbanking payment receipt.....");
        return await this.paymentService.uploadNetBankingResource(request.body);


    }
}