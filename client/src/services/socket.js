import io from 'socket.io-client';
import { emitEventChatSendMessage } from './event';

export const socket = io(import.meta.env.VITE_API_URL, { autoConnect: false });

export function connect(userId, conversationId) {
  socket.auth = { userId, conversationId };
  socket.connect();
}

export const emitInitializeConversation = (userId, conversationId, language, incognitoMode = false) => {
  if (socket) {
    socket.emit('send_init', {
      userId, conversationId, language, incognitoMode,
    });
  }
};

export const emitSendUserMessage = ({ type, content, language }) => {
  if (socket) {
    emitEventChatSendMessage({ type, content, language });
    socket.emit('send_userMessage', { type, content, language });
  }
};
