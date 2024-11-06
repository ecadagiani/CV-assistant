import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { darkStyles } from 'react-json-view-lite';
import { restructureObject } from '../../utils/restructureObject';
import JsonSection from './JsonSection';

function JsonDocument({ record }) {
  const obj = useMemo(() => restructureObject(record.params), [record.params]);
  console.info(record.params);
  console.info(JSON.stringify(record.params));

  return (
    <JsonSection data={obj} style={darkStyles} />
  );
}

JsonDocument.propTypes = {
  record: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
};

export default JsonDocument;
