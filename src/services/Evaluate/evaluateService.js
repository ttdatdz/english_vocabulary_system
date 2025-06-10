import { del, get, postFormData, put } from "../../utils/request";

export const GetAllEvaluate = async () => {
  const result = await get("api/evaluate/get");
  return result;
};
export const DeleteEvaluate = async (id) => {
  const result = await del(`api/evaluate/delete/${id}`);
  return result;
};
export const UpdateEvaluate = async (value, id) => {
  const result = await put(value, `api/evaluate/update/${id}`);
  return result;
};
export const CreateEvaluate = async (value) => {
  const result = await postFormData("api/blog/create", value);
  return result;
};

// export const GetEvaluateById = async (id) => {
//   const result = await get(`api/blog/category/getById/${id}`);
//   return result;
// };
