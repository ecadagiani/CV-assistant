import { atom, selector } from 'recoil';
import { RESPONSE_TYPE, USER_MESSAGE_TYPE } from 'src/constants';

export const messagesState = atom({
  key: 'MessagesState',
  default: [],
});

export const addMessageStateSelector = selector({
  key: 'AddMessageStateSelector',
  get: ({ get }) => get(messagesState),
  set: ({ set }, message) => {
    set(messagesState, (oldMessages) => {
      const existingIndex = oldMessages.findIndex((oldMessage) => oldMessage.id === message.id);
      if (existingIndex !== -1) {
        return [
          ...oldMessages.slice(0, existingIndex),
          message,
          ...oldMessages.slice(existingIndex + 1),
        ];
      }
      return [...oldMessages, message];
    });
  },
});

export const messageStateWithContent = selector({
  key: 'MessageStateWithContent',
  get: ({ get }) => {
    const messages = get(messagesState);
    return messages.filter((message) => !!message.content);
  },
});

export const lastMessageState = selector({
  key: 'LastMessageState',
  get: ({ get }) => {
    const messages = get(messagesState);
    return messages[messages.length - 1];
  },
});

export const botMessageLengthState = selector({
  key: 'botMessageLengthState',
  get: ({ get }) => {
    const messages = get(messagesState);
    return messages.filter((message) => message.type !== RESPONSE_TYPE.USER_MESSAGE).length;
  },
});

export const isChatJustOpenedState = selector({
  key: 'isChatJustOpenedState',
  get: ({ get }) => {
    const messages = get(messagesState);
    const lastMessage = messages[messages.length - 1];
    // if the last message is a user initiate message, the chat just opened
    if (lastMessage?.type === RESPONSE_TYPE.USER_MESSAGE && lastMessage?.content?.type === USER_MESSAGE_TYPE.INITIATE) {
      return true;
    }
    // if user haven't sent any message yet, the chat just opened
    const userMessage = messages.find((message) => message.type === RESPONSE_TYPE.USER_MESSAGE);
    if (!userMessage) {
      return true;
    }
    return false;
  },
});
