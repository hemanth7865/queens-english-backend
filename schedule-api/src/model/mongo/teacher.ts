import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      required: false,
    },
    wNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    timings: {
      type: Map,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    zoomId: {
      type: String,
    },
    zoomZAKToken: {
      type: String,
    },
    zoomEmail: {
      type: String,
    },
    zoomType: {
      type: Number,
    },
    zoomStatus: {
      type: String,
      enum: ["Active", "InActive", "Pending"],
    },
    zoomStatusLog: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Teacher = model("teacher", userSchema);

export default Teacher;
