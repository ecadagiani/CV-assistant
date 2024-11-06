import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from 'src/components/Tooltip';
import { useUniqId } from 'src/hooks/useUniqId';

import {
  SkillCircle, SkillImage, SkillName, SkillPoint,
} from './styles';

function SkillItem({
  name,
  image,
  score,
  transformImageSize = 1,
  tooltipText = '',
  highlight = false,
  shrinkText = false,
}) {
  const id = useUniqId('tooltip-skill-');
  return (
    <>
      <SkillCircle data-tooltip-id={id}>
        {Array(5).fill(null).map((_, index) => (
          <SkillPoint
            key={index} // eslint-disable-line react/no-array-index-key
            $position={index}
            $isAchieve={index + 1 <= score}
          />
        ))}
        <SkillImage $transformImageSize={transformImageSize} src={image} alt={name} />
        <SkillName $shrinkText={shrinkText} $highlight={highlight}>{name}</SkillName>
      </SkillCircle>
      {tooltipText && (
        <Tooltip
          id={id}
          content={tooltipText}
          offset={30}
          place="top"
        />
      )}
    </>
  );
}

SkillItem.propTypes = {
  name: PropTypes.string.isRequired,
  tooltipText: PropTypes.string,
  image: PropTypes.string.isRequired,
  transformImageSize: PropTypes.number,
  score: PropTypes.number.isRequired,
  highlight: PropTypes.bool,
  shrinkText: PropTypes.bool,
};

const MemoizedSkillItem = React.memo(SkillItem);
export default MemoizedSkillItem;
