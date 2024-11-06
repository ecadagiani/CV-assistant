import PropTypes from 'prop-types';
import React from 'react';

import { useComponentHeight } from 'src/hooks/useComponentSize';
import Event from './Event';
import Graduation from './Graduation';
import * as Styled from './styles';

function Month({
  date, withName = false, isSkip = false, isFirst = false, isLast = false, events, onOpenEventModal,
}) {
  // to avoid new message to overlap with last event, we need to know the height of last event and add it to the last month container
  const [lastEventRef, lastEventHeight] = useComponentHeight();

  return (
    <>
      <Styled.MonthContainer data-month={`${date.getMonth() + 1}/${date.getFullYear()}`}>
        <Graduation
          date={date}
          withName={withName}
          isSkip={isSkip}
          isFirst={isFirst}
          isLast={isLast}
        />
        {events.map((event, index) => (
          <Event
            key={index} // eslint-disable-line react/no-array-index-key
            onOpenEventModal={() => onOpenEventModal(event)}
            {...event}
            ref={isLast && index === events.length - 1 ? lastEventRef : null}
          />
        ))}
      </Styled.MonthContainer>
      {isLast && (
        <Styled.LastMonthContainer $lastEventHeight={lastEventHeight}>
          <Graduation
            date={date}
            withName={false}
            isSkip={false}
            isFirst={false}
            isLast
          />
        </Styled.LastMonthContainer>
      )}
    </>
  );
}

Month.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  withName: PropTypes.bool,
  isSkip: PropTypes.bool,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  onOpenEventModal: PropTypes.func.isRequired,
  events: PropTypes.arrayOf(PropTypes.shape({
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date),
    timelinePosition: PropTypes.number.isRequired,
    titleLine: PropTypes.string,
    title: PropTypes.string.isRequired,
    color: PropTypes.string,
    timeSkips: PropTypes.arrayOf(PropTypes.shape({
      start: PropTypes.instanceOf(Date).isRequired,
      end: PropTypes.instanceOf(Date).isRequired,
    })),
    skills: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      text: PropTypes.string,
      icon: PropTypes.string.isRequired,
      usageRatio: PropTypes.number,
      color: PropTypes.string,
    })),
  })).isRequired,
};

const MemoizedMonth = React.memo(Month);
export default MemoizedMonth;
