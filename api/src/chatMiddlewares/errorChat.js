import { serializeError } from 'serialize-error';
import { RESPONSE_ID } from '../../resources/constants/responseId.js';
import { formatErrorResponseToFront } from '../controllers/formatController.js';
import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import { logError } from '../utils/logger.js';

export const handleError = async (error, args, socket, conversation) => {
  if (error instanceof Error) {
    try {
      logError({ userId: conversation?.user?._id, conversationId: conversation?._id }, 'chatMiddleware error', error, { args });
      const errorResponse = formatErrorResponseToFront({
        language: conversation?.language,
      });
      socket.sendResponses(errorResponse);

      if (args && args.length > 0 && args[0] instanceof Message) {
        // if message exists in args (created before)
        // try to save the error in the message
        try {
          const message = args[0];
          message.error = serializeError(error);
          message.responses = errorResponse.responses.map((response) => ({
            type: response.type,
            content: response.content,
          }));
          message.responseId = RESPONSE_ID.R_ERROR;
          message.input = errorResponse.input;
          message.buttons = errorResponse.buttons;
          await message.save();
        } catch (saveMessageError) {
          logError(
            { userId: conversation?.user?._id, conversationId: conversation?._id },
            'chatMiddleware error on saveMessageError',
            saveMessageError,
          );
        }
      } else if (conversation && conversation instanceof Conversation) {
        // if message does not exist in args (not created yet)
        // try to save the error in the conversation
        try {
          const message = new Message({
            conversation: conversation._id,
            error: serializeError(error),
            responseId: RESPONSE_ID.R_ERROR,
            repliedAt: new Date(),
            language: conversation?.language,
            responses: errorResponse.responses.map((response) => ({
              type: response.type,
              content: response.content,
            })),
            input: errorResponse.input,
          });
          await message.save();
          conversation.messages.push(message._id);
          await conversation.save();
        } catch (saveConversationError) {
          logError(
            { userId: conversation?.user?._id, conversationId: conversation?._id },
            'chatMiddleware error on saveConversationError',
            saveConversationError,
          );
        }
      }
    } catch (e) {
      logError({ }, 'chatMiddleware error inside errorChatMiddleware', e);
    }
  }
};

const errorChatMiddleware = (socket, conversation) => (next) => async (error, args) => {
  try {
    await conversation.save();
  } catch (e) {
    logError(
      { userId: conversation?.user?._id, conversationId: conversation?._id },
      'chatMiddleware error inside errorChatMiddleware, for conversation.save()',
      e,
    );
  }

  await handleError(error, args, socket, conversation);
};

export default errorChatMiddleware;
