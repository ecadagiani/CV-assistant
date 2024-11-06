import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegisterChatInputFocus } from 'src/hooks/inputHooks';
import { InputTextArea } from './styles';

function InputForm({
  value,
  onChange,
  onEnter,
  maxLength,
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const { registerInput } = useRegisterChatInputFocus();

  useEffect(() => {
    registerInput(inputRef);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [registerInput]);

  // set the textarea height based on the content
  useEffect(() => {
    if (inputRef.current) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      inputRef.current.style.height = '0px';
      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputRef, value]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (typeof onEnter === 'function') { onEnter(); }
    }
  };

  return (
    <InputTextArea
      placeholder={t('Type a message...')}
      rows={1}
      ref={inputRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      aria-label={t('Write a message to the chatbot')}
      maxLength={maxLength}
    />
  );
}

InputForm.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onEnter: PropTypes.func,
  maxLength: PropTypes.number,
};

export default InputForm;
