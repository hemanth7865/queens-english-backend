const moment = require("moment");

export const getDateFromTimeStamp = (dateTimeStamp) => {
    return moment.unix(dateTimeStamp).format("DD/MM/YYYY")
}

export const checkRangeOfDate = (billingStartDate, billingEndDate, dueDate) => {
    const billingStartDateC = getDateFromTimeStamp(billingStartDate);
    const billingEndDateC = getDateFromTimeStamp(billingEndDate);
    const billingStartDated = new Date(billingStartDateC);
    const billingEndDated = new Date(billingEndDateC);
    dueDate = new Date(dueDate);

    console.log('dates', billingStartDate, billingEndDate, dueDate, billingEndDateC, billingEndDated);
    if (dueDate.getTime() <= billingEndDated.getTime()
        && dueDate.getTime() >= billingStartDated.getTime()) {
        console.log('true');
        return true;
    } else {
        console.log('false');
        return false;
    }
}