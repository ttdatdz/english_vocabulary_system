import { post } from "../../utils/request";

export const ContributeSingle = async (value) => {
  const result = await post(
    value,
    "api/question-bank/contribute/singleQuestion/bulk",
    true,
  );
  return result;
};
export const ContributeGroup = async (value) => {
  const result = await post(
    value,
    "api/question-bank/contribute/groupQuestion/bulk",
    true,
  );
  return result;
};
