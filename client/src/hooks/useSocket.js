import { uniqueId } from 'lodash';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import { RESPONSE_TYPE, USER_MESSAGE_TYPE } from 'src/constants';
import resetSocket from 'src/controllers/Socket/resetSocket';
import SocketContext from 'src/controllers/Socket/socketContext';
import { emitSendUserMessage } from 'src/services/socket';
import { isChatLoaderVisibleState, isInputDisabledState } from 'src/store/chat';
import { addMessageStateSelector } from 'src/store/messages';

export function useSocket() {
  const context = useContext(SocketContext);
  const { i18n } = useTranslation();
  const setChatLoaderVisible = useSetRecoilState(isChatLoaderVisibleState);
  const setInputDisabled = useSetRecoilState(isInputDisabledState);
  const addMessage = useSetRecoilState(addMessageStateSelector);

  const templateSendMessage = useCallback(({ type, content }) => {
    if (context.isConnected) {
      // send message
      setInputDisabled(true);
      setChatLoaderVisible(true);
      emitSendUserMessage({ type, content, language: i18n.language });

      // add user message to the list
      addMessage({
        id: uniqueId('user_message-'),
        type: RESPONSE_TYPE.USER_MESSAGE,
        content: { type, content },
        isOwn: true,
        date: new Date(),
      });
    }
  }, [
    context.isConnected, i18n.language,
    addMessage, setChatLoaderVisible, setInputDisabled,
  ]);

  const sendDefaultMessage = useCallback(({ text, payload }) => templateSendMessage({
    type: USER_MESSAGE_TYPE.DEFAULT,
    content: { text, payload },
  }), [templateSendMessage]);

  const sendContactMessage = useCallback(({ email, name, body }) => templateSendMessage({
    type: USER_MESSAGE_TYPE.CONTACT_SIMPLE_SEND,
    content: { email, name, body },
  }), [templateSendMessage]);

  const sendCancelContactMessage = useCallback(() => templateSendMessage({
    type: USER_MESSAGE_TYPE.CONTACT_SIMPLE_CANCEL,
    content: { },
  }), [templateSendMessage]);

  return {
    isConnected: context.isConnected,
    reset: resetSocket,
    sendDefaultMessage,
    sendContactMessage,
    sendCancelContactMessage,
  };
}
