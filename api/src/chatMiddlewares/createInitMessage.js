import { USER_MESSAGE_TYPE } from '../constants.js';
import Message from '../models/message.js';

const createInitMessageMiddleware = (socket, conversation) => (next) => async (args) => {
  if (args?.incognitoMode) {
    // if incognito mode, do not create initial message and stop middleware chain
    return;
  }

  const message = await Message.create({
    language: conversation.language,
    conversation: conversation._id,
    userMessage: {
      type: USER_MESSAGE_TYPE.INITIATE,
    },
  });
  conversation.messages.push(message._id);
  await conversation.save();
  await next(message);
};
export default createInitMessageMiddleware;
