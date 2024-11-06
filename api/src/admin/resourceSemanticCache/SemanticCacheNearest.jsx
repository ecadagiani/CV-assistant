import {
  Box, Button, ButtonCSS,
  Text,
  ValueGroup,
} from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import { ApiClient, ViewHelpers } from 'adminjs';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)`
${ButtonCSS};
padding-left: ${({ theme }) => theme.space.xs};
padding-right: ${({ theme }) => theme.space.xs};
`;

function SemanticCacheNearest({ record, resource }) {
  const [nearest, setNearest] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);

  const loadNearest = async () => {
    const api = new ApiClient();
    api.recordAction({
      resourceId: 'SemanticCache',
      recordId: record.id,
      actionName: 'getNearest',
    }).then((response) => {
      setNearest(response.data.nearest);
      setTotalTokens(response.data.totalTokens);
    });
  };

  const h = new ViewHelpers();
  return (
    <Box>
      <Button
        type="button"
        onClick={loadNearest}
        variant="contained"
      >
        Load
      </Button>
      {totalTokens > 0 && (
        <Text style={{ paddingTop: '1em' }}>
          <pre style={{ padding: '0.5em', display: 'inline' }}>
            Total tokens=
            {totalTokens}
          </pre>
        </Text>
      )}
      <ol className="semantic_cache-nearest">
        {nearest.map((item, index) => {
          const href = h.recordActionUrl({
            resourceId: resource.id, recordId: item._id, actionName: 'show',
          });
          return (
            <li className="semantic_cache-nearest-item" key={item._id}>
              <span className="semantic_cache-nearest-item-index">{index + 1}</span>
              <ValueGroup label="SemanticCache">
                <StyledLink variant="text" to={href}>
                  {item._id}
                </StyledLink>
              </ValueGroup>
              <ValueGroup label="distance">
                {_.round(item.score, 5)}
              </ValueGroup>
              <ValueGroup label="question">
                {item.question}
              </ValueGroup>
            </li>
          );
        })}
      </ol>
    </Box>
  );
}

SemanticCacheNearest.propTypes = {
  record: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
};

export default SemanticCacheNearest;
