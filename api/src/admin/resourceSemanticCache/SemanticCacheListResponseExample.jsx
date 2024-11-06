import PropTypes from 'prop-types';

function SemanticCacheListResponseExample({record}) {
  return record.params['responses.0.response'];
}

SemanticCacheListResponseExample.propTypes = {
  record: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
};

export default SemanticCacheListResponseExample;
