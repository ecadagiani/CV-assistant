import { get, last, orderBy } from 'lodash';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import Tooltip from 'src/components/Tooltip';
import { useUniqId } from 'src/hooks/useUniqId';
import { applyColor } from 'src/styles/colors';
import { getNbMonthsBetweenDates } from 'src/utils/date';
import * as Styled from './styles';

function EventLine({
  start,
  end = undefined,
  timelinePosition,
  title,
  titleLine = '',
  color,
  timeSkips = [],
  onOpenEventModal,
}) {
  const id = useUniqId('tooltip-eventline-');
  const nbMonths = useMemo(() => getNbMonthsBetweenDates(start, end, timeSkips), [start, end, timeSkips]);

  const memoizedLines = useMemo(() => {
    // create lines [{startIndex, endIndex, isSkip, timeSkip}, ...] startIndex and endIndex are month indexes transformed to percentage in the svg
    // the lines are draw top (most recent) to bottom (oldest)
    // startIndex=0 is the top of the svg, endIndex=100 is the bottom of the svg
    const lines = [];

    orderBy(timeSkips, ['start'], ['desc']).forEach((timeSkip) => {
      // create the normal line, and the skipped next line
      // get the previous top date
      const previousTopDate = get(last(lines), 'timeSkip.start', end);
      const normalLineStartIndex = get(last(lines), 'endIndex', 0);
      const normalLineEndIndex = get(last(lines), 'endIndex', 0) + getNbMonthsBetweenDates(timeSkip.end, previousTopDate);
      const skippedLineStartIndex = normalLineEndIndex;
      const skippedLineEndIndex = skippedLineStartIndex + 1;

      lines.push({ startIndex: normalLineStartIndex, endIndex: normalLineEndIndex, isSkip: false });
      lines.push({
        startIndex: skippedLineStartIndex, endIndex: skippedLineEndIndex, isSkip: true, timeSkip,
      });
    });

    lines.push({ startIndex: get(last(lines), 'endIndex', 0), endIndex: nbMonths, isSkip: false });
    return lines;
  }, [end, timeSkips, nbMonths]);

  return (
    <>
      <Styled.EventLineContainer
        $timelinePosition={timelinePosition}
        $color={applyColor(color)}
        $nbMonths={nbMonths}
        data-tooltip-id={id}
        onClick={onOpenEventModal}
      >
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          {memoizedLines.map(({ startIndex, endIndex, isSkip }) => (
            <line
              key={`${startIndex}-${endIndex}`}
              x1="50%"
              x2="50%"
              y1={`${(startIndex / nbMonths) * 100}%`}
              y2={`${(endIndex / nbMonths) * 100}%`}
              stroke={applyColor(color)}
              strokeWidth="var(--event_line_thickness)"
              strokeLinecap="round"
              strokeDashoffset={isSkip ? '0' : undefined}
              strokeDasharray={
              isSkip ? 'var(--event_line_skip_dash_length) var(--event_line_skip_dash_space)' : undefined
            }
            />
          ))}
        </svg>
        <Styled.EventLineTitle>
          {titleLine || title}
        </Styled.EventLineTitle>
      </Styled.EventLineContainer>
      <Tooltip
        id={id}
        content={title}
        place="right"
        noArrow
        float
      />
    </>
  );
}

EventLine.propTypes = {
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date),
  timelinePosition: PropTypes.number.isRequired,
  titleLine: PropTypes.string,
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  timeSkips: PropTypes.arrayOf(PropTypes.shape({
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date).isRequired,
  })),
  onOpenEventModal: PropTypes.func.isRequired,
};

const MemoizedEventLine = React.memo(EventLine);
export default MemoizedEventLine;
