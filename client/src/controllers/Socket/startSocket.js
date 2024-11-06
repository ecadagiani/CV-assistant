import { uniqueId } from 'lodash';
import { setRecoil } from 'recoil-nexus';

import { ORIGIN_QUERY_PARAM } from 'src/constants';
import api from 'src/services/api';
import { emitEventChatStart } from 'src/services/event';
import { buttonsState } from 'src/store/buttons';
import { conversationIdState, isInputDisabledState, isChatLoaderVisibleState, userIdState } from 'src/store/chat';
import { inputTypeState } from 'src/store/input';
import { messagesState } from 'src/store/messages';

function startSocket({
  userId,
  conversationId,
  language,
  allConversations,
}, cancelToken = undefined) {
  return new Promise((resolve, reject) => {
    setRecoil(isInputDisabledState, true);
    setRecoil(isChatLoaderVisibleState, true);
    const searchParams = new URLSearchParams(window.location.search);
    const origin = searchParams.get(ORIGIN_QUERY_PARAM);
    api.postStart({
      userId,
      conversationId,
      origin,
      language,
      allConversations,
    }, cancelToken)
      .then(({ data }) => {
        emitEventChatStart(data);
        setRecoil(userIdState, data.userId);
        setRecoil(conversationIdState, data.conversationId);

        if (data.responses) {
          setRecoil(messagesState, data.responses.map((message) => ({
            id: message.id,
            type: message.type,
            content: message?.content,
            isOwn: message?.isUser || false,
            date: new Date(message.date),
            noScroll: false,
          })));
        }
        if (data.buttons) {
          setRecoil(buttonsState, data.buttons.map((button) => ({
            ...button,
            id: uniqueId('button-'),
          })));
        }
        if (data.input) {
          setRecoil(inputTypeState, data.input);
        }
        setRecoil(isInputDisabledState, false);
        setRecoil(isChatLoaderVisibleState, false);
        resolve(data);
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return;
        // eslint-disable-next-line no-console
        console.error(err);
        setRecoil(isInputDisabledState, false);
        setRecoil(isChatLoaderVisibleState, false);
        reject(err);
      });
  });
}

export default startSocket;
