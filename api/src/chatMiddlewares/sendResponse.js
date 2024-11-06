import { formatModelMessageToFront } from '../controllers/formatController.js';
import { logInfo } from '../utils/logger.js';

const sendResponseMiddleware = (socket, conversation) => (next) => async (message) => {
  message.repliedAt = Date.now();
  logInfo({ userId: conversation.user._id, conversationId: conversation._id }, 'sendResponse', {
    responses: message.responses,
    buttons: message.buttons,
    input: message.input,
    responseId: message.responseId,
    responseTime: message.repliedAt - message.createdAt,
  });
  socket.sendResponses(formatModelMessageToFront(message));
  await message.save();
  await next(message);
};

export default sendResponseMiddleware;
