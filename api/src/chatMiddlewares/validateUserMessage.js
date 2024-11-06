import _ from 'lodash';
import { USER_MESSAGE_TYPE } from '../constants.js';
import { getSetting, getSettings } from '../controllers/settingController.js';

const cleanString = (text = '', maxLength = 128) => _.escape(text.trim().slice(0, maxLength));

const cleanUserMessage = async (userMessage) => {
  const { type, content } = userMessage;
  const language = cleanString(userMessage.language, 3);
  switch (type) {
    case USER_MESSAGE_TYPE.CONTACT_SIMPLE_SEND: {
      const {
        USER_TEXT_MAX_LENGTH, USER_CONTACT_BODY_MAX_LENGTH,
      } = await getSettings('USER_TEXT_MAX_LENGTH', 'USER_CONTACT_BODY_MAX_LENGTH');
      return {
        type,
        language,
        content: {
          email: cleanString(content.email, USER_TEXT_MAX_LENGTH),
          name: cleanString(content.name, USER_TEXT_MAX_LENGTH),
          body: cleanString(content.body, USER_CONTACT_BODY_MAX_LENGTH),
        },
      };
    }
    case USER_MESSAGE_TYPE.INITIATE:
    case USER_MESSAGE_TYPE.CONTACT_SIMPLE_CANCEL:
      return { type, language };
    case USER_MESSAGE_TYPE.DEFAULT: {
      const USER_TEXT_INTENT_MAX_LENGTH = await getSetting('USER_TEXT_INTENT_MAX_LENGTH');
      return {
        type,
        language,
        content: {
          text: cleanString(content?.text, USER_TEXT_INTENT_MAX_LENGTH),
          payload: cleanString(content?.payload),
        },
      };
    }
    default:
      return { type: cleanString(type), language };
  }
};

const validateUserMessageMiddleware = (socket, conversation) => (next) => async (userMessage) => {
  // validate send_userMessage argument
  if (typeof userMessage !== 'object') {
    throw new Error('send_userMessage argument is not an object');
  }
  const type = userMessage?.type;
  if (!type || typeof type !== 'string' || !USER_MESSAGE_TYPE[type]) {
    throw new Error('send_userMessage type is invalid');
  }

  const cleanedUserMessage = await cleanUserMessage(userMessage);
  await next(cleanedUserMessage);
};

export default validateUserMessageMiddleware;
