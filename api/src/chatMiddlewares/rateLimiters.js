import { INPUT_TYPE } from '../constants.js';
import { formatErrorResponseToFront } from '../controllers/formatController.js';
import rateLimiters from '../rateLimiters.js';

export const rateLimitSocketMiddleware = (socket, conversation) => (next) => async (...args) => {
  // rate limit of X ...argss per seconds per user
  try {
    await rateLimiters.replyPerUser.consume(conversation.user);
  } catch (rateLimiterReplyError) {
    if (rateLimiterReplyError instanceof Error) {
      throw rateLimiterReplyError;
    } else if (rateLimiterReplyError.isFirstBlock) {
      // if is the first block, send RateLimiterMessage, if not just block and return
      socket.sendResponses(formatErrorResponseToFront({
        text: 'message:send_userMessage_limit_error',
        input: { type: INPUT_TYPE.DEFAULT, data: {} },
        buttons: [],
        language: conversation?.language,
      }));
    }
    return;
  }
  await next(...args);
};

export const rateLimiteOneReplyAtTimeMiddleware = (socket, conversation) => (next) => async (...args) => {
  try {
    await rateLimiters.oneReplyAtTimePerUser.consume(conversation.user);
    await next(...args);
    await rateLimiters.oneReplyAtTimePerUser.reward(conversation.user);
  } catch (err) { /* empty */ }
};
