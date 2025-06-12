import { del, get, post, put } from "../../utils/request";

export const GetAllComment = async (id) => {
  const result = await get(`api/exam/${id}/comments`);
  return result;
};

export const DeleteReplyComment = async (id) => {
  const result = await del(`api/exam/reply-comment/delete/${id}`);
  return result;
};
export const DeleteComment = async (id) => {
  const result = await del(`api/exam/comment/delete/${id}`);
  return result;
};
export const CreateComment = async (values) => {
  const result = await post(values, `api/exam/comment/create`, true);
  return result;
};

export const UpdateReplyComment = async (values, id) => {
  const result = await put(values, `api/exam/reply-comment/update/${id}`);
  return result;
};
export const UpdateComment = async (values, id) => {
  const result = await put(values, `api/exam/comment/update/${id}`);
  return result;
};
export const ReplyComment = async (values) => {
  const result = await post(values, `api/exam/reply-comment/create`, true);
  return result;
};
