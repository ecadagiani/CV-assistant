import { COMPANY_ENTITY, TECHNOLOGY_ENTITY } from '../../resources/constants/entity.js';
import { INTENTS } from '../../resources/constants/intents.js';
import { PAYLOADS, getCompanyPayloadCompanyExperience } from '../../resources/constants/payloads.js';
import {
  QUESTION_ID, QUESTION_ID_MAP,
  makeQuestionIdCanWorkTechnology, makeQuestionIdCompanyExperience, makeQuestionIdDidWorkTechnology, makeQuestionIdSmalltalk,
} from '../../resources/constants/questionId.js';
import { USER_MESSAGE_TYPE } from '../constants.js';
import { getEntityValue } from '../controllers/nluController.js';
import { logInfo } from '../utils/logger.js';

function findKey(value, searchKey = 'intents') {
  return Object.keys(QUESTION_ID_MAP).find((key) => QUESTION_ID_MAP[key][searchKey].includes(value));
}

function setQuestionId(message) {
  switch (message?.userMessage?.type) {
    case USER_MESSAGE_TYPE.INITIATE:
      return QUESTION_ID.Q_INITIATE;
    case USER_MESSAGE_TYPE.CONTACT_SIMPLE_CANCEL:
      return QUESTION_ID.Q_CONTACT_SIMPLE_CANCEL;
    case USER_MESSAGE_TYPE.CONTACT_SIMPLE_SEND:
      return QUESTION_ID.Q_CONTACT_SIMPLE_SEND;
    default:
  }

  if (message.intent?.displayName) {
    if (message.intent.displayName.startsWith(INTENTS.SMALLTALKS_PREFIX)) {
      return makeQuestionIdSmalltalk(message.intent.displayName);
    }

    if (message.intent?.displayName === INTENTS.Q_CAN_WORK_TECHNOLOGY) {
      const technology = getEntityValue(message.parameters, TECHNOLOGY_ENTITY.name);
      return makeQuestionIdCanWorkTechnology(technology);
    }

    if (message.intent?.displayName === INTENTS.Q_DID_WORK_TECHNOLOGY) {
      const technology = getEntityValue(message.parameters, TECHNOLOGY_ENTITY.name);
      return makeQuestionIdDidWorkTechnology(technology);
    }

    if (message.intent?.displayName === INTENTS.Q_COMPANY_EXPERIENCE) {
      const company = getEntityValue(message.parameters, COMPANY_ENTITY.name);
      return makeQuestionIdCompanyExperience(company);
    }
  }

  if (message.userMessage?.content?.payload) {
    if (message.userMessage?.content?.payload.startsWith(PAYLOADS.COMPANY_EXPERIENCE)) {
      const company = getCompanyPayloadCompanyExperience(message.userMessage.content.payload);
      return makeQuestionIdCompanyExperience(company);
    }
    const keyFindByPayload = findKey(message.userMessage.content.payload, 'payloads');
    if (keyFindByPayload) {
      return keyFindByPayload;
    }
  }

  if (message.intent?.displayName) {
    const keyFindByIntent = findKey(message.intent.displayName, 'intents');
    if (keyFindByIntent) {
      return keyFindByIntent;
    }
  }
  return QUESTION_ID.Q_UNKNOWN;
}

const setQuestionIdMiddleware = (socket, conversation) => (next) => async (message) => {
  message.questionId = setQuestionId(message);
  logInfo({ userId: conversation.user._id, conversationId: conversation._id }, `set questionId: ${message.questionId}`);
  await next(message);
};

export default setQuestionIdMiddleware;
