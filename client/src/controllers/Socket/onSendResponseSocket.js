import BPromise from 'bluebird';
import { first, last, uniqueId } from 'lodash';
import { getRecoil, setRecoil } from 'recoil-nexus';
import { RESPONSE_TYPE } from 'src/constants';
import i18n from 'src/i18n';
import { emitEventChatReceiveMessage } from 'src/services/event';
import { buttonsState } from 'src/store/buttons';
import { isInputDisabledState, isChatLoaderVisibleState } from 'src/store/chat';
import { inputTypeState } from 'src/store/input';
import { addMessageStateSelector, messagesState } from 'src/store/messages';
import resetSocket from './resetSocket';

async function onSendResponseSocket(serverResponse) {
  emitEventChatReceiveMessage(serverResponse);
  if (serverResponse.language && i18n.language !== serverResponse.language) {
    i18n.changeLanguage(serverResponse.language);
  }
  if (serverResponse.input) {
    setRecoil(inputTypeState, serverResponse.input);
  }
  if (serverResponse.buttons) {
    setRecoil(buttonsState, serverResponse.buttons.map((button) => ({
      ...button,
      id: uniqueId('button-'),
    })));
  }

  // wait before first message (if noDelay is false) and we have a last message
  const lastMessage = last(getRecoil(messagesState));
  if (!first(serverResponse.responses)?.noDelay && lastMessage?.date) {
    const nbMsBetweenLastMessage = new Date() - lastMessage.date;
    await BPromise.delay(Math.max(0, 500 - nbMsBetweenLastMessage));
  }

  if (!serverResponse?.keepWaiting) {
    setRecoil(isInputDisabledState, false); // reply is received => enable the input
    setRecoil(isChatLoaderVisibleState, false); // reply is received => hide the loader
  }

  // loop through messages and add them to the chat with a delay
  await BPromise.each(serverResponse.responses, async (message, index) => {
    // wait before each message (if noDelay is false) and we are not at the first message
    if (!message.noDelay && index > 0) {
      await BPromise.delay(500);
    }

    if (message.type === RESPONSE_TYPE.RESTART) {
      resetSocket();
      return;
    }

    setRecoil(addMessageStateSelector, {
      id: message.id,
      type: message.type,
      content: message?.content,
      isOwn: false,
      date: new Date(message.date),
      noScroll: message?.noScroll || false,
    });
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  });
}

export default onSendResponseSocket;
