import { setRecoil } from 'recoil-nexus';
import { isInputDisabledState } from 'src/store/chat';
import { messagesState } from 'src/store/messages';

async function onSendStreamSocket({
  messageId, content, isDone, ...rest
}) {
  if (!isDone) {
    setRecoil(isInputDisabledState, true);
  } else {
    setRecoil(isInputDisabledState, false);
  }

  setRecoil(messagesState, (messages) => {
    const messageIndex = messages.findIndex((message) => message.id === messageId);
    if (messageIndex === -1) return messages;
    return [
      ...messages.slice(0, messageIndex),
      {
        ...messages[messageIndex],
        content: {
          ...messages[messageIndex].content,
          text: content,
        },
      },
      ...messages.slice(messageIndex + 1),
    ];
  });
}

export default onSendStreamSocket;
