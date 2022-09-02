const Razorpay = require("razorpay");

const client = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SCERET,
});

export const getPaymentById = async (id: string) => {
  return await client.paymentLink.fetch(id);
};

export const getInstallmentPaymentById = async (id: string) => {
  return await client.payments.fetch(id);
};

export const getSubscriptionById = async (subscriptionId: string) => {
  return await client.subscriptions.fetch(subscriptionId);
};

export interface Payment {
  id: string;
  status: string;
  amount: number;
  short_url: number;
  payments: any[];
}

export default client;
