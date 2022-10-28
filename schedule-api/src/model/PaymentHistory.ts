import { Schema, model } from "mongoose";

interface IPaymentHistory {
  leadID: string;
  oldPaymentData: {};
  newPaymentData: {};
  updatedData: {};
  updatedBy: {};
}

const paymentHistorySchema = new Schema<IPaymentHistory>(
  {
    leadID: {
      type: String,
      required: true,
    },
    oldPaymentData: {},
    newPaymentData: {},
    updatedData: {},
    updatedBy: {}
  },
  {
    timestamps: true,
  }
);

const PaymentHistory = model<IPaymentHistory>("PaymentHistory", paymentHistorySchema);

export default PaymentHistory;
