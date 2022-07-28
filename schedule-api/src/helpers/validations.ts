import { StudentService } from "../services/StudentService";
import { PaymentService } from "../services/PaymentService";
import { PAYMENT_MODE, CASHFREE_PAYMENT_STATUS, SUBSCRIPTION_TYPE } from "../helpers/Constants";
import { CashFreeUtils } from "../utils/payment/CashFreeUtils";
import { isNullOrUndefined } from "util";

export class validations {
    async validateStudent(type, student, user, payment) {
        student = JSON.parse(JSON.stringify(student));
        var total;
        if (type == 'LSQValidate') {
            total = {
                ...student,
                ...user,
                ...payment
            }
        }
        if (type == 'StudentValidate') {
            const payments = student.payment[0];
            delete student["payment"]
            total = {
                ...student,
                ...payments
            }
        }
        var status = "Enrolled";
        var message;
        var p = total;
        var paymentTally = (Number(total.saleamount) - (Number(total.emi * total.emiMonths) + Number(total.downpayment)))
        var isEntryStatus = false;
        var isTempEntryStatus = true;
        var isValidation = false;
        for (var key in p) {
            if (p.hasOwnProperty(key)) {
                if (key == "customerEmail" || key == "timings" || key == "courseFrequency" || key == "firstName" || key == "alternativeMobile" || key == "course" || key == "startLesson" || key == "startDate" || key == "paymentMode" || key == "emiMonths" || key == "emi" || key == "subscription" || key == "saleamount" || key == "classessold" || key == "downpayment" || key == "paymentid" || key == "address" || key == "whatsapp" || key == "dob" || key == "status" || key == "phoneNumber" || key == "studentID") {
                    var tempKeyValue = p[key] + "";
                    if (isTempEntryStatus) {
                        if (tempKeyValue.length > 0 && tempKeyValue != "undefined" && tempKeyValue != "null" && tempKeyValue != " ") {
                            isEntryStatus = true;
                            if (total.saleamount != 0 && total.downpayment != 0 && paymentTally == 0) {
                                isValidation = true;
                            }
                        }
                        else {
                            isEntryStatus = false;
                            isTempEntryStatus = false;
                        }
                    }
                }
            }
        }
        if (!isEntryStatus) {
            status = "Error";
            message = "Mandatory student details are missing";
        }
        if (!isValidation) {
            status = "Error";
            message = "payment details are incorrect";
        }

        //validate for duplicate leadid
        const leadIDExists = await (new StudentService()).isLeadIDExists("studentID", student.studentID, student.id);
        if (leadIDExists) {
            status = "Error";
            message = "Student ID already exists";
        }

        //Validate for Cashfree payment Mode
        if (total.subscription === SUBSCRIPTION_TYPE.AUTO_DEBIT) {
            if (total.paymentMode === PAYMENT_MODE.CASHFREE) {
                const cashFreeResponse: any = await (new CashFreeUtils()).fetchCashfreeAccountDetail(total.subscriptionNo);
                if (!isNullOrUndefined(cashFreeResponse)) {
                    if (cashFreeResponse.subscription.status != CASHFREE_PAYMENT_STATUS.ACTIVE) {
                        status = "Error";
                        message = "This Payment account is not active";
                    }
                } else {
                    status = "Error";
                    message = "This Payment account is not available. Please check subscription Number";
                }
            }
        }

        //validate the downpayment for razorpay and cashfree
        if (status != "Error") {
            const verifyDownpayment = await (new PaymentService()).verifyDownPayment({ force: false, id: total.id, payment: [total] });
            if (verifyDownpayment.message.error == 0 && verifyDownpayment.message.paid == 0) {
                status = "Error";
                message = `Selected Payment is Not Found`;
            }
            if (verifyDownpayment.message.error == 1 && verifyDownpayment.message.paid == 0) {
                status = "Error";
                message = "Failed To Verify Down Payment"
            }
        }

        return { status, message };
    }
}
