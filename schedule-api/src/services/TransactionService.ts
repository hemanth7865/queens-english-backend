import razorpay from "./RazorpayService";

export class TransactionService {
  async test() {
    return await razorpay.payments.all();
  }
}
