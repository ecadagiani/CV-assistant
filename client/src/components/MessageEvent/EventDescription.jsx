import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import TextChat from 'src/components/TextChat';
import Tooltip from 'src/components/Tooltip';
import { FONT_SIZE } from 'src/styles';
import { getDateDurationText } from 'src/utils/date';
import { escapeForId } from 'src/utils/string';
import * as Styled from './styles';

function EventDescription({
  title,
  text,
  start,
  end = undefined,
  withSkillsDetails = false,
  skills = [],
  TitleComponent = 'h2',
  DescriptionComponent = 'div',
}) {
  const { t } = useTranslation();
  return (
    <Styled.DescriptionBlock>
      <Styled.Title as={TitleComponent}>{title}</Styled.Title>
      {start && (
        <Styled.Date>
          <Styled.LocaleDate>
            {start.toLocaleDateString()}
            {end && ` - ${end.toLocaleDateString()}`}
          </Styled.LocaleDate>
          <Styled.DateDuration>
            {getDateDurationText(t, start, end)}
          </Styled.DateDuration>
        </Styled.Date>
      )}
      {/* SKILL ICONS WITH TOOLTIP UNDER TITLE */}
      {!withSkillsDetails && (
      <Styled.TitleSkillIconContainer>
        {skills.map((skill) => (
          <Fragment
            key={skill.id}
          >
            <Styled.TitleSkillIcon
              src={skill.icon}
              alt={skill.name}
              data-tooltip-id={`timeline_event_modal_skill_tooltip${escapeForId(skill.id)}`}
            />
            <Tooltip
              id={`timeline_event_modal_skill_tooltip${escapeForId(skill.id)}`}
              content={skill.name}
              place="top"
              style={{ fontSize: FONT_SIZE.medium }}
            />
          </Fragment>
        ))}
      </Styled.TitleSkillIconContainer>
      )}

      <Styled.Description as={DescriptionComponent}>
        <TextChat text={text} />
      </Styled.Description>
    </Styled.DescriptionBlock>
  );
}

EventDescription.propTypes = {
  withSkillsDetails: PropTypes.bool,
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  skills: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    text: PropTypes.string,
    icon: PropTypes.string.isRequired,
    iconOutlined: PropTypes.string,
    usageRatio: PropTypes.number,
    color: PropTypes.string,
  })),
  start: PropTypes.instanceOf(Date),
  end: PropTypes.instanceOf(Date),
  TitleComponent: PropTypes.elementType,
  DescriptionComponent: PropTypes.elementType,
};

export default EventDescription;
