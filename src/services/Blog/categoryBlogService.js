import { del, get, patch, post, put } from "../../utils/request";

export const GetAllCategoryBlogs = async () => {
  const result = await get("api/blog/category/getAll");
  return result;
};
export const DeleteCategoryBlog = async (id) => {
  const result = await del(`api/blog/category/delete/${id}`);
  return result;
};
export const UpdateCategoryBlog = async (value, id) => {
  const result = await put(value, `api/blog/category/update/${id}`);
  return result;
};
export const CreateCategoryBlog = async (value) => {
  const result = await post(value, "api/blog/category/create", true);
  return result;
};
export const GetCategoryBlogById = async (id) => {
  const result = await get(`api/blog/category/getById/${id}`);
  return result;
};
