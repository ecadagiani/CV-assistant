import { getRecoil, resetRecoil } from 'recoil-nexus';
import i18n from 'src/i18n';
import { emitEventChatReset } from 'src/services/event';
import { emitInitializeConversation } from 'src/services/socket';
import { buttonsState } from 'src/store/buttons';
import {
  conversationIdState, incognitoState, showAllConversationsState, userIdState,
} from 'src/store/chat';
import { inputTypeState } from 'src/store/input';
import { messagesState } from 'src/store/messages';
import startSocket from './startSocket';

function resetSocket() {
  emitEventChatReset();
  resetRecoil(conversationIdState);
  resetRecoil(messagesState);
  resetRecoil(buttonsState);
  resetRecoil(inputTypeState);

  const userId = getRecoil(userIdState);
  const showAllConversations = getRecoil(showAllConversationsState);

  startSocket({
    userId,
    conversationId: null,
    language: i18n.language,
    allConversations: showAllConversations,
  })
    .then((data) => {
      const incognitoMode = getRecoil(incognitoState);
      emitInitializeConversation(data.userId, data.conversationId, i18n.language, incognitoMode);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('reset socket', err);
    });
}

export default resetSocket;
