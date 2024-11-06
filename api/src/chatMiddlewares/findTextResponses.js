import { RESPONSE_ID, RESPONSE_ID_MAP } from '../../resources/constants/responseId.js';
import { RESPONSE_DATA } from '../../resources/constants/responsesData.js';
import { getResponse } from '../controllers/responsesController/responses.js';


async function findTextResponses(message) {
  // to avoid de-sync between textResponse and responseId: Only use responseId to find the response
  // eslint-disable-next-line no-unused-vars
  const { language, responseId, intent } = message;
  if (RESPONSE_ID_MAP[responseId] && RESPONSE_DATA[responseId]) {
    return getResponse(responseId)(language);
  }
  if (responseId === RESPONSE_ID.R_EMPTY) {
    return [];
  }

  if (responseId.startsWith(RESPONSE_ID.R_CAN_WORK_TECHNOLOGY)) {
    return getResponse(RESPONSE_ID.R_CAN_WORK_TECHNOLOGY)(message);
  }
  if (responseId.startsWith(RESPONSE_ID.R_COMPANY_EXPERIENCE)) {
    return getResponse(RESPONSE_ID.R_COMPANY_EXPERIENCE)(message);
  }
  if (responseId.startsWith(RESPONSE_ID.R_DID_WORK_TECHNOLOGY)) {
    return getResponse(RESPONSE_ID.R_DID_WORK_TECHNOLOGY)(message);
  }
  if (responseId.startsWith(RESPONSE_ID.R_SMALLTALK)) {
    return getResponse(RESPONSE_ID.R_SMALLTALK)(message);
  }

  return getResponse(RESPONSE_ID.R_FALLBACK)(language);
}

const findTextResponsesMiddleware = (socket, conversation) => (next) => async (message) => {
  const responses = await findTextResponses(message);
  message.responses = responses;
  await next(message);
};

export default findTextResponsesMiddleware;
