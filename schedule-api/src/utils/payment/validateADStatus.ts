import { isNullOrUndefined } from "util";
import { CashFreeUtils } from "./CashFreeUtils";
import { getRazorpayInvoicesForSubscription, getRazorpayOrder, getPaymentById } from "./../../services/RazorpayService"
import { CASHFREE_PAYMENT_STATUS, RAZORPAY_PAYMENT_STATUS } from "./../../helpers/Constants";
import { checkRangeOfDate } from "./../../helpers/timeStampToDate";

const { usersLogger } = require("../../Logger.js");
const moment = require("moment");
const axios = require("axios");


export class validatePaymentStatus {
    private cashFreeUtils = new CashFreeUtils();

    async cashfreeStatusValidation(installmentDetails: any) {
        try {
            let result = {
                error: 0,
                paid: 0,
                pending: 0,
                failed: 0
            };
            const dueMonth = moment(installmentDetails.dueDate).format("YYYY-MM");
            let cashfreeValidation = await this.cashFreeUtils.fetchSubscriptionDetails(installmentDetails.subscriptionId);
            if (isNullOrUndefined(cashfreeValidation) && isNullOrUndefined(cashfreeValidation!.payments) && cashfreeValidation!.payments.length === 0) {
                return result.error++;
            } else {
                let payments: any = cashfreeValidation.payments;
                for (const payment of payments) {
                    usersLogger.debug("pay: " + JSON.stringify(payment));
                    if (
                        payment["addedOn"].includes(dueMonth) &&
                        payment["status"] === CASHFREE_PAYMENT_STATUS.SUCCESS
                    ) {
                        if (payment["amount"] === installmentDetails.emiAmount) {
                            result.paid++;
                        }
                        else if (payment["amount"] > 1) {
                            usersLogger.info("Partially paid record: " + installmentDetails.id);
                            result.paid++;
                        }
                        break;
                    } else if (
                        payment["addedOn"].includes(dueMonth) &&
                        payment["status"] == CASHFREE_PAYMENT_STATUS.FAILED
                    ) {

                        usersLogger.info("Status for failed cases ");
                        result.failed++;
                        break;
                    } else {
                        result.error++;
                        break;
                    }
                }
                return result;
            }

        } catch (error) {
            usersLogger.error("error" + JSON.stringify(error));
            console.log('error', error);
        }
    }

    async razorpayAutoDebitValidation(installmentDetails: any) {
        try {
            let result = {
                error: 0,
                paid: 0,
                pending: 0,
                failed: 0
            };
            const invoiceDetails: any = await getRazorpayInvoicesForSubscription(installmentDetails.subscriptionId);
            if (!invoiceDetails || invoiceDetails?.items.length === 0) {
                usersLogger.error("Razorpay AD Invoice payment details is empty");
                result.error++;
                return result;
            }
            let data: any;
            const dueMonth = moment(installmentDetails.dueDate).format("YYYY-MM");
            for (const payments of invoiceDetails?.items) {
                if (checkRangeOfDate(payments.billing_start, payments.billing_end, installmentDetails.dueDate) || moment.unix(payments.paid_at).format("YYYY-MM-DD").includes(dueMonth)) {
                    usersLogger.info(`Invoice for paid data: ${JSON.stringify(payments)}`);
                    data = {
                        invoiceStatus: payments.status,
                        orderId: payments.order_id,
                    };
                    break;
                }
            }

            if (!data) {
                usersLogger.error("Razorpay AD Invoice payment details data is empty");
                result.error++;
                return result;
            }
            const paymentStatusDetails: any = await getRazorpayOrder(data.orderId);
            if (!paymentStatusDetails || paymentStatusDetails.items.length === 0) {
                usersLogger.error("Razorpay AD order payment details is empty");
                result.error++;
                return result;
            } else {
                if (
                    paymentStatusDetails.items[paymentStatusDetails.items.length - 1]
                        .status === RAZORPAY_PAYMENT_STATUS.SUCCESS &&
                    paymentStatusDetails.items[paymentStatusDetails.items.length - 1]
                        .amount /
                    100 >=
                    Number(installmentDetails.emiAmount)
                ) {
                    usersLogger.error("Razorpay AD status paid");
                    result.paid++;
                    return result;
                } else if (
                    paymentStatusDetails.items[paymentStatusDetails.items.length - 1]
                        .status === RAZORPAY_PAYMENT_STATUS.FAILED
                ) {
                    usersLogger.error("Razorpay AD status failed");
                    result.failed++;
                    return result;
                } else {
                    usersLogger.error("Razorpay AD status Pending");
                    result.pending++;
                    return result;
                }
            }

        } catch (error) {
            usersLogger.error("error" + JSON.stringify(error));
            console.log('error', error);
        }
    }

    async razorpayManualValidation(paymentId: any) {
        try {
            let result = {
                error: 0,
                paid: 0,
                pending: 0,
                failed: 0
            };
            const paymentStatusDetails: any = await getPaymentById(paymentId);
            if (!paymentStatusDetails || !paymentStatusDetails.payments) {
                result.error++;
                return result;
            } else {
                if (paymentStatusDetails.status === "paid") {
                    result.paid++;
                    return result;
                } else {
                    result.pending++;
                    return result;
                }
            }
        } catch (error) {
            usersLogger.error("error" + JSON.stringify(error));
            console.log('error', error);
        }
    }
}