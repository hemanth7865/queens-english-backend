export const PAYMENT_STATUS = {
    PENDING: 'Installment Pending',
    PAID: 'Installment Paid',
    FAILED: 'Installment Failed'
}

export const PAYMENT_MODE = {
    RAZORPAY: "RazorPay",
    CASHFREE: 'Cashfree',
    DOWNPAYMENT_RAZORPAY: "Razorpay",
    DOWNPAYMENT_CASHFREE: "Cashfree",
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
}

export const SUBSCRIPTION_TYPE = {
    MANUAL: 'Manual',
    AUTO_DEBIT: 'Auto-Debit'
}

export const CASHFREE_PAYMENT_STATUS = {
    SUCCESS: 'SUCCESS',
    PENDING: 'PENDING',
    FAILED: 'FAILED',
    ACTIVE: 'ACTIVE'
}

export const RAZORPAY_PAYMENT_STATUS = {
    SUCCESS: "captured",
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

/**
 * TODO: Add all used cosmos API links here
 */
export const COSMOS_API = {
    GET_BATCH: (id: string): string => `/api/classProfile/${id}`,
};