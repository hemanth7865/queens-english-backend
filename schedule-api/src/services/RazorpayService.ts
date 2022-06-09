const Razorpay = require("razorpay");

const client = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SCERET,
});

export const getPaymentById = async (id: string) => {
  return await client.payments.fetch(id);
};

export default client;
