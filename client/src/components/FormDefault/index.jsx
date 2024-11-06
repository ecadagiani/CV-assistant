import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import SendIcon from 'src/assets/icons/send.svg?react';
import { DEFAULT_INPUT_MAX_LENGTH, INPUT_TYPE } from 'src/constants';
import { useRegisterChatInputFocus, useResponseWaitingWithTimeout } from 'src/hooks/inputHooks';
import { useSocket } from 'src/hooks/useSocket';
import { incognitoState } from 'src/store/chat';
import { inputValueStateFamily } from 'src/store/input';
import Input from './Input';
import SettingsButton from './SettingsButton';
import {
  Form, FormContainer,
  SubmitButton,
} from './styles';

function MemoizedFormDefault() {
  const { t } = useTranslation();
  const { isConnected, sendDefaultMessage } = useSocket();
  const [inputValue, setInputValue] = useRecoilState(inputValueStateFamily(INPUT_TYPE.DEFAULT)); // { value: '', payload: ''}
  const disabledForResponseWaiting = useResponseWaitingWithTimeout();
  const disabledForIncognito = useRecoilValue(incognitoState);
  const { formShake } = useRegisterChatInputFocus();

  const hasNoValue = !inputValue.value?.trim();

  const { value, payload } = useMemo(() => ({
    value: inputValue.value || '',
    payload: inputValue.payload || '',
  }), [inputValue]);

  const submitMessage = () => {
    if (hasNoValue || disabledForResponseWaiting || !isConnected) {
      return;
    }
    sendDefaultMessage({ text: value.trim(), payload });
    setInputValue({ value: '', payload: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMessage();
  };

  const handleInputChange = (e) => {
    if (e.target.value.length > DEFAULT_INPUT_MAX_LENGTH) {
      return;
    }
    setInputValue({ value: e.target.value, payload: '' });
    // reset payload, because if user change the question, we do not wan't to keep the old payload
  };

  return (
    <FormContainer>
      <Form
        onSubmit={handleSubmit}
        $disabled={disabledForResponseWaiting || !isConnected || disabledForIncognito}
        $shake={formShake}
      >
        <Input
          value={inputValue.value}
          onChange={handleInputChange}
          onEnter={submitMessage}
          maxLength={DEFAULT_INPUT_MAX_LENGTH}
        />
        <SubmitButton
          type="submit"
          disabled={hasNoValue || disabledForResponseWaiting || !isConnected || disabledForIncognito}
          aria-label={t('Send a message to the chatbot')}
          role="button"
        >
          <SendIcon />
        </SubmitButton>
      </Form>
      <SettingsButton />
    </FormContainer>
  );
}

const MemoizedMemoizedFormDefault = React.memo(MemoizedFormDefault);
export default MemoizedMemoizedFormDefault;
