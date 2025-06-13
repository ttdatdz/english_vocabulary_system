import { del, get, post, postFormData, put } from "../../utils/request";

export const GetAllExams = async () => {
  const result = await get("api/exam/filter");
  return result;
};
export const DeleteExam = async (id) => {
  const result = await del(`api/exam/delete/${id}`);
  return result;
};
export const CreateExam = async (value) => {
  const result = await post(value, "api/exam/create", true);
  return result;
};

export const importFileQuestion = async (formData) => {
  const result = await postFormData("api/exam/importQuestions", formData);
  return result;
};
export const UpdateExam = async (value, id) => {
  const result = await put(value, `api/exam/update/${id}`);
  return result;
};
export const getDetailExam = async (id) => {
  const result = await get(`api/exam/detail/${id}`);
  return result;
};
export const SubmitExam = async (value) => {
  const result = await post(value, "api/exam/submit", true);
  return result;
};
