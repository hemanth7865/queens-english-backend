import { Transactions } from "../../entity/Transaction";
import { TransactionDetails } from "../../entity/TransactionDetails";
const log = async (
  oldRecord: {
    transaction: Transactions;
    transactionDetails?: TransactionDetails;
  },
  newRecord: {
    transaction: Transactions;
    transactionDetails?: TransactionDetails;
  },
  user: object | boolean
): Promise<object> => {
  let title = "";
  let event = "";
  const bot = user ? false : true;
  const create = oldRecord.transaction.id ? false : true;

  if (bot) {
    title = "Bot Action, ";
  } else {
    title = "User Action, ";
  }

  if (create) {
    title += "Created Record, ";
  } else {
    title += "Updated Record, ";
  }

  if (bot && create) {
    event = "CREATE_PAYMENT_BOT";
  } else if (create) {
    event = "CREATE_PAYMENT";
  } else if (bot && !create) {
    event = "UPDATE_PAYMENT_BOT";
  } else if (!create) {
    event = "UPDATE_PAYMENT";
  }

  /**
   * Check Transaction Updates
   */
  const transaction = newRecord.transaction;
  const oldTransaction = oldRecord.transaction;

  if (
    transaction.studentId !== oldTransaction.studentId &&
    transaction.studentId
  ) {
    title += "Student Id Changed, ";
  }

  if (transaction.dueDate !== oldTransaction.dueDate && transaction.dueDate) {
    title += `Due Date Changed To: ${transaction.dueDate}, `;
  }

  if (
    transaction.paidDate !== oldTransaction.paidDate &&
    transaction.paidDate
  ) {
    title += `Paid Date Changed To: ${transaction.paidDate}, `;
  }

  if (
    transaction.paidAmount !== oldTransaction.paidAmount &&
    transaction.paidAmount
  ) {
    title += `Paid Amount Changed To: ${transaction.paidAmount}, `;
  }

  if (
    transaction.emiAmount !== oldTransaction.emiAmount &&
    transaction.emiAmount
  ) {
    title += `Installment Amount Changed To: ${transaction.emiAmount}, `;
  }

  if (transaction.status !== oldTransaction.status && transaction.status) {
    title += `Paid Status Changed To: ${transaction.status}, `;
  }

  if (
    transaction.subscriptionId !== oldTransaction.subscriptionId &&
    transaction.subscriptionId
  ) {
    title += `Subscription ID Changed To: ${transaction.subscriptionId}, `;
  }

  if (
    transaction.transactionId !== oldTransaction.transactionId &&
    transaction.transactionId
  ) {
    title += `Transaction ID Changed To: ${transaction.transactionId}, `;
  }

  if (
    transaction.paymentLink !== oldTransaction.paymentLink &&
    transaction.paymentLink
  ) {
    console.log(transaction.paymentLink, oldTransaction.paymentLink);
    title += `Payment Link Changed To: ${transaction.paymentLink}, `;
  }

  /**
   * Check Transaction Details Updates
   */
  const transactionDetails: any = newRecord.transactionDetails || {};
  const oldTransactionDetails: any = oldRecord.transactionDetails || {};

  if (
    transactionDetails.callDisposition !==
      oldTransactionDetails.callDisposition &&
    transactionDetails.callDisposition
  ) {
    title += `Call Disposition Changed To: ${transactionDetails.callDisposition}, `;
  }

  if (
    transactionDetails.feedBackCall !== oldTransactionDetails.feedBackCall &&
    transactionDetails.feedBackCall
  ) {
    title += `Feedback Call Changed To: ${transactionDetails.feedBackCall}, `;
  }

  if (
    transactionDetails.paymentMode !== oldTransactionDetails.paymentMode &&
    transactionDetails.paymentMode
  ) {
    title += `Payment Mode Changed To: ${transactionDetails.paymentMode}, `;
  }

  if (
    transactionDetails.notes !== oldTransactionDetails.notes &&
    transactionDetails.notes
  ) {
    title += `Notes Changed To: ${transactionDetails.notes}, `;
  }

  if (
    transactionDetails.whatsAppLinkSent !==
      oldTransactionDetails.whatsAppLinkSent &&
    transactionDetails.whatsAppLinkSent
  ) {
    title += `Whatsapp send status Changed To: ${transactionDetails.whatsAppLinkSent}, `;
  }

  title = title.substring(0, title.length - 2) + ".";

  return {
    title,
    event,
    debug: { oldRecord, newRecord, user },
  };
};

export default log;
