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