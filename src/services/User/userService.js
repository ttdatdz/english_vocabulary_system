import { del, get, patch, post } from "../../utils/request";

export const GetAllUsers = async () => {
  const result = await get("admin/UserManagement");
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
