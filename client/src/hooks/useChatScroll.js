import { last } from 'lodash';
import {
  createContext, useCallback, useContext, useLayoutEffect, useRef,
} from 'react';
import { useRecoilValue } from 'recoil';
import { messagesState } from 'src/store/messages';
import useWaitForScrollEnd from './useWaitForScrollEnd';

export const ScrollChatContext = createContext(null);

export const useCreateContextChatScroll = () => {
  const messageListRef = useRef(null);
  const messages = useRecoilValue(messagesState);
  const waitForScrollEnd = useWaitForScrollEnd(messageListRef);

  const scrollChatToBottom = useCallback(({ ignoreNoScroll = false } = {}) => {
    if (messageListRef.current) {
      if (ignoreNoScroll || !last(messages)?.noScroll) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    }
  }, [messageListRef, messages]);

  useLayoutEffect(() => {
    if (messageListRef.current) {
      if (last(messages)?.noScroll) { // Check if the last message has noScroll flag
        // Wait if scroll is in progress
        waitForScrollEnd().then(() => {
          // Perform any actions needed after scrolling has stopped
          messageListRef.current.scrollTop += 30;
        }).catch((err) => {
          // eslint-disable-next-line no-console
          console.error('waitForScrollEnd error:', err);
        });
      } else {
        // Scroll to the bottom of the chat if the last message does not have noScroll flag
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    }
  }, [messages, waitForScrollEnd, scrollChatToBottom]);

  return {
    messageListRef,
    scrollChatContextValue: scrollChatToBottom,
  };
};

export const useScrollChatToBottom = () => {
  const scrollChatToBottom = useContext(ScrollChatContext);
  return scrollChatToBottom;
};
