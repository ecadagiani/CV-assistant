import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { emailRegex } from 'src/constants/regex';
import { useRegisterChatInputFocus } from 'src/hooks/inputHooks';
import { useMemoizedCallback } from 'src/hooks/useCallback';

export function useFormContactSimpleErrors(email, name, body) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({ email: '', name: '', body: '' });

  const findErrors = useCallback((_email, _name, _body) => {
    const newErrors = { email: '', name: '', body: '' };
    if (!_email.trim()) {
      newErrors.email = t('Email is required');
    } else if (emailRegex.test(_email.trim()) === false) {
      newErrors.email = t('Email is not valid');
    }
    if (!_name.trim()) {
      newErrors.name = t('Name is required');
    }
    if (!_body.trim()) {
      newErrors.body = t('Message is required');
    }
    return newErrors;
  }, [t]);

  const hasError = useMemo(() => {
    const errorFinded = findErrors(email, name, body);
    return Object.values(errorFinded).some((error) => error);
  }, [email, name, body, findErrors]);

  return {
    errors,
    setErrors,
    findErrors,
    hasError,
  };
}
export function useFormContactSimpleFocus(email, name, body) {
  const emailInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const bodyInputRef = useRef(null);
  const { formShake, registerFocusCallback } = useRegisterChatInputFocus();

  const focusFirstEmptyInput = useMemoizedCallback(({
    email: argEmail = undefined, name: argName = undefined, body: argBody = undefined,
  } = {}) => {
    const emailValue = argEmail === undefined ? email : argEmail;
    const nameValue = argName === undefined ? name : argName;
    const bodyValue = argBody === undefined ? body : argBody;

    if (!emailValue.trim() && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (!nameValue.trim() && nameInputRef.current) {
      nameInputRef.current.focus();
    } else if (!bodyValue.trim() && bodyInputRef.current) {
      bodyInputRef.current.focus();
    }
  }, [email, name, body]);

  // Register the focus callback
  useEffect(() => {
    registerFocusCallback(focusFirstEmptyInput);
    focusFirstEmptyInput();
  }, [registerFocusCallback, focusFirstEmptyInput]);
  return {
    emailInputRef,
    nameInputRef,
    bodyInputRef,
    formShake,
    focusFirstEmptyInput,
  };
}

export function useTextAreaHeight(bodyInputRef, body) {
  // Manage the height of the textarea
  useEffect(() => {
    if (bodyInputRef.current) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.

      // eslint-disable-next-line no-param-reassign
      bodyInputRef.current.style.height = '0px';
      // eslint-disable-next-line no-param-reassign
      bodyInputRef.current.style.height = `${bodyInputRef.current.scrollHeight}px`;
    }
  }, [bodyInputRef, body]);
}
