import { stringify } from "ajv";
import { del, get, putFormData } from "../../utils/request";

export const GetAllUsers = async () => {
  const response = await get("api/user/getAllUsers");
  return response;
}
export const DeleteUser = async (id) => {
  const response= await del(`api/user/delete/${id}`);
  return response;
};
export const UpdateUser = async (value) => {
  const response = await putFormData(`api/user/update`, value);
  return response;
};
export const GetDetailUser = async (id) => {
  const response = await get(`api/user/getUserByFilter?userID=${id}`);
  return response;
};
export const RenewalTokenAPI = async (renewalToken) => {
  const response = await fetch("/api/user/renewalToken", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${renewalToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const error = new Error("Failed to renew token");
    error.response = response;
    throw error;
  }
  return response;
};