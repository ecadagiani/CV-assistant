import i18next from 'i18next';
import { TECHNOLOGY_ENTITY } from '../../../resources/constants/entity.js';
import { RESPONSE_TYPE, TECH_PROFICIENCY } from '../../constants.js';
import { getEntityValue } from '../nluController.js';

function getMessageTranslation(text, language, variables = {}) {
  return i18next.t(`message:${text}`, { lng: language, ...variables });
}
function getSkillsTranslation(technology, language) {
  return i18next.t(`skills:${technology}`, { lng: language });
}

function getCanWorkTechnologyResponse(message) {
  const technology = getEntityValue(message.parameters, TECHNOLOGY_ENTITY.name);

  switch (TECHNOLOGY_ENTITY.values[technology]?.level) {
    case TECH_PROFICIENCY.MASTER:
      return [{
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation(
          'can_work_with_master_technology',
          message.language,
          { technology: getSkillsTranslation(technology, message.language) },
        ),
      }, {
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation('can_work_technology_reengagement', message.language),
      }];

    case TECH_PROFICIENCY.FAMILIAR_INTERESTED:
      return [{
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation(
          'can_work_with_familiar_technology',
          message.language,
          { technology: getSkillsTranslation(technology, message.language) },
        ),
      }, {
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation('can_work_technology_reengagement', message.language),
      }];

    case TECH_PROFICIENCY.FAMILIAR_LOW_INTEREST:
      return [{
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation(
          'can_work_with_familiar_technology_but_low_interest',
          message.language,
          { technology: getSkillsTranslation(technology, message.language) },
        ),
      }, {
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation('can_work_technology_reengagement', message.language),
      }];

    case TECH_PROFICIENCY.FAMILIAR_UNINTERESTED:
      return [{
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation(
          'cannot_want_to_work_with_familiar_technology',
          message.language,
          { technology: getSkillsTranslation(technology, message.language) },
        ),
      }, {
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation('cannot_want_to_work_with_technology_reengagement', message.language),
      }];

    case TECH_PROFICIENCY.UNFAMILIAR_INTERESTED:
      return [{
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation(
          'can_work_with_unfamiliar_technology',
          message.language,
          { technology: getSkillsTranslation(technology, message.language) },
        ),
      }, {
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation('can_work_technology_reengagement', message.language),
      }];

    case TECH_PROFICIENCY.UNFAMILIAR_COMPLEX_INTERESTED:
      return [{
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation(
          'can_work_with_unfamiliar_technology_but_for_little_project',
          message.language,
          { technology: getSkillsTranslation(technology, message.language) },
        ),
      }, {
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation('can_work_technology_reengagement', message.language),
      }];

    case TECH_PROFICIENCY.UNFAMILIAR_UNINTERESTED:
      return [{
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation(
          'cannot_want_to_work_with_unfamiliar_technology',
          message.language,
          { technology: getSkillsTranslation(technology, message.language) },
        ),
      }, {
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation('cannot_want_to_work_with_technology_reengagement', message.language),
      }];

    default:
      return [{
        type: RESPONSE_TYPE.TEXT_RESPONSE,
        content: getMessageTranslation(
          'unknown_technology',
          message.language,
          { technology: getSkillsTranslation(technology, message.language) },
        ),
      }];
  }
}

export default getCanWorkTechnologyResponse;
