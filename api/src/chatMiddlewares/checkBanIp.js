import { isCountryBanned, isIpBanned } from '../controllers/ipController.js';
import { logInfo } from '../utils/logger.js';

const checkBanIpSocketMiddleware = (socket, conversation) => (next) => async (...args) => {
  const result = await Promise.all([
    isIpBanned(conversation.ip.address),
    isIpBanned(socket.handshake.address),
    isCountryBanned(conversation.ip.country),
  ]);
  if (result.some((isBanned) => isBanned)) {
    logInfo(
      { userId: conversation.user._id, conversationId: conversation._id },
      `Banned IP detected - ${conversation.ip.address}`,
    );
    return;
  }
  await next(...args);
};

export default checkBanIpSocketMiddleware;
