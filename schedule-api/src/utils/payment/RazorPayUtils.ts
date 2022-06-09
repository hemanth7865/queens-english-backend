import { isNullOrUndefined } from "util";
import { Payment } from "../../entity/Payment";
import { Student } from "../../entity/Student";
import { User } from "../../entity/User";

const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: 'rzp_test_nR3pXRx4mL6QeX', key_secret: 'ZRnPv1VeinQ9fxdn5OusIuwV' });

export const createRazorPayLink = async (payment: Payment, student: Student, user: User) => {
  console.log('inside razor pay utils');
  console.log('emi: ', payment.emi);
  console.log('fname: ', user.firstName);
  console.log('email: ', user.customerEmail);
  console.log('contact: ', user.phoneNumber);
  console.log('studentId: ', student.id);
  console.log('paymentId: ', payment.id);
  var response = await instance.paymentLink.create({
    "amount": Number(payment.emi + '00'),
    "currency": "INR",
    "accept_partial": false,
    // "first_min_partial_amount": 100,
    "description": "For testing api",
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
      "studentId": student.id
    },
    // "callback_url": "https://example-callback-url.com/",
    // "callback_method": "get"
  });
  console.log('razorpay response: ' + JSON.stringify(response));
  return response;
}
