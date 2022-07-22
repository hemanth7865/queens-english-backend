import { Transactions } from "../entity/Transaction";
import { TransactionDetails } from "../entity/TransactionDetails";
import { User } from "../entity/User";
import { ZoomUser } from "../entity/ZoomUser";
import { ZoomMeeting } from "../entity/ZoomMeeting";
import PaymentLogGenerator from "../utils/payment/paymentLoggerUtils";
import zoomLogGenerator from "../utils/zoom/zoomLoggerUtils";
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
      transactionDetails?: TransactionDetails;
    },
    newRecord: {
      transaction: Transactions;
      transactionDetails?: TransactionDetails;
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

  public async customPayment(
    id: string,
    title: string,
    event: string,
    debug: any,
    user: any,
    studentId?: string
  ) {
    this.page = "payments";
    const bot = user?.email ? false : true;
    if (bot) {
      user = {
        email: "System Bot."
      }
      title = "Bot Action, " + title;
    } else {
      title = "User Action, " + title;
    }

    if (studentId) {
      if (!debug.oldRecord) {
        debug.oldRecord = {};
      }

      if (!debug.oldRecord.transaction) {
        debug.oldRecord.transaction = {};
      }

      debug.oldRecord.transaction.studentId = studentId;
    }

    this.logData = {
      id: id,
      page: this.page,
      title,
      event,
      debug: { ...debug, user },
    };
    return this;
  }

  public async zoom(
    oldRecord: {
      zoomUser?: ZoomUser;
      zoomMeeting?: ZoomMeeting;
      user?: User | any;
    },
    newRecord: {
      zoomUser: ZoomUser;
      zoomMeeting?: ZoomMeeting;
      user?: User | any;
    },
    user: object | boolean
  ) {
    this.page = "zoom";
    const logData = await zoomLogGenerator(oldRecord, newRecord, user);
    this.logData = {
      id: newRecord?.user?.id,
      page: this.page,
      title: this.page,
      event: this.page,
      debug: {},
      ...logData,
    };
    return this;
  }

  public async customZoom(
    id: string,
    title: string,
    event: string,
    debug: object,
    user: object | boolean
  ) {
    this.page = "zoom";
    this.logData = {
      id: id,
      page: this.page,
      title,
      event,
      debug: { ...debug, user },
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
