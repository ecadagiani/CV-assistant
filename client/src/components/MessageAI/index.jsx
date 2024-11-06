import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CheckIcon from 'src/assets/icons/check.svg?react';
import DateMessagePopover from 'src/components/DateMessagePopover';
import { Bubble, BubbleContainer } from 'src/components/MessageBubble/styles';
import TextChat from 'src/components/TextChat';
import useMessageDate from 'src/hooks/useMessageDate';
import { useUniqId } from 'src/hooks/useUniqId';
import MessageLine from '../MessageLine';
import Tooltip from '../Tooltip';
import { AIBadge } from './styles';

function MessageAI({
  text, isVerified, date,
}) {
  const id = useUniqId();
  const { t } = useTranslation();
  const { toggleDate, displayDate } = useMessageDate();

  return (
    <MessageLine $isOwn={false}>
      <BubbleContainer $isOwn={false}>
        <Bubble onClick={toggleDate}>
          <TextChat text={text} disableIntentLink />
          <AIBadge
            data-tooltip-id={`message_ai_tooltip${id}`}
          >
            {t('AI')}
            {isVerified && <CheckIcon />}
          </AIBadge>
          <Tooltip
            id={`message_ai_tooltip${id}`}
            content={t(isVerified
              ? 'This message was produced by an artificial intelligence and verified'
              : 'This message was produced by an artificial intelligence')}
            place="top"
          />
        </Bubble>
        {displayDate && (
        <DateMessagePopover date={date} />
        )}
      </BubbleContainer>
    </MessageLine>
  );
}

MessageAI.propTypes = {
  text: PropTypes.string.isRequired,
  isVerified: PropTypes.bool,
  date: PropTypes.instanceOf(Date).isRequired,
};

const MemoizedMessageAI = React.memo(MessageAI);
export default MemoizedMessageAI;
