import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import TextChat from 'src/components/TextChat';
import Tooltip from 'src/components/Tooltip';
import { getDateDurationText } from 'src/utils/date';
import { escapeForId, sliceWithoutBreakWord } from 'src/utils/string';
import * as Styled from './styles';
import {
  CardContentContainer,
  CardEventDuration,
  CardIcon,
  CardReadMoreButton,
  CardSkillsIcons,
  CardSkillsIconsContainer,
  CardText,
  CardTitle,
  CardTitleContainer,
  CardTopContainer,
} from './styles';

function EventCard({
  start,
  title,
  text,
  onOpenEventModal,
  end = undefined,
  icon = undefined,
  iconAlt = undefined,
  skills = [],
  summarizedText = undefined,
  withEventDetail = true,
}) {
  const { t } = useTranslation();
  const eventDuration = getDateDurationText(t, start, end);

  return (
    <Styled.Card>
      <CardTopContainer>
        {eventDuration && (
          <CardEventDuration>
            {eventDuration}
          </CardEventDuration>
        )}
        <CardTitleContainer>
          {/* eslint-disable-next-line import/namespace */}
          {icon && (
            <CardIcon
              // eslint-disable-next-line import/namespace
              src={icon}
              alt={iconAlt}
            />
          )}
          <CardTitle>
            {title}
          </CardTitle>
        </CardTitleContainer>
      </CardTopContainer>
      <CardContentContainer>
        {skills && (
          <CardSkillsIconsContainer>
            {skills.map((skill) => (
              <React.Fragment
                key={skill.icon}
              >
                <CardSkillsIcons
                  src={skill.icon}
                  alt={skill.name}
                  data-tooltip-id={`timeline_skill_tooltip${escapeForId(title)}${escapeForId(skill.icon)}`}
                />
                <Tooltip
                  id={`timeline_skill_tooltip${escapeForId(title)}${escapeForId(skill.icon)}`}
                  content={skill.name}
                  place="top"
                />
              </React.Fragment>
            ))}
          </CardSkillsIconsContainer>
        )}
        <CardText>
          <TextChat text={withEventDetail ? sliceWithoutBreakWord(summarizedText || text, 0, 100) : text} />
          {withEventDetail && (
          <CardReadMoreButton
            type="button"
            aria-label={t('read_more_about_x_which_open_a_modal', { event: title })}
            onClick={onOpenEventModal}
          >
            {t('read more')}
          </CardReadMoreButton>
          )}
        </CardText>
      </CardContentContainer>
    </Styled.Card>
  );
}

EventCard.propTypes = {
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date),
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  summarizedText: PropTypes.string,
  icon: PropTypes.string,
  iconAlt: PropTypes.string,
  skills: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
  withEventDetail: PropTypes.bool,
  onOpenEventModal: PropTypes.func.isRequired,
};

const MemoizedEventCard = React.memo(EventCard);
export default MemoizedEventCard;
