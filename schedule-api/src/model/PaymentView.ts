import { DatabaseType } from "typeorm";

/**
 * payment view
 */
export class PaymentsView {
  id: String;
  studentId: string;
  dueDate: Date;
  paidDate: Date;
  emiAmount: string;
  paidAmount: string;
  status: string;
  tran_created_at: Date;
  tran_updated_at: Date;
  transaction_details_id: String;
  transactionId: string;
  razorpayLink: string;
  transaction_details_status: string;
  whatsAppLinkSent: string;
  modeOfPayment: string;
  callDisposition: string;
  feedBackCall: string;
  paymentMode: string;
  transaction_details_created_at: Date;
  transaction_details_updated_at: Date;
  payment_mode_id: string;
  payment_mode_status: string;
  transactionReference: string;
  comments: string;
  created_at: Date;
  updated_at: Date;
  collectionAgent?: string;
  referenceId: string;
  subscriptionId: string;
  student: any;
  actualStartDate?: string;
  notes?: string;
  collectionAgentObj?: any;
  leadId?: string;
  reasonAmountChange?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  startDate?: string;
  whatsapp?: string;
  netbankRefLink?: string;
  classtype?: string;
  subscriptionType?: string;
  discount?: number;

  PaymentsView(
    id: String,
    studentId: string,
    dueDate: Date,
    paidDate: Date,
    emiAmount: string,
    paidAmount: string,
    status: string,
    tran_created_at: Date,
    tran_updated_at: Date,
    transaction_details_id: String,
    transactionId: string,
    transaction_details_status: string,
    whatsAppLinkSent: string,
    modeOfPayment: string,
    callDisposition: string,
    feedBackCall: string,
    paymentMode: string,
    transaction_details_created_at: Date,
    transaction_details_updated_at: Date,
    payment_mode_id: string,
    razorpayLink: string,
    payment_mode_status: string,
    transactionReference: string,
    comments: string,
    created_at: Date,
    updated_at: Date,
    student?: string,
    actualStartDate?: string,
    notes?: string,
    reasonAmountChange?: string,
    classtype?: string,
    subscriptionType?: string,
    discount?: number,
  ) {
    this.id = id;
    this.studentId = studentId;
    this.dueDate = dueDate;
    this.paidDate = paidDate;
    this.emiAmount = emiAmount;
    this.paidAmount = paidAmount;
    this.status = status;
    this.tran_created_at = tran_created_at;
    this.tran_updated_at = tran_updated_at;
    this.transaction_details_id = transaction_details_id;
    this.transactionId = transactionId;
    this.razorpayLink = razorpayLink;
    this.transaction_details_status = transaction_details_status;
    this.whatsAppLinkSent = whatsAppLinkSent;
    this.modeOfPayment = modeOfPayment;
    this.callDisposition = callDisposition;
    this.feedBackCall = feedBackCall;
    this.paymentMode = paymentMode;
    this.transaction_details_created_at = transaction_details_created_at;
    this.transaction_details_updated_at = transaction_details_updated_at;
    this.payment_mode_id = payment_mode_id;
    this.payment_mode_status = payment_mode_status;
    this.transactionReference = transactionReference;
    this.comments = comments;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.student = student;
    this.actualStartDate = actualStartDate;
    this.notes = notes;
    this.reasonAmountChange = reasonAmountChange;
    this.classtype = classtype;
    this.subscriptionType = subscriptionType;
    this.discount = discount;
  }
}
