// file deepcode ignore AttrAccessOnNull: <please specify a reason of ignoring this>
import _ from 'lodash';
import { COMPANY_ENTITY, TECHNOLOGY_ENTITY } from '../../resources/constants/entity.js';
import { INTENTS } from '../../resources/constants/intents.js';
import { PAYLOADS, getCompanyPayloadCompanyExperience } from '../../resources/constants/payloads.js';
import {
  RESPONSE_ID, RESPONSE_ID_MAP, makeResponseIdCanWorkTechnology, makeResponseIdCompanyExperience, makeResponseIdDidWorkTechnology,
  makeResponseIdSmalltalk,
} from '../../resources/constants/responseId.js';
import { ERROR_CODES, USER_MESSAGE_TYPE } from '../constants.js';
import { getEntityValue } from '../controllers/nluController.js';

function findKey(value, searchKey = 'intents') {
  // use of get, because we can have RESPONSE_ID_MAP without payloads or intents
  return Object.keys(RESPONSE_ID_MAP).find((key) => _.get(RESPONSE_ID_MAP[key], `${searchKey}`, []).includes(value));
}

async function setResponseId(message) {
  const {
    userMessage,
    intent = null,
    parameters = null,
    error = null,
    isInitiate = false,
    isNewUser = false,
    isNewConversation = false,
    isLongTimeNoSee = false,
    isDifferentLanguage = false,
    isSupportedLanguage = true,
  } = message;

  if (isInitiate) {
    if (isNewUser || isNewConversation) return RESPONSE_ID.R_FIRST_WELCOME;
    if (isLongTimeNoSee) return RESPONSE_ID.R_LONG_TIME_WELCOME;
    return RESPONSE_ID.R_EMPTY;
  }

  if (isDifferentLanguage && !isSupportedLanguage) {
    return RESPONSE_ID.R_NOT_SUPPORTED_LANGUAGE;
  }

  if (error?.name) {
    switch (error?.name) {
      case ERROR_CODES.INVALID_EMAIL_FORMAT_ERROR:
        // handle invalid email format error
        return RESPONSE_ID.R_CONTACT_SIMPLE_EMAIL_FORMAT_INVALID;
      case ERROR_CODES.INVALID_EMAIL_ADDRESS_ERROR:
        // handle invalid email address error
        return RESPONSE_ID.R_CONTACT_SIMPLE_EMAIL_ADDRESS_INVALID;
      case ERROR_CODES.TOO_MANY_SIMPLE_CONTACT_BY_USER:
        // handle too many simple contact by language error
        return RESPONSE_ID.R_TOO_MANY_CONTACT_SIMPLE_BY_USER;
      case ERROR_CODES.TOO_MANY_EMAILS_SENDED_AT_TIME:
        // handle too many emails sended at time error
        return RESPONSE_ID.R_TOO_MANY_EMAIL_SENDED_AT_TIME;
      default:
        return RESPONSE_ID.R_ERROR;
    }
  }

  switch (userMessage?.type) {
    case USER_MESSAGE_TYPE.CONTACT_SIMPLE_CANCEL:
      return RESPONSE_ID.R_CANCEL_CONTACT_SIMPLE;
    case USER_MESSAGE_TYPE.CONTACT_SIMPLE_SEND:
      return RESPONSE_ID.R_SEND_CONTACT_SIMPLE;
    default:
  }

  if (intent?.displayName === INTENTS.Q_CHANGE_LANGUAGE || userMessage?.content?.payload === PAYLOADS.CHANGE_LANGUAGE) {
    const languageValue = getEntityValue(parameters, 'language');
    if (languageValue) {
      // if language is specified
      if (['francais', 'french'].includes(languageValue.toLowerCase())
        || ['english', 'anglais'].includes(languageValue.toLowerCase())
      ) {
        // if language is supported
        return RESPONSE_ID.R_CHANGE_LANGUAGE;
      }
      return RESPONSE_ID.R_NOT_SUPPORTED_LANGUAGE;
    }
    return RESPONSE_ID.R_CHANGE_LANGUAGE;
  }

  if (intent?.displayName) {
    if (intent.displayName.startsWith(INTENTS.SMALLTALKS_PREFIX)) {
      return makeResponseIdSmalltalk(intent.displayName);
    }

    if (intent?.displayName === INTENTS.Q_CAN_WORK_TECHNOLOGY) {
      const technology = getEntityValue(parameters, TECHNOLOGY_ENTITY.name);
      const technoLevel = TECHNOLOGY_ENTITY.values[technology]?.level;
      return makeResponseIdCanWorkTechnology(technoLevel);
    }

    if (intent?.displayName === INTENTS.Q_DID_WORK_TECHNOLOGY) {
      const technology = getEntityValue(parameters, TECHNOLOGY_ENTITY.name);
      return makeResponseIdDidWorkTechnology(technology);
    }

    if (intent?.displayName === INTENTS.Q_COMPANY_EXPERIENCE) {
      const company = getEntityValue(parameters, COMPANY_ENTITY.name);
      return makeResponseIdCompanyExperience(company);
    }
  }

  if (userMessage?.content?.payload) {
    if (userMessage?.content?.payload.startsWith(PAYLOADS.COMPANY_EXPERIENCE)) {
      const company = getCompanyPayloadCompanyExperience(userMessage.content.payload);
      return makeResponseIdCompanyExperience(company);
    }
    const keyFindByPayload = findKey(userMessage.content.payload, 'payloads');
    if (keyFindByPayload) return keyFindByPayload;
  }

  if (intent?.displayName) {
    const keyFindByIntent = findKey(intent.displayName, 'intents');
    if (keyFindByIntent) return keyFindByIntent;
  }
  return RESPONSE_ID.R_FALLBACK;
}

const setResponseIdMiddleware = (socket, conversation) => (next) => async (message) => {
  message.responseId = await setResponseId(message);
  await next(message);
};

export default setResponseIdMiddleware;
