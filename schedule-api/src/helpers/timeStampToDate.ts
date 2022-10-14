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

export const monthYearComparison = (startDate, dueDate) => {
    startDate = moment(startDate).format("YYYY-MM");
    if (startDate <= dueDate) {
        return true;
    } else {
        return false;
    }
}

export const comparisonStatus = (status, emiStatus) => {
    if ((status === Status.INACTIVE && emiStatus === EMI_PAYMENT_STATUS.FULLY_PAID) || (status === Status.INACTIVE && emiStatus === EMI_PAYMENT_STATUS.PENDING) || (status === Status.INACTIVE && emiStatus === EMI_PAYMENT_STATUS.QUARTERLY_PAID) || (status === Status.ACTIVE && emiStatus === EMI_PAYMENT_STATUS.FULLY_PAID) || (status === Status.ACTIVE && emiStatus === EMI_PAYMENT_STATUS.QUARTERLY_PAID)) {
        return false;
    } else {
        return true;
    }
}