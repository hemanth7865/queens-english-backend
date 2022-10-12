import { Schema, model } from "mongoose";

const schema = new Schema<any>(
  {
    LeadId: {
      type: Schema.Types.ObjectId,
      ref: "leads",
      required: true,
      index: true,
    },
    totalAmount: {
      type: Number,
      require: true,
    },
    subscriptionType: {
      type: String,
      require: true,
    },
    provider: {
      type: String,
      require: true,
      index: true,
    },
    subscriptionNumber: {
      type: Number,
    },
    subscriptionAmount: {
      type: Number,
    },
    subscriptionMonths: {
      type: Number,
    },
    downPayment: {
      type: Number,
      require: true,
    },
    transactionId: {
      type: String,
      require: true,
    },
    paymentLink: {
      type: String,
      require: true,
    },
    discount: {
      type: Number,
    },
    expiryDate: {
      type: Number,
    },
    subscriptionStatus: {
      type: String,
    },
    paymentStatus: {
      type: String,
    },
    paidDate: {
      type: Number,
    },
    paidAmount: {
      type: Number,
    },
    planId: {
      type: String,
    },
    created_at: {
      type: Number,
    },
    updated_at: {
      type: Number,
    },
    emi_remaining: {
      type: Number,
    },
    planName: {
      type: String,
    },
    subscriptionId: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    paymentProofUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Collection = model("payments", schema);

export default Collection;
