import razorpay from "./RazorpayService";
import { getRepository } from "typeorm";
import { Transactions } from "../entity/Transaction";

export class InstallmentService {
  private installmentStatus = "Installment Pending";
  private query = getRepository(Transactions);

  async getPendingPayments() {
    return await this.query.find({
      where: { status: this.installmentStatus },
    });
  }
}
