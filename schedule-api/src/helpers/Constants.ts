export const PAYMENT_STATUS = {
    PENDING: 'Installment Pending',
    PAID: 'Installment Paid',
    FAILED: 'Installment Failed',
    PARTIALLY_PAID: 'Partially Paid'
}

export const PAYMENT_MODE = {
    RAZORPAY: "RazorPay",
    CASHFREE: 'Cashfree',
    DOWNPAYMENT_RAZORPAY: "Razorpay",
    DOWNPAYMENT_CASHFREE: "Cashfree",
    JODO: "Jodo",
    AKSHAR: "Akshar",
};


export class Constants {
    public static PARTNER_CODE_QE = "QE";
    public static AUTO_UPDATE_INSTALLMENT_STATUS = "Installment Pending";
}

export const Status = {
    INACTIVE: "inactive",
    ACTIVE: "active",
    ENROLLED: "enrolled",
    STARTCLASSLATER: "startclasslater",
    ERROR: "error",
    ONBOARDING: "onboarding",
    ONBOARDING_ISSUE: "onboardingIssue",
    ENROLLED_CAPS: "Enrolled",
    BATCHING: "batching",
}

export const SUBSCRIPTION_TYPE = {
    MANUAL: 'Manual',
    AUTO_DEBIT: 'Auto-Debit'
}

export const CASHFREE_PAYMENT_STATUS = {
    SUCCESS: 'SUCCESS',
    PENDING: 'PENDING',
    FAILED: 'FAILED',
    ACTIVE: 'ACTIVE',
    ERROR: 'ERROR',
    ON_HOLD: 'ON_HOLD'
}

export const RAZORPAY_PAYMENT_STATUS = {
    SUCCESS: "captured",
    FAILED: "failed",
    ACTIVE: "active",
};

export const ERROR_CODES = {
    ERROR_UPDATED_PAYMENT: "ERROR_UPDATED_PAYMENT",
    ERROR_DOWN_PAYMENT_VERIFICATION: "ERROR_DOWN_PAYMENT_VERIFICATION",
    ERROR_AUTO_RETRY_PAYMENT: "ERROR_AUTO_RETRY_PAYMENT",
};

export const SUCCESS_CODES = {
    SUCCESS_UPDATED_PAYMENT: "SUCCESS_UPDATED_PAYMENT",
    SUCCESS_DOWN_PAYMENT_VERIFICATION: "SUCCESS_DOWN_PAYMENT_VERIFICATION",
    SUCCESS_AUTO_RETRY_PAYMENT: "SUCCESS_AUTO_RETRY_PAYMENT",
}

export const NULL_STRING = {
    NULL: "null"
}

export const MONGOOSE_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

export const EMI_PAYMENT_STATUS = {
    PENDING: "Pending",
    FULLY_PAID: "Fully Paid",
    QUARTERLY_PAID: "Quarterly paid",
};

/**
 * TODO: Add all used cosmos API links here
 */
export const COSMOS_API = {
    GET_BATCH: (id: string): string => `/api/classProfile/${id}`,
    STORE_SHORT_LINK: "/api/shortlink",
    STORE_CLASS_ATTENDANCE: "/api/classAttendance",
};

export const TABLE_NAMES = {
    STUDENT: "student",
    INSTALLMENT: "installment",
    TRANSACTION_DETAILS: "transactionDetails",
    PAYMENT: "payment"
}

export const RESPONSE_STATUS = {
    SUCCESS: "success",
    ERROR: "error"
}

export const CSV_CONSTANTS = {
    STUDENTID: "student_id",
    DUEDATE: "due_date"
}

export const TIME_ZONE = {
    ISTTIMEZONE: "+05:30"
}

export const RAZORPAY_SUBSCRIPTION_STATUS = {
    HALTED: "HALTED"
};

export const AUTODEBIT_STATUS = {
    UNSUCCESSFUL_AD: 'unSuccessfullADInstallment',
    SUCCESSFUL_AD: 'successfullADInstallment'
}