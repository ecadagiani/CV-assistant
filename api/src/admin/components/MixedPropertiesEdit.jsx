import { FormGroup, FormMessage, Input } from '@adminjs/design-system';
import { PropertyLabel, useTranslation } from 'adminjs';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { restructureObject } from '../../utils/restructureObject';

// https://github.com/SoftwareBrothers/adminjs/blob/master/src/frontend/components/property-type/textarea/edit.tsx

function MixedPropertiesEdit({ onChange, property, record }) {
  const { tm } = useTranslation();

  const propValue = useMemo(() => {
    let params = record.params;
    if (params?.[property.path] === undefined) {
      // if the property is not found, may be it's nested, so restructure the object
      params = restructureObject(record.params);
    }
    const v = params?.[property.path];
    if (v === undefined) {
      return '';
    }
    if (typeof v === 'string') {
      return v;
    }
    try {
      return JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  }, [record.params, property.path]);
  const [value, setValue] = useState(propValue);
  const error = record.errors?.[property.path];

  useEffect(() => {
    setValue(propValue);
  }, [propValue]);

  return (
    <FormGroup error={Boolean(error)}>
      <PropertyLabel property={property} />
      <Input
        as="textarea"
        rows={(value.match(/\n/g) || []).length + 1}
        id={property.path}
        name={property.path}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onChange(property.path, value)}
        value={value}
        disabled={property.isDisabled}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...property.props}
      />
      <FormMessage>{error && tm(error.message, property.resourceId)}</FormMessage>
    </FormGroup>
  );
}

MixedPropertiesEdit.propTypes = {
  record: PropTypes.shape({
    params: PropTypes.object,
    errors: PropTypes.object,
  }).isRequired,
  property: PropTypes.shape({
    path: PropTypes.string,
    isDisabled: PropTypes.bool,
    props: PropTypes.object,
    resourceId: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  where: PropTypes.string,
};

export default MixedPropertiesEdit;
