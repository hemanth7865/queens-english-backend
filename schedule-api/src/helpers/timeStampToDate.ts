const moment = require("moment");
import { Status, EMI_PAYMENT_STATUS } from "../helpers/Constants"

export const getDateFromTimeStamp = (dateTimeStamp) => {
    return moment.unix(dateTimeStamp).format("MM/DD/YYYY")
}

export const checkRangeOfDate = (billingStartDate, billingEndDate, dueDate) => {
    billingStartDate = getDateFromTimeStamp(billingStartDate);
    billingEndDate = getDateFromTimeStamp(billingEndDate);
    billingStartDate = new Date(billingStartDate);
    billingEndDate = new Date(billingEndDate);
    if (dueDate.getTime() <= billingEndDate.getTime()
        && dueDate.getTime() >= billingStartDate.getTime()) {
        return true;
    } else {
        return false;
    }
}

export const startDateAndDueDateComparison = (startDate, dueDate) => {
    startDate = moment(startDate).format("YYYY-MM");
    if (startDate <= dueDate) {
        return true;
    } else {
        return false;
    }
}

export const compareStatusAndEMIStatus = (status, emiStatus) => {
    if (status === Status.ACTIVE) {
        if (emiStatus === EMI_PAYMENT_STATUS.PENDING) {
            return true
        } else {
            return false
        }
    } else if (status === Status.INACTIVE) {
        if (emiStatus) {
            return false
        } else {
            return true
        }
    }
    else {
        return true;
    }
}