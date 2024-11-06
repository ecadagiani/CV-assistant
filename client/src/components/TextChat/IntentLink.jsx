import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { INPUT_TYPE } from 'src/constants';
import { useChatInputFocus, useSetInputType } from 'src/hooks/inputHooks';
import { useSocket } from 'src/hooks/useSocket';
import { inputValueStateFamily } from 'src/store/input';
import { IntentLinkButton } from './styles';

function IntentLink({
  children,
  input,
  autoSend: _autoSend = 'true',
  payload = undefined,
}) {
  const autoSend = _autoSend === 'true';
  const setInput = useSetRecoilState(inputValueStateFamily(INPUT_TYPE.DEFAULT));
  const setInputType = useSetInputType(INPUT_TYPE.DEFAULT);
  const focusChatInput = useChatInputFocus();
  const { sendDefaultMessage } = useSocket();

  const onClick = useCallback(() => {
    setInputType(INPUT_TYPE.DEFAULT);
    if (autoSend) {
      sendDefaultMessage({ text: input, payload });
      // If we send an message, reset the input to make like the form submit
      setInput({ value: '', payload: '' });
    } else {
      setInput({ value: input, payload });
      focusChatInput();
    }
  }, [setInputType, setInput, sendDefaultMessage, focusChatInput, input, autoSend, payload]);

  return (
    <IntentLinkButton type="button" onClick={onClick}>
      {children}
    </IntentLinkButton>
  );
}

IntentLink.propTypes = {
  children: PropTypes.node.isRequired,
  input: PropTypes.string.isRequired,
  autoSend: PropTypes.string,
  payload: PropTypes.any,
};

export default IntentLink;
