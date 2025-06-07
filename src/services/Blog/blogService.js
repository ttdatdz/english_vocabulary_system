import { del, get, postFormData, put, putFormData } from "../../utils/request";

export const GetAllBlogs = async () => {
  const result = await get("api/blog/getAll");
  return result;
};
export const DeleteBlog = async (id) => {
  const result = await del(`api/blog/delete/${id}`);
  return result;
};
export const UpdateBlog = async (value, id) => {
  const result = await putFormData(`api/blog/update/${id}`, value);
  return result;
};
export const CreateBlog = async (value) => {
  const result = await postFormData("api/blog/create", value);
  return result;
};
// export const GetBlogById = async (id) => {
//   const result = await get(`api/blog/category/getById/${id}`);
//   return result;
// };
