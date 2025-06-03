import { del, get, patch, post } from "../../utils/request";

export const GetAllUsers = async () => {
  const result = await get("api/user/getAllUsers");
  return result;
};
export const DeleleUser = async (id) => {
  const result = await del(`admin/UserManagement/${id}`);
  return result;
};
export const UpdateUser = async (value, id) => {
  const result = await patch(value, `admin/UserManagement/${id}`);
  return result;
};
export const GetDetailUser = async (id) => {
  const result = await get(`api/user/getUserByFilter?userID=${id}`);
  return result;
};
