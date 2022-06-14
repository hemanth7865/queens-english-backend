import { Transactions } from "../../entity/Transaction";
import { User } from "../../entity/User";
const { usersLogger } = require("../../Logger.js");

const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SCERET });
const RAZORPAY_NOTIFY_SMS = process.env.RAZORPAY_NOTIFY_SMS;
const RAZORPAY_NOTIFY_EMAIL = process.env.RAZORPAY_NOTIFY_EMAIL;
const RAZORPAY_ENABLE_REMINDER = process.env.RAZORPAY_ENABLE_REMINDER;

export class RazorPayUtils {

  async createRazorPayLink(installment: Transactions, user: User) {
    usersLogger.info('inside razor pay utils');
    usersLogger.info('emi: ' + Number(installment.emiAmount.replace(/,/g, '')));
    usersLogger.info('fname: ' + user.firstName);
    usersLogger.info('email: ' + user.customerEmail);
    usersLogger.info('contact: ' + user.phoneNumber);
    usersLogger.info('studentId: ' + user.id);
    usersLogger.info('paymentId: ' + installment.id);
    try {
      var response = await instance.paymentLink.create({
        "amount": Number(installment.emiAmount.replace(/,/g, '')) * 100,
        "currency": "INR",
        "accept_partial": false,
        // "first_min_partial_amount": 100,
        "description": "Student: " + user.firstName + ", Installment due date: " + installment.dueDate,
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
      });
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