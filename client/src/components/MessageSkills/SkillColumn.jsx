import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import SkillItem from './SkillItem';
import SkillItemVariant from './SkillItemVariant';
import SkillLink from './SkillLink';
import { SkillCard, SkillTree, SkillTreeItem } from './styles';
import { getSkillCoord } from './utils';

function SkillColumn({
  skills,
  skillLinks,
}) {
  const { nbColumns, nbRows } = useMemo(() => ({
    nbColumns: Object.keys(skills).reduce(
      (acc, skillPos) => Math.max(acc, getSkillCoord(skillPos).x + 1),
      0,
    ),
    nbRows: Object.keys(skills).reduce(
      (acc, skillPos) => Math.max(acc, getSkillCoord(skillPos).y + 1),
      0,
    ),
  }), [skills]);

  return (
    <SkillCard>
      <SkillTree
        $nbRows={nbRows}
        $nbColumns={nbColumns}
      >
        {skillLinks.map((link, index) => (
          <SkillLink
            key={index} // eslint-disable-line react/no-array-index-key
            nbColumns={nbColumns}
            nbRows={nbRows}
            from={link.from}
            to={link.to}
          />
        ))}
        {Object.keys(skills).map((skillKey) => (
          <SkillTreeItem
            key={skillKey} // eslint-disable-line react/no-array-index-key
            $nbColumns={nbColumns}
            $nbRows={nbRows}
            $x={getSkillCoord(skillKey).x}
            $y={getSkillCoord(skillKey).y}
          >
            {skills[skillKey].variant ? (
              <SkillItemVariant
                item={<SkillItem {...skills[skillKey].item} />}
                variant={<SkillItem {...skills[skillKey].variant} />}
              />
            ) : (
              <SkillItem {...skills[skillKey].item} />
            )}

          </SkillTreeItem>
        ))}
      </SkillTree>
    </SkillCard>
  );
}

SkillColumn.propTypes = {
  skills: PropTypes.objectOf(PropTypes.shape({
    item: PropTypes.shape({
      name: PropTypes.string.isRequired,
      tooltipText: PropTypes.string,
      image: PropTypes.string.isRequired,
      transformImageSize: PropTypes.number,
      score: PropTypes.number.isRequired,
      highlight: PropTypes.bool,
      shrinkText: PropTypes.bool,
    }),
    variant: PropTypes.shape({
      name: PropTypes.string.isRequired,
      tooltipText: PropTypes.string,
      image: PropTypes.string.isRequired,
      transformImageSize: PropTypes.number,
      score: PropTypes.number.isRequired,
      highlight: PropTypes.bool,
      shrinkText: PropTypes.bool,
    }),
  })).isRequired,
  skillLinks: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  })).isRequired,
};

const MemoizedSkillColumn = React.memo(SkillColumn);
export default MemoizedSkillColumn;
