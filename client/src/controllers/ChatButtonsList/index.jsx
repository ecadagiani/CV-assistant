import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useResponseWaitingWithTimeout } from 'src/hooks/inputHooks';
import { useSocket } from 'src/hooks/useSocket';
import { buttonsState } from 'src/store/buttons';
import * as Styled from './styles';

function ChatButton({
  id, text, payload,
}) {
  const { i18n } = useTranslation();
  const { sendDefaultMessage, isConnected } = useSocket();
  const disabledForResponseWaiting = useResponseWaitingWithTimeout();

  const textToDisplay = useMemo(() => {
    if (typeof text === 'object') {
      return i18n.language === 'fr' ? text.fr : text.en;
    }
    return text;
  }, [i18n.language, text]);

  const handleClick = () => {
    if (!isConnected || disabledForResponseWaiting) {
      return;
    }
    sendDefaultMessage({ text: textToDisplay, payload });
  };

  return (
    <Styled.Button
      key={id}
      type="button"
      aria-label={textToDisplay}
      role="button"
      onClick={handleClick}
      disabled={!isConnected || disabledForResponseWaiting}
    >
      {textToDisplay}
    </Styled.Button>
  );
}

ChatButton.propTypes = {
  id: PropTypes.string.isRequired,
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      fr: PropTypes.string,
      en: PropTypes.string,
    }),
  ]).isRequired,
  payload: PropTypes.string.isRequired,
};

function ChatButtonsList() {
  const buttons = useRecoilValue(buttonsState);

  return (
    <Styled.ButtonContainer>
      {buttons.map((button) => (
        <ChatButton
          key={button.id}
          id={button.id}
          text={button.text}
          payload={button.payload}
        />
      ))}
    </Styled.ButtonContainer>
  );
}

const MemoizedChatButtonsList = React.memo(ChatButtonsList);
export default MemoizedChatButtonsList;
