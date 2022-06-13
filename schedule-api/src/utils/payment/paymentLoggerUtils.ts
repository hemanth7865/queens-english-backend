import { Transactions } from "../../entity/Transaction";
import { TransactionDetails } from "../../entity/TransactionDetails";
const log = async (
  oldRecord: {
    transaction: Transactions;
    transactionDetails: TransactionDetails;
  },
  newRecord: {
    transaction: Transactions;
    transactionDetails: TransactionDetails;
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

  if (transaction.studentId !== oldTransaction.studentId) {
    title += "Student Id Changed, ";
  }

  if (transaction.dueDate !== oldTransaction.dueDate) {
    title += `Due Date Changed To: ${transaction.dueDate}, `;
  }

  if (transaction.paidDate !== oldTransaction.paidDate) {
    title += `Paid Date Changed To: ${transaction.paidDate}, `;
  }

  if (transaction.paidAmount !== oldTransaction.paidAmount) {
    title += `Paid Amount Changed To: ${transaction.paidAmount}, `;
  }

  if (transaction.emiAmount !== oldTransaction.emiAmount) {
    title += `Installment Amount Changed To: ${transaction.emiAmount}, `;
  }

  if (transaction.status !== oldTransaction.status) {
    title += `Paid Status Changed To: ${transaction.status}, `;
  }

  if (transaction.paymentLink !== oldTransaction.paymentLink) {
    title += "Payment Link Changed, ";
  }

  /**
   * Check Transaction Details Updates
   */
  const transactionDetails = newRecord.transactionDetails;
  const oldTransactionDetails = oldRecord.transactionDetails;

  if (
    transactionDetails.callDisposition !== oldTransactionDetails.callDisposition
  ) {
    title += `Call Disposition Changed To: ${transactionDetails.callDisposition}, `;
  }

  if (transactionDetails.feedBackCall !== oldTransactionDetails.feedBackCall) {
    title += `Feedback Call Changed To: ${transactionDetails.feedBackCall}, `;
  }

  if (transactionDetails.paymentMode !== oldTransactionDetails.paymentMode) {
    title += `Payment Mode Changed To: ${transactionDetails.paymentMode}, `;
  }

  if (transactionDetails.notes !== oldTransactionDetails.notes) {
    title += `Notes Changed To: ${transactionDetails.notes}, `;
  }

  if (
    transactionDetails.whatsAppLinkSent !==
    oldTransactionDetails.whatsAppLinkSent
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
