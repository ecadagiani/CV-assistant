/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import React from 'react';
import { Bubble } from 'src/components/MessageBubble/styles';
import MessageLine from 'src/components/MessageLine';
import EventDescription from './EventDescription';
import EventSkillsBubble from './EventSkillsBubble';
import EventSlide from './EventSlide';
import * as Styled from './styles';

function MessageEvent({
  event, isOwn = false, date,
}) {
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;
  return (
    <MessageLine>
      <Styled.BubbleEventContainer $isOwn={isOwn}>
        <Bubble>
          <EventDescription
            title={event.title}
            text={event.text}
            skills={event.skills}
            withSkillsDetails={event.withSkillsDetails}
            start={start}
            end={end}
          />
        </Bubble>
      </Styled.BubbleEventContainer>
      {event.withSkillsDetails && (
        <Styled.BubbleEventContainer $isOwn={isOwn}>
          <Bubble>
            <EventSkillsBubble skills={event.skills} />
          </Bubble>
        </Styled.BubbleEventContainer>
      )}
      <Styled.BubbleEventContainer $isOwn={isOwn}>
        <EventSlide
          title={event.title}
          captures={event.captures}
          capturesOptions={event.capturesOptions}
        />
      </Styled.BubbleEventContainer>
    </MessageLine>
  );
}

MessageEvent.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    start: PropTypes.string.isRequired,
    end: PropTypes.string,
    style: PropTypes.instanceOf(Object),
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    skills: PropTypes.arrayOf(PropTypes.shape({
      icon: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })),
    withSkillsDetails: PropTypes.bool,
    captures: PropTypes.arrayOf(PropTypes.string),
    capturesOptions: PropTypes.object,
  }).isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  isOwn: PropTypes.bool,
};

const MemoizedMessageEvent = React.memo(MessageEvent);
export default MemoizedMessageEvent;
