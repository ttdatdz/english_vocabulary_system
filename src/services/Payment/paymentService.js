import { get, post } from "../../utils/request";

export const getPaymentByTxnRef = async (txnRef) => {
  console.log("txnRef", txnRef);
  const response = await get(`api/payment/${txnRef}`);
  return response;
};
export const getPaymentsByUser = async (userId) => {
  const response = await get(`api/payment/getPaymentsByUser?userId=${userId}`);
  return response;
};
export const createURLPayment = async (values) => {
  const result = await post(values, `/api/payment/vnpay/create`, true);
  return result;
};
export const checkExpiration = async (userId) => {
  const result = await get(`/api/payment/checkExpiration?userId=${userId}`);
  return result;
};
export const validPayments = async (userId) => {
  const result = await get(`/api/payment/validPayments?userId=${userId}`);
  return result;
};
