import { serializeError } from 'serialize-error';
import { ERROR_CODES, USER_MESSAGE_TYPE } from '../constants.js';
import { sendContactSimpleMail } from '../controllers/emailController.js';
import { TooManySimpleContactByUser } from '../errors.js';
import rateLimiters from '../rateLimiters.js';

const execActionsMiddleware = (socket, conversation) => (next) => async (message) => {
  // trigger actions (ex: send email, etc.)
  try {
    const { userMessage, error } = message;
    if (userMessage.type === USER_MESSAGE_TYPE.CONTACT_SIMPLE_SEND) {
      if (error?.name && [
        ERROR_CODES.INVALID_EMAIL_FORMAT_ERROR,
        ERROR_CODES.INVALID_EMAIL_ADDRESS_ERROR,
      ].includes(error?.name)) {
        await next(message);
        return;
      }

      try {
        // consume the rate for user, but if an error occurs, we will do not penalize the user
        await rateLimiters.simpleContactPerUser.consume(conversation.user);
        // send the email
        await sendContactSimpleMail(
          conversation.user,
          userMessage.content.email,
          userMessage.content.name,
          userMessage.content.body,
        );
      } catch (err) {
        if (err instanceof Error) {
          // if an error occurs, we will do not penalize the user
          await rateLimiters.simpleContactPerUser.reward(conversation.user);
          throw err;
        }
        throw new TooManySimpleContactByUser();
      }
    }
  } catch (err) {
    message.error = serializeError(err);
    await message.save();
  }
  await next(message);
};

export default execActionsMiddleware;
