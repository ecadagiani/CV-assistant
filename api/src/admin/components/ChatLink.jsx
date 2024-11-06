import { ValueGroup } from '@adminjs/design-system';
import PropTypes from 'prop-types';
import React from 'react';

function ChatLink({
  record,
  property,
}) {
  const { idKey = 'user', queryKey = 'userId', frontUrl } = property.props;
  const id = record.params[idKey];
  const link = `${frontUrl}?${queryKey}="${id}"&allConversations=true&incognito=true`;
  return (
    <ValueGroup label="Chat link for user">
      <a
        target="_blank"
        aria-label="Open chat in new tab"
        href={link}
        rel="noreferrer"
      >
        {link}
      </a>
    </ValueGroup>
  );
}

ChatLink.propTypes = {
  record: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
  property: PropTypes.shape({
    props: PropTypes.shape({
      idKey: PropTypes.string,
      queryKey: PropTypes.string,
      frontUrl: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default ChatLink;
