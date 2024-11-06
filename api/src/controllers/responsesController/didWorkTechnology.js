import i18next from 'i18next';
import { TECHNOLOGY_ENTITY } from '../../../resources/constants/entity.js';
import { RESPONSE_TYPE } from '../../constants.js';
import { getEntityValue } from '../nluController.js';
import { getTimelineData } from './timeline.js';

function getMessageTranslation(text, language, variables = {}) {
  return i18next.t(`message:${text}`, { lng: language, ...variables });
}
function getSkillsTranslation(technology, language) {
  return i18next.t(`skills:${technology}`, { lng: language });
}

function getDidWorkTechnologyResponse(message) {
  const technology = getEntityValue(message.parameters, TECHNOLOGY_ENTITY.name);
  const { events } = getTimelineData(message.language);
  const eventForTechnology = events.filter((event) => (event?.entityTechnologies || []).includes(technology));
  if (eventForTechnology.length > 0) {
    return [{
      type: RESPONSE_TYPE.TEXT_RESPONSE,
      content: (
        `${getMessageTranslation(
          'events_with_technology',
          message.language,
          { count: eventForTechnology.length, technology: getSkillsTranslation(technology, message.language) },
        )}\n\n${
          eventForTechnology.map((event) => (
            !!event?.entityCompany && event.withEventDetail === true // same condition than in companyExperienceResponse.js
              ? getMessageTranslation(
                'events_with_technology_item_link',
                message.language,
                { company: event.title, entityCompany: event.entityCompany },
              ) : getMessageTranslation(
                'events_with_technology_item_no_link',
                message.language,
                { company: event.title, entityCompany: event.entityCompany },
              ))).join('\n\n')
        }`),
    }, {
      type: RESPONSE_TYPE.TEXT_RESPONSE,
      content: getMessageTranslation(
        'events_with_technology_end',
        message.language,
        { technology: getSkillsTranslation(technology, message.language) },
      ),
    }];
  }

  return [{
    type: RESPONSE_TYPE.TEXT_RESPONSE,
    content: getMessageTranslation(
      'no_event_for_technology',
      message.language,
      { technology: getSkillsTranslation(technology, message.language) },
    ),
  }];
}

export default getDidWorkTechnologyResponse;
