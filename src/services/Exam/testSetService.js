import { del, get, patch, post } from "../../utils/request";

export const GetAllTestSets = async () => {
  const result = await get("admin/TestSetManagement");
  return result;
};
export const DeleleTestSet = async (id) => {
  const result = await del(`admin/TestSetManagement/${id}`);
  return result;
};
export const UpdateTestSet = async (value, id) => {
  const result = await patch(value, `admin/TestSetManagement/${id}`);
  return result;
};
export const CreateTestSet = async (value) => {
  const result = await post(value, "admin/TestSetManagement", true);
  return result;
};
