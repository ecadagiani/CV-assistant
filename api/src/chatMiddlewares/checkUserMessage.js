import { verifyEmail } from '@devmehq/email-validator-js';
import { serializeError } from 'serialize-error';
import { USER_MESSAGE_TYPE } from '../constants.js';
import { InvalidEmailAddressError, InvalidEmailFormatError } from '../errors.js';

const checkUserMessage = async (conversation, userMessage) => {
  const { type, content } = userMessage;

  switch (type) {
    case USER_MESSAGE_TYPE.CONTACT_SIMPLE_SEND: {
      const { email } = content;
      const { validFormat, validSmtp, validMx } = await verifyEmail({
        emailAddress: email, verifyMx: true, verifySmtp: true, timeout: 500,
      });
      if (validFormat === false) {
        throw new InvalidEmailFormatError();
      }
      if (validSmtp === false || validMx === false) {
        throw new InvalidEmailAddressError();
      }
      break;
    }
    case USER_MESSAGE_TYPE.DEFAULT:
    case USER_MESSAGE_TYPE.INITIATE:
    case USER_MESSAGE_TYPE.CONTACT_SIMPLE_CANCEL:
    default:
      break;
  }
};

const checkUserMessageMiddleware = (socket, conversation) => (next) => async (message) => {
  // check user message
  try {
    // check user message, and throw error if invalid
    await checkUserMessage(conversation, message.userMessage);
  } catch (err) {
    // if error in checkUserMessage, findIntent
    message.error = serializeError(err);
    await message.save();
  }

  await next(message);
};
export default checkUserMessageMiddleware;
