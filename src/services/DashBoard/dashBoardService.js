import { del, get, postFormData, put, putFormData } from "../../utils/request";

export const GetAllRecords = async () => {
  const result = await get("api/dashboard/totalRecords");
  return result;
};
export const GetAttemptcountPerDay = async (startDay, endDay) => {
  const result = await get(
    `api/dashboard/attempLog/countPerDay?start=${startDay}&end=${endDay}`
  );
  return result;
};
// export const UpdateBlog = async (value, id) => {
//   const result = await putFormData(`api/blog/update/${id}`, value);
//   return result;
// };
// export const CreateBlog = async (value) => {
//   const result = await postFormData("api/blog/create", value);
//   return result;
// };
