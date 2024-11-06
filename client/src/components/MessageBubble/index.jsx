import PropTypes from 'prop-types';
import React from 'react';
import DateMessagePopover from 'src/components/DateMessagePopover';
import MessageLine from 'src/components/MessageLine';
import TextChat from 'src/components/TextChat';
import useMessageDate from 'src/hooks/useMessageDate';
import { Bubble, BubbleContainer } from './styles';

function MessageBubble({
  text, isOwn = false, date,
}) {
  const { toggleDate, displayDate } = useMessageDate();

  return (
    <MessageLine>
      <BubbleContainer $isOwn={isOwn}>
        <Bubble onClick={toggleDate}>
          <TextChat text={text} />
        </Bubble>
        {displayDate && (
        <DateMessagePopover date={date} />
        )}
      </BubbleContainer>
    </MessageLine>
  );
}

MessageBubble.propTypes = {
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      fr: PropTypes.string,
      en: PropTypes.string,
    }),
  ]).isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  isOwn: PropTypes.bool,
};

const MemoizedMessageBubble = React.memo(MessageBubble);
export default MemoizedMessageBubble;
