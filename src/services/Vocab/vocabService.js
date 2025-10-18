import { get } from "../../utils/request";

export const fillVocab = async (vocab) => {
  const response = await get(`api/card/fill?word=${vocab}`);
  return response;
};
export const getByFlashCard = async (flashcardId) => {
  const response = await get(`api/card/getByFlashCard/${flashcardId}`);
  return response;
};
