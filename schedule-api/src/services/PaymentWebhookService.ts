const { usersLogger } = require("../Logger.js");
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
import { isNullOrUndefined } from "util";
import { AUTODEBIT_STATUS, PAYMENT_STATUS, PAYMENT_WEBHOOK_EVENTS } from "../helpers/Constants";
import { InstallmentService } from "./InstallmentService";
const moment = require("moment");
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export class PaymentWebhookService {
  private installmentService = new InstallmentService();

    async updateRazorpayWebhookStatus(request, response) {
        try {
          var isValidSignature = await validateWebhookSignature(JSON.stringify(request.body), request.headers['x-razorpay-signature'], webhookSecret);
          usersLogger.info('validation of webhook signature success: '+ isValidSignature);
          if(isValidSignature){
            var paymentBody = request.body;
            if(paymentBody?.event)
            {
              switch(paymentBody.event) {
                case PAYMENT_WEBHOOK_EVENTS.SUBSCRIPTION_CHARGED:
                  this.updatePaidPaymentStatus(paymentBody, true);
                break;
                case PAYMENT_WEBHOOK_EVENTS.SUBSCRIPTION_CANCELLED:
                case PAYMENT_WEBHOOK_EVENTS.SUBSCRIPTION_HALTED:
                case PAYMENT_WEBHOOK_EVENTS.SUBSCRIPTION_COMPLETED:
                  this.updateSubscriptionStatus(paymentBody);
                break;
                case PAYMENT_WEBHOOK_EVENTS.PAYMENT_LINK_PAID:
                  this.updatePaidPaymentStatus(paymentBody, false);
                break;
                case PAYMENT_WEBHOOK_EVENTS.SUBSCRIPTION_PENDING:
                    if(paymentBody?.payload?.subscription?.entity?.id){
                      var subscription = paymentBody.payload.subscription.entity;
                      var subscriptionId = subscription.id;
                      var chargeDate = moment(subscription.charge_at * 1000).format("YYYY-MM-DD HH:mm:ss");
                      var params : any = {};
                      params.subscription_id = subscriptionId;
                      params.dueMonth = chargeDate.substring(0, 7);
                      var pendingInstallment = await this.installmentService.getPendingInstallments(params);
                      if(pendingInstallment == null || pendingInstallment == undefined || pendingInstallment.length == 0){
                        usersLogger.info('no pending installments for the given sub id: '+ subscriptionId);
                        return {
                          status: "success",
                          message: "No pending installment for the given id",
                        }  
                      }
                      await this.installmentService.updateInstallment(pendingInstallment[0].id, {
                        status: PAYMENT_STATUS.FAILED,
                        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                        subscriptionStatus: subscription.status,
                        autodebitStatus: AUTODEBIT_STATUS.UNSUCCESSFUL_AD,
                        reasonForFailure: ''
                      });              
                    }
                break;
              }
            } 
          }
          else {
            usersLogger.error("signature validity failed for razor pay webhook");
          }
          return {
              status: "success",
              message: "Successfully updated the payment status",
          }  
        }
        catch (error) {
          usersLogger.error("error" , error);
          response.status(500).json(null);
        }
    }   

    async updatePaidPaymentStatus(paymentBody: any, isSubscription: any){
        var subscription: any = {};
        if(isSubscription){
          subscription = paymentBody?.payload?.subscription?.entity;
        }
        else{
          subscription = paymentBody?.payload?.payment_link?.entity;
        }
        if(subscription){
          var subscriptionId = subscription.id;
          var paidDate = moment().format("YYYY-MM-DD HH:mm:ss");
          usersLogger.debug('Default paid date: ' + paidDate);
          //get the paid date from payments
          if (paymentBody?.payload?.payment) {
            var payment = paymentBody.payload.payment.entity;
            paidDate = moment(payment.created_at * 1000).format("YYYY-MM-DD HH:mm:ss");
          }
          var params : any = {};
          if(isSubscription){
            params.subscription_id = subscriptionId;
            params.dueMonth = paidDate.substring(0, 7);  
          }
          else{
            params.reference_id = subscriptionId;
          }
          var pendingInstallment = await this.installmentService.getPendingInstallments(params);
          if(pendingInstallment == null || pendingInstallment == undefined || pendingInstallment.length == 0){
            usersLogger.info('no pending installments for the given sub id: '+ subscriptionId);
            return {
              status: "success",
              message: "No pending installment for the given id",
            }  
          }
          await this.installmentService.updateInstallment(pendingInstallment[0].id, {
            status: PAYMENT_STATUS.PAID,
            paidAmount: payment.amount / 100,
            paidDate: paidDate,
            updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            subscriptionStatus: isSubscription? subscription.status : '',
            autodebitStatus: isSubscription ? AUTODEBIT_STATUS.SUCCESSFUL_AD : '',
            reasonForFailure: ''
          });              
          return {
            status: "success",
            message: "Successfully updated the payment status"
          }  
        }
    }

    async updateSubscriptionStatus(paymentBody: any){
      var subscription: any = {};
      subscription = paymentBody?.payload?.subscription?.entity;
      if(subscription){
        var subscriptionId = subscription.id;
        var currentMonth = moment().format("YYYY-MM-DD HH:mm:ss");
        var params : any = {};
        params.subscription_id = subscriptionId;
        params.dueMonth = currentMonth.substring(0, 7);  
        var pendingInstallment = await this.installmentService.getPendingInstallments(params);
        if(pendingInstallment == null || pendingInstallment == undefined || pendingInstallment.length == 0){
          usersLogger.info('no pending installments for the given sub id: '+ subscriptionId);
          return {
            status: "success",
            message: "No pending installment for the given id",
          }  
        }
        await this.installmentService.updateInstallment(pendingInstallment[0].id, {
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          subscriptionStatus: subscription.status,
        });              
        return {
          status: "success",
          message: "Successfully updated the payment status"
        }  
      }
    }

}
