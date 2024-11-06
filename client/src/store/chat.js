import { atom, DefaultValue } from 'recoil';
import { queryStringInitEffect } from 'src/utils/recoilEffect';

export const isChatLoaderVisibleState = atom({
  key: 'isChatLoaderVisibleState',
  default: true, // true to wait for the first message
});

export const isInputDisabledState = atom({
  key: 'isInputDisabledState',
  default: true, // true to wait for the first message
});

export const showAllConversationsState = atom({
  key: 'ShowAllConversationsState',
  default: false,
  effects_UNSTABLE: [
    queryStringInitEffect('allConversations'),
  ],
});

export const incognitoState = atom({
  key: 'IncognitoState',
  default: false,
  effects_UNSTABLE: [
    queryStringInitEffect('incognito'),
  ],
});

function chatIdEffect(key) {
  return ({ setSelf, onSet, getPromise }) => {
    onSet(async (newValue) => {
      const incognitoMode = await getPromise(incognitoState);
      if (incognitoMode) return;

      if (newValue instanceof DefaultValue) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const incognitoMode = urlParams.get('incognito');
    // if we have query string, use it
    if (urlParams.get('userId') || urlParams.get('conversationId')) {
      if (urlParams.get(key)) {
        // if userId is in query string
        try {
          const value = JSON.parse(urlParams.get(key));
          setSelf(value);
          if (!incognitoMode) localStorage.setItem(key, JSON.stringify(value)); // save to local storage
        } catch (error) { /* empty */ }
      } else if (!incognitoMode) {
        // if userId is not in query string remove from local storage
        localStorage.removeItem(key);
      }
      return;
    }

    // if no query string, get local storage key value
    if (localStorage.getItem(key)) {
      try {
        const value = JSON.parse(localStorage.getItem(key));
        setSelf(value);
      } catch (error) { /* empty */ }
    }
  };
}

export const userIdState = atom({
  key: 'UserIdState',
  default: null,
  effects_UNSTABLE: [
    chatIdEffect('userId'),
  ],
});

export const conversationIdState = atom({
  key: 'ConversationIdState',
  default: null,
  effects_UNSTABLE: [
    chatIdEffect('conversationId'),
  ],
});
