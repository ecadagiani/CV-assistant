import { ButtonCSS, ValueGroup } from '@adminjs/design-system';
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

function ConversationList({ record, property }) {
  const conversations = useMemo(() => restructureObject(record.populated).conversations.map((conversation) => ({
    ...conversation,
    restructuredParams: restructureObject(conversation.params),
  })), [record.populated]);

  const h = new ViewHelpers();
  return (
    <ol className="conversations-list">
      {(conversations || []).map((conversation, index) => {
        const href = h.recordActionUrl({
          resourceId: property.reference, recordId: conversation.id, actionName: 'show',
        });
        const createdAt = new Date(conversation.params?.createdAt);
        const updatedAt = new Date(conversation.params?.updatedAt);
        return (
          <li className="conversations-item" key={conversation.id}>
            <span className="conversations-item-index">{index + 1}</span>
            <ValueGroup label="Conversation">
              <StyledLink variant="text" to={href}>
                {conversation.id}
              </StyledLink>
            </ValueGroup>
            <ValueGroup label="messages" value={conversation.restructuredParams.messages?.length} />
            <ValueGroup label="createdAt" value={createdAt.toLocaleString()} />
            <ValueGroup label="updatedAt" value={updatedAt.toLocaleString()} />
          </li>
        );
      })}
    </ol>
  );
}

ConversationList.propTypes = {
  record: PropTypes.shape({
    populated: PropTypes.object,
  }).isRequired,
  property: PropTypes.shape({
    reference: PropTypes.string,
  }).isRequired,
};

export default ConversationList;
