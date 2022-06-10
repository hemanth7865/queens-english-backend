import { Transactions } from "../../entity/Transaction";
import { User } from "../../entity/User";

const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SCERET });

export class RazorPayUtils {

  async createRazorPayLink(installment: Transactions, user: User) {
    console.log('inside razor pay utils');
    console.log('emi: ', installment.emiAmount);
    console.log('fname: ', user.firstName);
    console.log('email: ', user.customerEmail);
    console.log('contact: ', user.phoneNumber);
    console.log('studentId: ', user.id);
    console.log('paymentId: ', installment.id);
    var response = await instance.paymentLink.create({
      "amount": Number(installment.emiAmount + '00'),
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
    console.log('razorpay response: ' + JSON.stringify(response));
    return response;
  }

}