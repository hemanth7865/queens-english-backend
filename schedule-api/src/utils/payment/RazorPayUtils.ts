import { Transactions } from "../../entity/Transaction";
import { User } from "../../entity/User";
const { usersLogger } = require("../../Logger.js");

const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SCERET });

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
        "amount": Number(installment.emiAmount.replace(/\D/g, '') + '00'),
        "currency": "INR",
        "accept_partial": false,
        // "first_min_partial_amount": 100,
        "description": "For student id " + user.id + " installment due date " + installment.dueDate,
        "customer": {
          "name": user.firstName,
          "email": user.customerEmail,
          "contact": user.phoneNumber
        },
        // "notify": {
        //   "sms": true,
        //   "email": true
        // },
        "reminder_enable": true,
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

}