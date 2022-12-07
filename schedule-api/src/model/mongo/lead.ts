import { Schema, model } from "mongoose";

const leadsSchema = new Schema<any>(
  {
    ProspectID: {
      type: String,
      require: true,
    },
    FirstName: {
      type: String,
      require: false,
      index: true,
    },
    Owner_EmailAddress: {
      type: String,
      index: true,
    },
    CreatedOn: {
      type: String,
    },
    ModifiedOn: {
      type: String,
    },
    LastName: {
      type: String,
      index: true,
    },
    EmailAddress: {
      type: String,
    },
    ProspectStage: {
      type: String,
    },
    Phone: {
      type: String,
      index: true,
    },
    mx_Order_Date: {},
    mx_Address: {},
    mx_Alternative_Contact_Number: {},
    mx_Primary_Contact_Number: {},
    mx_Customer_name: {},
    mx_Course_Type: {},
    mx_WhatsApp_Phone_Number: {},
    mx_Grade: {},
    mx_Class: {},
    mx_Gender: {
      type: String,
    },
    mx_Parent_Name: {},
    Source: {
      type: String,
    },
    Mobile: {},
    CanUpdate: {
      type: String,
    },
    isBooked: {
      type: Number,
      default: 0,
    },
    isDoubleBookingAllowed: {
      type: Boolean,
      default: true,
    },
    isLeadAPSynced: {
      type: Boolean,
      default: false
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "payments",
      index: true,
    },
    leadDetails: {
      type: Object
    },
    manuallyCreated: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Lead = model("leads", leadsSchema);

export default Lead;
