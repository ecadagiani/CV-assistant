import useEventListener from 'src/hooks/useEventListener';

export const EVENT_CHAT_START = 'event:chat:start';
export const EVENT_CHAT_RESET = 'event:chat:reset';
export const EVENT_CHAT_RECEIVE_MESSAGE = 'event:chat:receive_message';
export const EVENT_CHAT_SEND_MESSAGE = 'event:chat:send_message';

export function emitEventChatStart(data) {
  return window.dispatchEvent(new CustomEvent(EVENT_CHAT_START, { detail: data }));
}

export function emitEventChatReset(data) {
  return window.dispatchEvent(new CustomEvent(EVENT_CHAT_RESET, { detail: data }));
}

export function emitEventChatReceiveMessage(data) {
  return window.dispatchEvent(new CustomEvent(EVENT_CHAT_RECEIVE_MESSAGE, { detail: data }));
}

export function emitEventChatSendMessage(data) {
  return window.dispatchEvent(new CustomEvent(EVENT_CHAT_SEND_MESSAGE, { detail: data }));
}

export function useEventChatStart(callback) {
  return useEventListener(EVENT_CHAT_START, (e) => callback(e.detail), window);
}

export function useEventChatReset(callback) {
  return useEventListener(EVENT_CHAT_RESET, (e) => callback(e.detail), window);
}

export function useEventChatReceiveMessage(callback) {
  return useEventListener(EVENT_CHAT_RECEIVE_MESSAGE, (e) => callback(e.detail), window);
}

export function useEventChatSendMessage(callback) {
  return useEventListener(EVENT_CHAT_SEND_MESSAGE, (e) => callback(e.detail), window);
}
