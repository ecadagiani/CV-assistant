const populateConversationMiddleware = (socket, conversation) => (next) => async (message) => {
  await conversation.populateAll();
  await next(message);
};

export default populateConversationMiddleware;
