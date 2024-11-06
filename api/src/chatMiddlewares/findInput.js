import { INTENTS } from '../../resources/constants/intents.js';
import { PAYLOADS } from '../../resources/constants/payloads.js';
import { ERROR_CODES, INPUTS, USER_MESSAGE_TYPE } from '../constants.js';

async function getInput(conversation, message) {
  const {
    userMessage,
    intent = null,
    error = null,
    isInitiate,
    isNewUser,
    isNewConversation,
    isLongTimeNoSee,
  } = message;

  if (isInitiate) {
    if (isNewUser || isNewConversation || isLongTimeNoSee) {
      return INPUTS.DEFAULT();
    }
    // if initiate and not new user or conversation, re-send the previous message input
    const previousMessage = await conversation.findLastMessageNotEmpty(message._id);
    if (previousMessage) {
      return previousMessage.input;
    }
  }

  if (error?.name) {
    if (userMessage.type === USER_MESSAGE_TYPE.CONTACT_SIMPLE_SEND) {
      if (error?.name === ERROR_CODES.TOO_MANY_EMAILS_SENDED_AT_TIME) {
        return INPUTS.CONTACT_SIMPLE(userMessage.content);
      }
      return INPUTS.CONTACT_SIMPLE({ ...userMessage.content, email: '' });
    }
  }

  if (userMessage.content?.payload === PAYLOADS.CONTACT_SIMPLE) {
    return INPUTS.CONTACT_SIMPLE({});
  }

  if (intent?.displayName === INTENTS.Q_CONTACT_SIMPLE) {
    return INPUTS.CONTACT_SIMPLE({});
  }
  return INPUTS.DEFAULT();
}

const findInputMiddleware = (socket, conversation) => (next) => async (message) => {
  message.input = await getInput(conversation, message);
  await next(message);
};

export default findInputMiddleware;
