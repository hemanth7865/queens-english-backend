const moment = require("moment");

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
    console.log('start date', startDate, dueDate)
    if (startDate <= dueDate) {
        return true;
    } else {
        return false;
    }
}