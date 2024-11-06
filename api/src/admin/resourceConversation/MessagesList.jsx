import { Badge, ButtonCSS, ValueGroup } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import { ViewHelpers } from 'adminjs';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { restructureObject } from '../../utils/restructureObject';

const StyledLink = styled(Link)`
  ${ButtonCSS};
  padding-left: ${({ theme }) => theme.space.xs};
  padding-right: ${({ theme }) => theme.space.xs};
`;

function MessagesList({ record, property }) {
  const messages = useMemo(() => restructureObject(record.populated).messages, [record.populated]);

  const h = new ViewHelpers();
  return (
    <ol className="messages-list">
      {(messages || []).map((message, index) => {
        const href = h.recordActionUrl({
          resourceId: property.reference, recordId: message.id, actionName: 'show',
        });
        return (
          <li className="messages-item" key={message.id}>
            <span className="messages-item-index">{index + 1}</span>
            <ValueGroup label="Message">
              <StyledLink variant="text" to={href}>
                {message.id}
              </StyledLink>
            </ValueGroup>
            <ValueGroup label="questionId">
              <Badge variant="default">{message?.params?.questionId}</Badge>
            </ValueGroup>
            <ValueGroup label="responseId">
              <Badge variant="default">{message?.params?.responseId}</Badge>
            </ValueGroup>
          </li>
        );
      })}
    </ol>
  );
}

MessagesList.propTypes = {
  record: PropTypes.shape({
    populated: PropTypes.object,
  }).isRequired,
  property: PropTypes.shape({
    reference: PropTypes.string,
  }).isRequired,
};

export default MessagesList;
