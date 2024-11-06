import i18next from 'i18next';
import _ from 'lodash';
import RESPONSE_DATA from '../../../resources/constants/responsesData.js';
import { RESPONSE_TYPE } from '../../constants.js';
import { getDocumentUrl, getImageUrl } from '../../utils/files.js';
import getCanWorkTechnologyResponse from './canWorkTechnology.js';
import getCompanyExperienceResponse from './companyExperience.js';
import getDidWorkTechnologyResponse from './didWorkTechnology.js';
import getJokeImageMessage from './joke.js';
import getSkillsData from './skills.js';
import getTimelineMessage from './timeline.js';


function getMessageTranslation(text, language, variables = {}) {
  let selectedText = text;
  if (Array.isArray(text)) {
    selectedText = text[_.random(0, text.length - 1)];
  }
  return i18next.t(`message:${selectedText}`, { lng: language, ...variables });
}

/**
 * Get response data for a given response key
 * @param {string} key - Response key from RESPONSE_DATA keys
 * @returns {Function} Function that returns array of response objects based on message/language
 * @throws {Error} If response key is not found in RESPONSE_DATA
 */
export function getResponse(key) {
  if( !RESPONSE_DATA[key]) {
    throw new Error(`Unknown response key: ${key}`);
  }

  const { handler, responses } = RESPONSE_DATA[key];

  switch (handler) {
    case 'SMALLTALK':
      return (message) => {
        const smalltalk = message.intent.displayName.slice(10);
        return [{
          type: RESPONSE_TYPE.TEXT_RESPONSE,
          content: i18next.t(`smalltalk:${smalltalk}`, { lng: message.language }),
        }];
      }
    case 'CAN_WORK_TECHNOLOGY':
      return  (message) => getCanWorkTechnologyResponse(message);
    case 'DID_WORK_TECHNOLOGY':
      return  (message) => getDidWorkTechnologyResponse(message);
    case 'COMPANY_EXPERIENCE':
      return  (message) => getCompanyExperienceResponse(message);
    default:
  }

  return (language) => responses.map((response) => {
    switch(response.handler){
      case 'JOKE_IMAGE':
        return getJokeImageMessage(language);
      default:
        break;
    }

    switch (response.type) {
      case RESPONSE_TYPE.TEXT_RESPONSE:
        if (response.content.multiLingual) {
          return {
            type: RESPONSE_TYPE.TEXT_RESPONSE,
            content: {
              fr: getMessageTranslation(response.content.translations, 'fr'),
              en: getMessageTranslation(response.content.translations, 'en'),
            },
            noScroll: response.noScroll,
          };
        }
        return {
          type: RESPONSE_TYPE.TEXT_RESPONSE,
          content: getMessageTranslation(response.content.translations, language),
          noScroll: response.noScroll,
        };

      case RESPONSE_TYPE.IMAGE:
        return {
          type: RESPONSE_TYPE.IMAGE,
          content: {
            id: response.content.id,
            src: getImageUrl(response.content.src),
            alt: getMessageTranslation(response.content.alt, language),
            height: response.content.height,
            width: response.content.width,
          },
          noScroll: response.noScroll,
        };

      case RESPONSE_TYPE.TEXT_WITH_IMAGE:
        if (response.content.multiLingual) {
          return {
            type: RESPONSE_TYPE.TEXT_WITH_IMAGE,
            content: {
              text: {
                fr: getMessageTranslation(response.content.translations, 'fr'),
                en: getMessageTranslation(response.content.translations, 'en'),
              },
              picture: getImageUrl(response.content.picture),
              pictureAlt: getMessageTranslation(response.content.pictureAlt, language),
            },
            noScroll: response.noScroll,
          };
        }
        return {
          type: RESPONSE_TYPE.TEXT_WITH_IMAGE,
          content: {
            text: getMessageTranslation(response.content.translations, language),
            picture: getImageUrl(response.content.picture),
            pictureAlt: getMessageTranslation(response.content.pictureAlt, language),
          },
          noScroll: response.noScroll,
        };

      case RESPONSE_TYPE.FILE:
        return {
          type: RESPONSE_TYPE.FILE,
          content: {
            fileType: response.content.fileType,
            url: getDocumentUrl(response.content.urlByLanguage[language]),
            name: response.content.name,
          },
          noScroll: response.noScroll,
        };

      case RESPONSE_TYPE.RESTART:
        return {
          type: RESPONSE_TYPE.RESTART,
        };

      case RESPONSE_TYPE.TIMELINE:
        return {
          type: RESPONSE_TYPE.TIMELINE,
          content: getTimelineMessage(language, response.categories),
          noScroll: response.noScroll,
        };
        
      case RESPONSE_TYPE.SKILLS:
        return {
          type: RESPONSE_TYPE.SKILLS,
          content: getSkillsData(language),
          noScroll: response.noScroll,
        };

      default:
        throw new Error(`Unknown response type: ${response.type}`);
    }
    }).flat();
}


export default getResponse;
