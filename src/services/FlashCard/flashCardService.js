import { get } from "../../utils/request";

export const checkTopicOfUser = async (topicID) => {
  console.log("topicID", topicID);
  const response = await get(`api/flashcard/checkTopicOfUser/${topicID}`);
  return response;
};
