import { isNullOrUndefined } from "util";
import { Transactions } from "../../entity/Transaction";
import { User } from "../../entity/User";
const { usersLogger } = require("../../Logger.js");
const moment = require("moment");

const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SCERET });
const RAZORPAY_NOTIFY_SMS = process.env.RAZORPAY_NOTIFY_SMS;
const RAZORPAY_NOTIFY_EMAIL = process.env.RAZORPAY_NOTIFY_EMAIL;
const RAZORPAY_ENABLE_REMINDER = process.env.RAZORPAY_ENABLE_REMINDER;

export class RazorPayUtils {

  async createRazorPayLink(installment: Transactions, user: User) {
    usersLogger.info('inside razor pay utils');
    try {
      var originalAmount = Number(installment.emiAmount.replace(/,/g, ''));
      usersLogger.info('emi: '+ originalAmount + ' discount: ' + installment.discount);
      var discountedAmount = originalAmount - ((originalAmount * installment.discount) / 100);
      usersLogger.info('discounted emi: '+ discountedAmount);
      var payload = {
        "amount": discountedAmount * 100,
        "currency": "INR",
        "accept_partial": false,
        // "first_min_partial_amount": 100,
        "customer": {
          "name": user.firstName,
          "email": user.customerEmail,
          "contact": user.phoneNumber
        },
        "notify": {
          "sms": RAZORPAY_NOTIFY_SMS,
          "email": RAZORPAY_NOTIFY_EMAIL
        },
        "reminder_enable": RAZORPAY_ENABLE_REMINDER,
        "notes": {
          "studentId": user.id
        },
        // "callback_url": "https://example-callback-url.com/",
        // "callback_method": "get"
      };
      if(!isNullOrUndefined(installment.expireBy)){
        payload["expire_by"] = Math.floor(moment(installment.expireBy).set({hour:23,minute:59,second:59,millisecond:0}).valueOf() / 1000);
      }
      if(originalAmount!=discountedAmount){
        payload["description"] = "Student: " + user.firstName + ", Installment due date: " + installment.dueDate + ", Original amount: " + originalAmount + ", Discount: " + installment.discount + "%";
      }
      else{
        payload["description"] = "Student: " + user.firstName + ", Installment due date: " + installment.dueDate;
      }

      usersLogger.info('payload for rzp: '+ JSON.stringify(payload));
      var response = await instance.paymentLink.create(payload);
      usersLogger.info('razorpay response: ' + JSON.stringify(response));
    }
    catch (error) {
      usersLogger.error('Error in generating link for razor pay: ' + JSON.stringify(error));
    }
    return response;
  }

  async cancelRazorPayLink(transactionId: string) {
    usersLogger.info('inside razor pay utils cancel link');
    try {
      var response = await instance.paymentLink.cancel(transactionId);
      usersLogger.info('razorpay response for cancel link: ' + JSON.stringify(response));
    }
    catch (error) {
      usersLogger.error('Error in cancelling link for razor pay: ' + JSON.stringify(error));
    }
    return response;
  }

}