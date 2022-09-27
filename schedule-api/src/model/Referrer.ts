import { Schema, model } from "mongoose";

interface IReferrer {
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber: string;
  status?: string;
  userId: string;
  type?: string;
}

const referrerSchema = new Schema<IReferrer>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
    },
    type: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Referrer = model<IReferrer>("Referrer", referrerSchema);

export default Referrer;
