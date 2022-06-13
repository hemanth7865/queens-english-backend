import { Transactions } from "../entity/Transaction";
import { TransactionDetails } from "../entity/TransactionDetails";
import PaymentLogGenerator from "../utils/payment/paymentLoggerUtils";
const axios = require("axios");

const LOGS_API = process.env.LOGS_API;
const LOGS_API_KEY = process.env.LOGS_API_KEY;

export const log = (page: string, id: string, data: object): Promise<any> => {
  return axios.post(`${LOGS_API}/logs/create?key=${LOGS_API_KEY}`, {
    ...data,
    page,
    id,
  });
};

export default class LoggerService {
  private page: string;

  private logData: {
    id: string;
    page: string;
    title: string;
    event: string;
    debug: object;
  };

  public async payment(
    oldRecord: {
      transaction: Transactions;
      transactionDetails: TransactionDetails;
    },
    newRecord: {
      transaction: Transactions;
      transactionDetails: TransactionDetails;
    },
    user: object | boolean
  ) {
    this.page = "payments";
    const logData = await PaymentLogGenerator(oldRecord, newRecord, user);
    this.logData = {
      id: newRecord.transaction.id,
      page: this.page,
      title: this.page,
      event: this.page,
      debug: {},
      ...logData,
    };
    return this;
  }

  public async save() {
    try {
      return await log(this.logData.page, this.logData.id, this.logData);
    } catch (e) {
      console.log(e.message);
      return e;
    }
  }
}
