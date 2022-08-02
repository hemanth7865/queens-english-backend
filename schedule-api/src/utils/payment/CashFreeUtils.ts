import { isNullOrUndefined } from "util";

const { usersLogger } = require("../../Logger.js");
const moment = require("moment");
const axios = require("axios");


const clientId = process.env.CASHFREE_CLIENTID;
const secret = process.env.CASHFREE_SECRET;
const cashfreeUrl = process.env.CASHFREE_URL;
const paymentsUrl = process.env.CASHFREE_PAYMENTS_URL;
const retryUrl = process.env.CASHFREE_RETRY_URL;

const params = {
  'X-Client-Id': clientId,
  'X-Client-Secret': secret
};

export class CashFreeUtils {

  async fetchSubscriptionDetails(subscriptionId: string) {
    let response: any = null;
    usersLogger.info('inside cash free utils fetch details');
    await axios.get(`${cashfreeUrl}${subscriptionId}${paymentsUrl}`, { headers: params }).then((resp) => {
      if (!isNullOrUndefined(resp.data)) {
        usersLogger.info('Cashfree response for fetch details: ' + JSON.stringify(resp.data));
        response = resp.data;
      }
      return resp.data;
    }).catch((error) => {
      usersLogger.error('Error in fetching subscription details: ' + JSON.stringify(error));
      return error;
    });
    return response;
  }

  async fetchCashfreeAccountDetail(subscriptionId: string) {
    let response: any = null;
    usersLogger.info('inside cash free utils fetch details of the customer');
    await axios.get(`${cashfreeUrl}${subscriptionId}`, { headers: params }).then((resp) => {
      if (!isNullOrUndefined(resp.data)) {
        usersLogger.info('Cashfree response for fetch details of the customer: ' + JSON.stringify(resp.data));
        response = resp.data;
      }
      return resp.data;
    }).catch((error) => {
      usersLogger.error('Error in fetching subscription details of the customer: ' + JSON.stringify(error));
      return error;
    });
    return response;
  }

  async autoRetryCashfreePayment(subscriptionId: string) {
    console.log('subscriptionId', subscriptionId)
    let response: any = null;
    usersLogger.info('Inside the cashfree auto retry payment');
    await axios.post(`${cashfreeUrl}${subscriptionId}${retryUrl}`, {}, { headers: params })
      .then((resp) => {
        console.log('response', resp)
        if (!isNullOrUndefined(resp.data)) {
          usersLogger.info('Cashfree response for fetch details of the customer: ' + JSON.stringify(resp.data));
          response = resp.data;
        }

        return resp.data;
      }).catch((error) => {
        usersLogger.error('Error in auto retry: ' + JSON.stringify(error));
        console.log('error', error.response.data)
        return error;
      });
    return response;
  }

}