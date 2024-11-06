import { Server } from 'socket.io';
import changeLanguageMiddleware from './chatMiddlewares/changeLanguage.js';
import checkBanIpSocketMiddleware from './chatMiddlewares/checkBanIp.js';
import checkUserMessageMiddleware from './chatMiddlewares/checkUserMessage.js';
import createInitMessageMiddleware from './chatMiddlewares/createInitMessage.js';
import createMessageMiddleware from './chatMiddlewares/createMessage.js';
import errorChatMiddleware from './chatMiddlewares/errorChat.js';
import execActionsMiddleware from './chatMiddlewares/execActions.js';
import findButtonsMiddleware from './chatMiddlewares/findButtons.js';
import findInputMiddleware from './chatMiddlewares/findInput.js';
import findIntentMiddleware from './chatMiddlewares/findIntent.js';
import findTextResponsesMiddleware from './chatMiddlewares/findTextResponses.js';
import llmResponseMiddleware from './chatMiddlewares/llmResponse.js';
import populateConversationMiddleware from './chatMiddlewares/populateConversation.js';
import {
  rateLimiteOneReplyAtTimeMiddleware,
  rateLimitSocketMiddleware,
} from './chatMiddlewares/rateLimiters.js';
import sendResponseMiddleware from './chatMiddlewares/sendResponse.js';
import setInitBooleanMiddleware from './chatMiddlewares/setInitBoolean.js';
import setQuestionIdMiddleware from './chatMiddlewares/setQuestionId.js';
import setResponseIdMiddleware from './chatMiddlewares/setResponseId.js';
import validateUserMessageMiddleware from './chatMiddlewares/validateUserMessage.js';
import waitingMessageMiddleware from './chatMiddlewares/waitingMessage.js';
import Conversation from './models/conversation.js';
import User from './models/user.js';
import rateLimiters from './rateLimiters.js';
import ChatMiddlewareSystem from './utils/chatMiddlewareSystem.js';
import { logError, logInfo } from './utils/logger.js';

async function onConnection(socket) {
  logInfo({ userId: socket.handshake?.auth?.userId }, 'try to connect');
  // rate limit of X connections per second per ip
  try {
    await rateLimiters.socketConnectionPerIp.consume(socket);
  } catch (err) {
    if (err instanceof Error) {
      // eslint-disable-next-line max-len
      logError({ userId: socket.handshake?.auth?.userId }, `on consume socketConnectionPerIp rateLimiter ip[${socket.handshake.address}]`, err);
    } else {
      socket.emit('blocked', { 'retry-ms': err.msBeforeNext });
    }
    socket.disconnect();
    return;
  }

  // validate userId and conversationId
  const userId = socket.handshake?.auth?.userId;
  const conversationId = socket.handshake?.auth?.conversationId;
  if (!userId || !conversationId) {
    socket.disconnect();
    return;
  }
  const userExist = await User.exists({ _id: userId });
  const conversation = await Conversation.findByIdWithPopulate(conversationId);
  if (!userExist || !conversation) {
    socket.disconnect();
    return;
  }

  logInfo({ userId, conversationId }, 'connected');

  socket.sendResponses = async (serverResponses) => {
    await socket.emit('send_responses', serverResponses);
  };

  socket.sendStream = async (messageId, content, isDone) => {
    await socket.emit('send_stream', { messageId, content, isDone });
  };

  // INIT MIDDLEWARES
  const chatMiddlewareInitInstance = new ChatMiddlewareSystem(socket, conversation);
  chatMiddlewareInitInstance.onError(errorChatMiddleware);

  chatMiddlewareInitInstance.use(createInitMessageMiddleware);
  chatMiddlewareInitInstance.use(setInitBooleanMiddleware);
  chatMiddlewareInitInstance.use(setQuestionIdMiddleware);
  chatMiddlewareInitInstance.use(setResponseIdMiddleware);
  chatMiddlewareInitInstance.use(findTextResponsesMiddleware);
  chatMiddlewareInitInstance.use(findButtonsMiddleware);
  chatMiddlewareInitInstance.use(findInputMiddleware);
  chatMiddlewareInitInstance.use(sendResponseMiddleware);

  // REPLY MIDDLEWARES
  const chatMiddlewareReplyInstance = new ChatMiddlewareSystem(socket, conversation);
  chatMiddlewareReplyInstance.onError(errorChatMiddleware);

  chatMiddlewareReplyInstance.use(rateLimitSocketMiddleware);
  chatMiddlewareReplyInstance.use(checkBanIpSocketMiddleware);
  chatMiddlewareReplyInstance.use(rateLimiteOneReplyAtTimeMiddleware);
  chatMiddlewareReplyInstance.use(validateUserMessageMiddleware);
  chatMiddlewareReplyInstance.use(createMessageMiddleware);
  chatMiddlewareReplyInstance.use(waitingMessageMiddleware);
  chatMiddlewareReplyInstance.use(populateConversationMiddleware);
  chatMiddlewareReplyInstance.use(checkUserMessageMiddleware);
  chatMiddlewareReplyInstance.use(findIntentMiddleware);
  chatMiddlewareReplyInstance.use(setQuestionIdMiddleware);
  chatMiddlewareReplyInstance.use(changeLanguageMiddleware);
  chatMiddlewareReplyInstance.use(execActionsMiddleware);
  chatMiddlewareReplyInstance.use(setResponseIdMiddleware);
  chatMiddlewareReplyInstance.use(findTextResponsesMiddleware);
  chatMiddlewareReplyInstance.use(llmResponseMiddleware);
  chatMiddlewareReplyInstance.use(findButtonsMiddleware);
  chatMiddlewareReplyInstance.use(findInputMiddleware);
  chatMiddlewareReplyInstance.use(sendResponseMiddleware);

  socket.on('send_init', async (arg) => {
    logInfo({ userId, conversationId: arg.conversationId }, 'send_init');
    const newConversation = await Conversation.findByIdWithPopulate(arg.conversationId);
    if (!newConversation) {
      logError({ userId, conversationId: arg.conversationId }, 'send_init - conversation not found');
      socket.disconnect();
      return;
    }
    chatMiddlewareInitInstance.setConversation(newConversation);
    chatMiddlewareReplyInstance.setConversation(newConversation);
    await chatMiddlewareInitInstance.execute(arg);
  });

  socket.on('send_userMessage', async (arg) => {
    logInfo({ userId, conversationId: chatMiddlewareReplyInstance.conversation._id }, 'send_userMessage', arg);
    chatMiddlewareReplyInstance.execute(arg);
  });

  // deepcode ignore NoEffectExpression: because it is a socket event
  socket.emit('ready', { userId, conversationId });
}

function createSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONT_URL,
      methods: ['GET', 'POST'],
    },
  });
  io.on('connection', async (socket) => {
    try {
      await onConnection(socket);
    } catch (err) {
      logError({}, 'ERROR - socket onConnection', err);
    }
  });
  return io;
}

export default createSocket;
