import React, {
  useCallback, useEffect, useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import CancelIcon from 'src/assets/icons/cancel.svg?react';
import SendIcon from 'src/assets/icons/send.svg?react';
import {
  CONTACT_BODY_MAX_LENGTH, CONTACT_INPUT_MAX_LENGTH, INPUT_TYPE,
} from 'src/constants';
import { useSetInputType } from 'src/hooks/inputHooks';
import { useSocket } from 'src/hooks/useSocket';
import { incognitoState, isInputDisabledState } from 'src/store/chat';
import { inputTypeState, inputValueStateFamily } from 'src/store/input';
import Alert from '../Alert';
import InputContactForm from './InputContactForm';
import { useFormContactSimpleErrors, useFormContactSimpleFocus, useTextAreaHeight } from './hooks';
import {
  ButtonContainer,
  CancelButton,
  Form,
  InputEmail,
  InputName,
  SubmitButton, TextAreaBody,
} from './styles';

function FormContactSimple() {
  const { t } = useTranslation();
  const { data: serverInputData } = useRecoilValue(inputTypeState);
  const [inputValue, setInputValue] = useRecoilState(inputValueStateFamily(INPUT_TYPE.CONTACT_SIMPLE)); // { body: '', email: '', name: ''}
  const setInputType = useSetInputType();
  const { sendCancelContactMessage, sendContactMessage } = useSocket();
  const isInputDisabled = useRecoilValue(isInputDisabledState);
  const disabledForIncognito = useRecoilValue(incognitoState);
  const { isConnected } = useSocket();

  // Alert show state
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showSendAlert, setShowSendAlert] = useState(false);

  // Input values
  const { email, name, body } = useMemo(() => ({
    email: inputValue?.email || '',
    name: inputValue?.name || '',
    body: inputValue?.body || '',
  }), [inputValue]);

  // Errors management
  const {
    errors, hasError, setErrors, findErrors,
  } = useFormContactSimpleErrors(email, name, body);

  // Focus management
  const {
    emailInputRef, nameInputRef, bodyInputRef, formShake, focusFirstEmptyInput,
  } = useFormContactSimpleFocus(email, name, body);

  // Manage the height of the textarea
  useTextAreaHeight(bodyInputRef, body);

  // onUnmount reset the input value
  useEffect(() => () => {
    setInputValue({ body: '', email: '', name: '' });
  }, [setInputValue]);

  // If the server sends data, we update the input value
  useEffect(() => {
    if (serverInputData?.name || serverInputData?.body || serverInputData?.email) {
      setInputValue((prev) => {
        const next = {
          ...prev,
          ...serverInputData,
        };
        focusFirstEmptyInput(next);
        return next;
      });
    }
  }, [setInputValue, focusFirstEmptyInput, serverInputData]);

  const onInputChange = useCallback((e) => {
    setInputValue((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  }, [setErrors, setInputValue]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (hasError) {
      setErrors(findErrors(email, name, body));
      return;
    }
    if (isInputDisabled) return;
    if (!isConnected) return;
    setShowSendAlert(true);
  };

  const onCancel = () => {
    if (isInputDisabled) return;
    if (!isConnected) return;
    setShowCancelAlert(true);
  };

  const cancelFormContact = () => {
    if (isInputDisabled) return;
    if (!isConnected) return;
    setShowCancelAlert(false);
    setInputType(INPUT_TYPE.DEFAULT);
    sendCancelContactMessage();
  };

  const sendContactForm = () => {
    if (isInputDisabled) return;
    if (!isConnected) return;
    setShowSendAlert(false);
    sendContactMessage({ email, name, body });
  };

  return (
    <Form onSubmit={onSubmit} $shake={formShake} disabled={isInputDisabled || !isConnected || disabledForIncognito}>
      <InputContactForm
        label={t('Email')}
        value={email}
        name="email" // required for onChange to work
        onChange={onInputChange}
        InputComponent={InputEmail}
        type="email"
        id="email" // required for autocomplete to work
        autoComplete="email"
        placeholder={t('Contact Email')}
        maxLength={CONTACT_INPUT_MAX_LENGTH}
        ref={emailInputRef}
        errorMessage={errors?.email}
      />
      <InputContactForm
        label={t('Name')}
        value={name}
        name="name" // required for onChange to work
        onChange={onInputChange}
        InputComponent={InputName}
        type="text"
        id="name" // required for autocomplete to work
        autoComplete="name"
        placeholder={t('Contact Name')}
        maxLength={CONTACT_INPUT_MAX_LENGTH}
        ref={nameInputRef}
        errorMessage={errors?.name}
      />
      <InputContactForm
        label={t('Message')}
        value={body}
        name="body" // required for onChange to work
        onChange={onInputChange}
        InputComponent={TextAreaBody}
        id="body"
        placeholder={t('Write your message here...')}
        rows={3}
        maxLength={CONTACT_BODY_MAX_LENGTH}
        aria-label={t('Write a the body of your message send to Eden')}
        ref={bodyInputRef}
        errorMessage={errors?.body}
      />
      <ButtonContainer>
        <CancelButton
          type="button"
          onClick={onCancel}
          disabled={isInputDisabled || !isConnected}
        >
          <CancelIcon />
          {t('Cancel')}
        </CancelButton>
        <SubmitButton
          type="submit"
          disabled={isInputDisabled || !isConnected}
          $formIsInvalid={hasError}
        >
          <SendIcon />
          {t('Send')}
        </SubmitButton>
      </ButtonContainer>
      <Alert
        isOpen={showCancelAlert}
        title={t('Cancel the message?')}
        text={t('Are you sure you want to cancel the message?')}
        confirmButtonText={t('Yes')}
        showCancelButton
        cancelButtonText={t('No')}
        onConfirm={cancelFormContact}
        onCancel={() => setShowCancelAlert(false)}
      />
      <Alert
        isOpen={showSendAlert}
        title={t('Send the message?')}
        text={t('Are you sure you want to send the message?')}
        confirmButtonText={t('Yes')}
        showCancelButton
        cancelButtonText={t('No')}
        onConfirm={sendContactForm}
        onCancel={() => setShowSendAlert(false)}
      />
    </Form>
  );
}

const MemoizedFormContactSimple = React.memo(FormContactSimple);
export default MemoizedFormContactSimple;
