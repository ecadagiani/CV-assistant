import cx from 'classnames';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Flipped, Flipper } from 'react-flip-toolkit';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import Tooltip from 'src/components/Tooltip';
import { applyColor } from 'src/styles/colors';
import { escapeForId } from 'src/utils/string';
import * as Styled from './styles';

function EventSkillsBubble({
  skills,
}) {
  const { t } = useTranslation();
  const [highlightedSkill, setHighlightedSkill] = useState(null);
  const skillsWithUsageRatio = skills.filter((skill) => !!skill.usageRatio);
  const skillsWithText = skills.filter((skill) => !!skill.text);

  // deepcode ignore NoZeroReturnedInSort: add highlightedSkill in first, and other after
  const sortedSkills = skillsWithText.sort((a, _) => (a.id === highlightedSkill ? -1 : 1));

  return (
    <>
      <Styled.SkillUsageBarContainer>
        {skillsWithUsageRatio.length && skillsWithUsageRatio.map((skill) => (
          <Styled.SkillUsageBarItem
            key={skill.id}
            $ratio={skill.usageRatio}
            $color={applyColor(skill.color)}
            data-tooltip-id={`timeline_event_modal_skillbar_tooltip${escapeForId(skill.id)}`}
            onMouseEnter={() => setHighlightedSkill(skill.id)}
          >
            <Styled.SkillUsageBarIcons
              src={skill.iconOutlined || skill.icon}
              alt={t(skill.name)}
            />
            <Tooltip
              id={`timeline_event_modal_skillbar_tooltip${escapeForId(skill.id)}`}
              content={t(skill.name)}
              place="top"
            />
          </Styled.SkillUsageBarItem>
        ))}
      </Styled.SkillUsageBarContainer>
      <Styled.SkillTextContainer>
        <Flipper flipKey={sortedSkills.map((x) => x.id).join('')}>
          {sortedSkills.map((skill) => (
            <Flipped
              key={skill.id}
              flipId={skill.id}
            >
              <Styled.SkillTextItem
                className={cx({ highlighted: highlightedSkill === skill.id })}
              >
                <Styled.SkillTextIcon
                  src={skill.icon}
                  alt={t(skill.name)}
                />
                <Styled.SkillTextText>
                  <Styled.SkillTextTitle>
                    {t(skill.name)}
                  </Styled.SkillTextTitle>
                  <ReactMarkdown>
                    {t(skill.text)}
                  </ReactMarkdown>
                </Styled.SkillTextText>
              </Styled.SkillTextItem>
            </Flipped>
          ))}
        </Flipper>
      </Styled.SkillTextContainer>
    </>
  );
}

EventSkillsBubble.propTypes = {
  skills: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    text: PropTypes.string,
    icon: PropTypes.string.isRequired,
    iconOutlined: PropTypes.string,
    usageRatio: PropTypes.number,
    color: PropTypes.string,
  })).isRequired,
};

export default EventSkillsBubble;
