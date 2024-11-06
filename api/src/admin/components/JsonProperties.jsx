import { ValueGroup } from '@adminjs/design-system';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { restructureObject } from '../../utils/restructureObject';
import JsonSection from './JsonSection';

function JsonProperties({ record, property, where }) {
  const obj = useMemo(() => restructureObject(record.params), [record.params]);

  if (where === 'list') {
    return <JsonSection data={_.get(obj, property.path)} />;
  }
  return (
    <ValueGroup label={property.label}>
      <JsonSection data={_.get(obj, property.path)} />
    </ValueGroup>
  );
}

JsonProperties.propTypes = {
  record: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
  property: PropTypes.shape({
    label: PropTypes.string,
    path: PropTypes.string,
  }).isRequired,
  where: PropTypes.string,
};

export default JsonProperties;
