import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';
import EventCard from './EventCard';
import EventLine from './EventLine';
import * as Styled from './styles';

const Event = forwardRef(({
  start,
  end = undefined,
  timelinePosition,
  color = undefined,
  timeSkips = [],
  style = undefined,
  title,
  titleLine = '',
  text,
  summarizedText = undefined,
  icon = undefined,
  iconAlt = undefined,
  skills = [],
  withEventDetail = true,
  onOpenEventModal,
}, ref) => (
  <Styled.EventContainer
    $isLine={!!end}
    $timelinePosition={timelinePosition}
    $style={style}
    ref={ref}
  >
    <Styled.CardLink />
    {end ? (
      <EventLine
        start={start}
        end={end}
        timelinePosition={timelinePosition}
        title={title}
        titleLine={titleLine}
        color={color}
        timeSkips={timeSkips}
        style={style}
        onOpenEventModal={onOpenEventModal}
      />
    ) : (
      <Styled.Point
        $timelinePosition={timelinePosition}
      />
    )}
    <EventCard
      start={start}
      end={end}
      title={title}
      text={text}
      summarizedText={summarizedText}
      icon={icon}
      iconAlt={iconAlt}
      skills={skills}
      withEventDetail={withEventDetail}
      onOpenEventModal={onOpenEventModal}
    />
  </Styled.EventContainer>
));

Event.propTypes = {
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date),
  timelinePosition: PropTypes.number.isRequired,
  color: PropTypes.string,
  timeSkips: PropTypes.arrayOf(PropTypes.shape({
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date).isRequired,
  })),
  style: PropTypes.instanceOf(Object),
  title: PropTypes.string.isRequired,
  titleLine: PropTypes.string,
  text: PropTypes.string.isRequired,
  summarizedText: PropTypes.string,
  icon: PropTypes.string,
  iconAlt: PropTypes.string,
  skills: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
  withEventDetail: PropTypes.bool,
  onOpenEventModal: PropTypes.func.isRequired,
};

const MemoizedEvent = React.memo(Event);
export default MemoizedEvent;
