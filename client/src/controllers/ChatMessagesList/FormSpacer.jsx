import PropTypes from 'prop-types';
import React from 'react';
import { FormSpacerBlock } from './styles';

function FormSpacer({ height }) {
  return (
    <FormSpacerBlock style={{ height }} />
  );
}

FormSpacer.propTypes = {
  height: PropTypes.number.isRequired,
};

export default React.memo(FormSpacer);
