import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { LinkDiagonal, LinkVertical } from './styles';
import { getSkillCoord } from './utils';

function SkillLink({
  from,
  to,
  nbColumns,
  nbRows,
}) {
  const fromPos = useMemo(() => getSkillCoord(from), [from]);
  const toPos = useMemo(() => getSkillCoord(to), [to]);

  const isVertical = fromPos.x === toPos.x;
  const isDiagonal = fromPos.y < toPos.y && fromPos.x !== toPos.x;

  if (!isVertical && !isDiagonal) {
    throw new Error('SkillLink: from and to, not compatible');
  }

  if (isDiagonal) {
    return (
      <LinkDiagonal
        $fromPos={fromPos}
        $toPos={toPos}
        $nbColumns={nbColumns}
        $nbRows={nbRows}
      />
    );
  }
  return (
    <LinkVertical
      $fromPos={fromPos}
      $toPos={toPos}
      $nbColumns={nbColumns}
      $nbRows={nbRows}
      $left={(fromPos.x + 1) * (100 / (nbColumns + 1))}
      $top={(fromPos.y + 1) * (100 / (nbRows + 1))}
    />
  );
}

SkillLink.propTypes = {
  nbColumns: PropTypes.number.isRequired,
  nbRows: PropTypes.number.isRequired,
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

const MemoizedSkillLink = React.memo(SkillLink);
export default MemoizedSkillLink;
