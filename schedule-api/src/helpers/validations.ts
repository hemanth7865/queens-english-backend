import { StudentService } from "../services/StudentService";
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
        var message = "";
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

        const leadIDExists = await (new StudentService()).isLeadIDExists("studentID", student.studentID, student.id);

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


        if (!isEntryStatus) {
            status = "Error";
            message = "Fill all the student details";
        }
        if (!isValidation) {
            status = "Error";
            message = "Enter correct payment details";
        }
        if (leadIDExists) {
            status = "Error";
            message = "Student ID already exists";
        }
        return { status, message };
    }
}
