import { del, get, putFormData } from "../../utils/request";

export const GetAllUsers = async () => {
  const result = await get("api/user/getAllUsers");
  return result;
};
export const DeleteUser = async (id) => {
  const result = await del(`api/user/delete/${id}`);
  return result;
};
export const UpdateUser = async (value) => {
  const result = await putFormData(`api/user/update`, value);
  return result;
};
export const GetDetailUser = async (id) => {
  const result = await get(`api/user/getUserByFilter?userID=${id}`);
  return result;
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

  return await response.json(); // Giả sử backend trả về { token: ... }
};