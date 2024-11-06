import PropTypes from 'prop-types';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { DateContainer } from './styles';

function DateMessagePopover({
  date,
}) {
  const { i18n } = useTranslation();
  const isPreviousDay = (new Date()).getDate() - date.getDate() === 1;

  return (
    <DateContainer>
      {isPreviousDay
        ? date.toLocaleString(i18n.language, {
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        })
        : date.toLocaleTimeString(i18n.language, { hour: 'numeric', minute: 'numeric' })}
    </DateContainer>
  );
}

DateMessagePopover.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

const MemoizedDateMessagePopover = React.memo(DateMessagePopover);
export default MemoizedDateMessagePopover;
