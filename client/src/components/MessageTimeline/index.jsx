import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import MessageLine from 'src/components/MessageLine';

import EventModal from './EventModal';
import Month from './Month';
import * as Styled from './styles';
import { getTimelineMonths, parseServerTimelineData } from './utils';

// eslint-disable-next-line no-unused-vars
function Timeline({ date: _, timelineData }) {
  const [modalEvent, setModalEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const months = useMemo(() => {
    const parsedTimelineData = parseServerTimelineData(timelineData);
    return getTimelineMonths(parsedTimelineData);
  }, [timelineData]);

  const onOpenEventModal = (event) => {
    setModalEvent(event);
    setIsModalOpen(true);
  };

  return (
    <MessageLine>
      <Styled.TimelineContainer>
        {months.map(({
          date, withName, isSkip, events,
        }, index) => (
          <Month
            key={date.getTime()}
            date={date}
            withName={withName}
            isSkip={isSkip}
            events={events}
            isFirst={index === 0}
            isLast={index === months.length - 1}
            onOpenEventModal={onOpenEventModal}
          />
        ))}
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          {...modalEvent}
        />
      </Styled.TimelineContainer>
    </MessageLine>
  );
}

Timeline.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  timelineData: PropTypes.object.isRequired,
};

const MemoizedTimeline = React.memo(Timeline);
export default MemoizedTimeline;
