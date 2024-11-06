import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from 'src/components/Tooltip';
import {
  ErrorMessage,
  InputLabel,
  InputText,
} from './styles';

const InputContactForm = React.memo(forwardRef(({
  label,
  value,
  onChange,
  InputComponent,
  isRequired = true,
  errorMessage = null,
  ...rest
}, ref) => {
  const { t } = useTranslation();
  return (
    <InputLabel>
      <InputText>
        {label}
        {isRequired && (
          <>
            <span data-tooltip-id="contact-form-tooltip-email">*</span>
            <Tooltip
              id="contact-form-tooltip-email"
              content={t('required')}
              place="top"
            />
          </>
        )}
      </InputText>
      <InputComponent
        value={value}
        onChange={onChange}
        ref={ref}
        {...rest}
      />
      {errorMessage && (
        <ErrorMessage>
          {errorMessage}
        </ErrorMessage>
      )}
    </InputLabel>
  );
}));

InputContactForm.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  InputComponent: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  errorMessage: PropTypes.node,
};

export default InputContactForm;
