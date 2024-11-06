
import { RESPONSE_ID } from '../../resources/constants/responseId.js';
import { formatWaitingMessageToFront } from '../controllers/formatController.js';
import { getResponse } from '../controllers/responsesController/responses.js';
import { getSetting } from '../controllers/settingController.js';

// send a message to the user if the bot is taking too long to respond
const waitingMessageMiddleware = (socket, conversation) => (next) => async (message) => {
  const WAITING_MESSAGE_TIMEOUT = await getSetting('WAITING_MESSAGE_TIMEOUT');
  // wait for LLM message, if it takes too long, send a message to the user
  const waitTimeoutId = setTimeout(async () => {
    const { language } = message;
    socket.sendResponses(formatWaitingMessageToFront(
      getResponse(RESPONSE_ID.R_WAITING)(language),
    ));
    // message.responses.push(...getResponse(RESPONSE_ID.R_WAITING)(language));
    // await message.save();
  }, WAITING_MESSAGE_TIMEOUT);

  await next(message);

  clearTimeout(waitTimeoutId);
};

export default waitingMessageMiddleware;
