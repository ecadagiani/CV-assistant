import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { DISABLED_INPUT_TIMEOUT } from 'src/constants';
import { isInputDisabledState } from 'src/store/chat';
import { inputTypeState } from 'src/store/input';

export const ChatInputFocusContext = createContext({
  formShake: false,
  registerFocusCallback: () => {},
  focusChatInput: () => {},
});

export const useCreateContextChatInputFocus = () => {
  const focusMethod = useRef(null);
  const [formShake, setFormShake] = useState(false);

  const triggerShake = useCallback(() => {
    setFormShake(true);
  }, []);

  // reset the formShake after 500ms
  useEffect(() => {
    if (formShake) {
      const timeout = setTimeout(() => {
        setFormShake(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [formShake]);

  // save the focus method, gived by the input, in useRegisterChatInputFocus
  const registerFocusCallback = useCallback((method) => {
    focusMethod.current = method;
  }, []);

  // call the focus method
  const focusChatInput = useCallback(() => {
    if (focusMethod.current) {
      triggerShake();
      focusMethod.current();
    }
  }, [triggerShake]);

  const value = useMemo(() => ({
    formShake,
    registerFocusCallback,
    focusChatInput,
  }), [formShake, registerFocusCallback, focusChatInput]);
  return value;
};

export const useRegisterChatInputFocus = () => {
  const { registerFocusCallback, formShake } = useContext(ChatInputFocusContext);

  // shortcut function, to register the focus method and trigger the shake with the inputRef
  const registerInput = useCallback((inputRef) => {
    registerFocusCallback(() => {
      if (inputRef?.current) {
        inputRef.current.focus();
      }
    });
  }, [registerFocusCallback]);

  return {
    formShake,
    registerFocusCallback,
    registerInput,
  };
};

export const useChatInputFocus = () => {
  const { focusChatInput } = useContext(ChatInputFocusContext);
  return focusChatInput;
};

export const useSetInputType = () => {
  const setInput = useSetRecoilState(inputTypeState);
  return useCallback((inputType, data = {}) => {
    setInput({ type: inputType, data });
  }, [setInput]);
};

export const useResponseWaitingWithTimeout = () => {
  const isInputDisabled = useRecoilValue(isInputDisabledState);
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    if (isInputDisabled) {
      setDisabled(true);
      // If the server is waiting for a response, we disable the form for 4 seconds
      const timer = setTimeout(() => {
        setDisabled(false);
      }, DISABLED_INPUT_TIMEOUT);
      return () => clearTimeout(timer);
    }
    setDisabled(false);
    return undefined;
  }, [isInputDisabled]);

  return disabled;
};
