import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import * as Styled from './styles';

function Graduation({
  date, withName = false, isSkip = false, isFirst = false, isLast = false,
}) {
  const { i18n } = useTranslation();

  return (
    <Styled.GraduationLine
      $isFirst={isFirst}
      $isLast={isLast}
      $isSkip={isSkip}
    >
      <Styled.GraduationTick />
      {isSkip && (
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <line
          x1="50%"
          x2="50%"
          y1="0"
          y2="10%"
          stroke="var(--scale_color)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="50%"
          x2="50%"
          y1="10%"
          y2="90%"
          stroke="var(--scale_color)"
          strokeWidth="1"
          strokeDashoffset="0"
          strokeDasharray="var(--graduation_skip_dash_length) var(--graduation_skip_dash_space)"
          strokeLinecap="round"
        />
        <line
          x1="50%"
          x2="50%"
          y1="90%"
          y2="100%"
          stroke="var(--scale_color)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      )}
      {withName && (
      <Styled.GraduationName>
        {date.toLocaleString(i18n.language, { month: 'long' })}
        <Styled.GraduationNameYear>
          {date.getFullYear()}
        </Styled.GraduationNameYear>
      </Styled.GraduationName>
      )}
    </Styled.GraduationLine>
  );
}

Graduation.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  withName: PropTypes.bool,
  isSkip: PropTypes.bool,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,

};

const MemoizedGraduation = React.memo(Graduation);
export default MemoizedGraduation;
