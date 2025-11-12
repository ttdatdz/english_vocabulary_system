import { get } from "../../utils/request";

export const getPaymentByTxnRef = async (txnRef) => {
  console.log("txnRef", txnRef);
  const response = await get(`api/payment/${txnRef}`);
  return response;
};
export const getPaymentsByUser = async (userId) => {
  const response = await get(`api/payment/getPaymentsByUser?userId=${userId}`);
  return response;
};
