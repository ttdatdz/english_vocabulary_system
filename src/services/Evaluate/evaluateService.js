import { del, get, postFormData, put, putFormData } from "../../utils/request";

export const GetAllEvaluate = async () => {
  const result = await get("api/blog/getAll");
  return result;
};
export const DeleteEvaluate = async (id) => {
  const result = await del(`api/blog/delete/${id}`);
  return result;
};
export const UpdateEvaluate = async (value, id) => {
  const result = await putFormData(`api/blog/update/${id}`, value);
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
