import i18next from 'i18next';
import { COMPANY_ENTITY } from '../../../resources/constants/entity.js';
import { PAYLOADS, getCompanyPayloadCompanyExperience } from '../../../resources/constants/payloads.js';
import { RESPONSE_TYPE } from '../../constants.js';
import { getEntityValue } from '../nluController.js';
import { getTimelineData } from './timeline.js';

function getMessageTranslation(text, language, variables = {}) {
  return i18next.t(`message:${text}`, { lng: language, ...variables });
}

function getCompanyExperienceResponse(message) {
  let company;
  if (message.userMessage?.content?.payload && message.userMessage?.content?.payload.startsWith(PAYLOADS.COMPANY_EXPERIENCE)) {
    company = getCompanyPayloadCompanyExperience(message.userMessage.content.payload);
  } else if (message.parameters) {
    company = getEntityValue(message.parameters, COMPANY_ENTITY.name);
  } else {
    return [{
      type: RESPONSE_TYPE.TEXT_RESPONSE,
      content: getMessageTranslation('no_company_experience', message.language),
    }];
  }

  const { events } = getTimelineData(message.language);
  const companyEvents = events.filter((event) => event?.entityCompany === company && event.withEventDetail === true);
  if (companyEvents.length > 0) {
    return [{
      type: RESPONSE_TYPE.TEXT_RESPONSE,
      content: companyEvents.length > 1
        ? getMessageTranslation(
          'present_multi_company_experience',
          message.language,
          { company: COMPANY_ENTITY.values[company].title },
        )
        : getMessageTranslation(
          'present_one_company_experience',
          message.language,
          { company: COMPANY_ENTITY.values[company].title, nbEvents: companyEvents.length },
        ),
    },
    ...companyEvents.map((event) => ({
      type: RESPONSE_TYPE.EVENT,
      content: event,
      noScroll: true,
    }))];
  }
  return [{
    type: RESPONSE_TYPE.TEXT_RESPONSE,
    content: getMessageTranslation('no_company_experience', message.language, { company: COMPANY_ENTITY.values[company].title }),
  }];
}

export default getCompanyExperienceResponse;
