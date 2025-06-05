import { del, get, patch, post, put } from "../../utils/request";

export const GetAllTestSets = async () => {
  const result = await get("api/exam/collection/getAll");
  return result;
};
export const DeleteTestSet = async (id) => {
  const result = await del(`api/exam/collection/delete/${id}`);
  return result;
};
export const UpdateTestSet = async (value, id) => {
  const result = await put(value, `api/exam/collection/update/${id}`);
  return result;
};
export const CreateTestSet = async (value) => {
  const result = await post(value, "api/exam/collection/create", true);
  return result;
};
