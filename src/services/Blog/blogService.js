import { del, get, patch, post, put } from "../../utils/request";

export const GetAllBlogs = async () => {
  const result = await get("api/blog/getAll");
  return result;
};
export const DeleteBlog = async (id) => {
  const result = await del(`api/blog/category/delete/${id}`);
  return result;
};
export const UpdateBlog = async (value, id) => {
  const result = await put(value, `api/blog/category/update/${id}`);
  return result;
};
export const CreateBlog = async (value) => {
  const result = await post(value, "api/blog/category/create", true);
  return result;
};
export const GetBlogById = async (id) => {
  const result = await get(`api/blog/category/getById/${id}`);
  return result;
};
