import Message from '../models/message.js';

const createMessageMiddleware = (socket, conversation) => (next) => async (userMessage) => {
  await conversation.populateAll();

  let messageLanguage = conversation.language;
  if (userMessage.language && ['fr', 'en'].includes(userMessage.language)) {
    messageLanguage = userMessage.language;
    conversation.language = userMessage.language;
    await conversation.save();
  }
  const message = await Message.create({
    conversation: conversation._id,
    language: messageLanguage,
    userMessage,
  });
  conversation.messages.push(message._id);
  await conversation.save();
  await next(message);
};

export default createMessageMiddleware;
