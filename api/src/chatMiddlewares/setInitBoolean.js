import { getSetting } from '../controllers/settingController.js';

const setInitBooleanMiddleware = (socket, conversation) => (next) => async (message) => {
  const NO_SEE_DURATION = await getSetting('NO_SEE_DURATION');
  message.isInitiate = true;
  message.isNewUser = conversation.messages.length === 1 && conversation.user.conversations.length === 1;
  message.isNewConversation = conversation.messages.length === 1;
  if (conversation.messages.length >= 2) {
    const previousMessage = conversation.messages.slice(-2)[0];
    message.isLongTimeNoSee = previousMessage?.createdAt < new Date(Date.now() - NO_SEE_DURATION);
  } else {
    message.isLongTimeNoSee = false;
  }
  await message.save();
  await next(message);
};

export default setInitBooleanMiddleware;
