import razorpay from "./RazorpayService";
import { QueryFailedError, getManager } from "typeorm";

export class InstallmentService {
  private tableName = "transactions";
  private installmentStatus = "Installment Pending";
  private query = getManager();

  async getPendingPayments() {
    return await this.query.query(
      `SELECT * FROM ${this.tableName} WHERE payment_status = ${this.installmentStatus}`
    );
  }
}
