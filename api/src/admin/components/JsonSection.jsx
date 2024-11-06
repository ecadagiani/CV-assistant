import PropTypes from 'prop-types';
import React from 'react';
import { JsonView, defaultStyles } from 'react-json-view-lite';

function JsonSection({
  data,
  style = defaultStyles,
}) {
  if (!data) return null;
  return (
    <section className="json-section">
      <JsonView
        data={data}
        shouldExpandNode={(level, value) => (
          !!value && (
            Array.isArray(value) ? value.length > 0 : typeof value === 'object' && Object.keys(value).length > 0
          )
        )}
        style={style}
      />
    </section>
  );
}

JsonSection.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  style: PropTypes.object,
};

export default JsonSection;
