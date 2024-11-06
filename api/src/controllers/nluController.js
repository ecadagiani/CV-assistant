import dialogflow from '@google-cloud/dialogflow';
import googleTranslate from '@google-cloud/translate';
import LanguageDetect from 'languagedetect';
import _ from 'lodash';
import {
  DIALOGFLOW_ENVIRONMENT_ID, DIALOGFLOW_PROJECT_ID,
} from '../config.js';
import { logError } from '../utils/logger.js';
import { BPromisify } from '../utils/promise.js';
import { limitStringByDelimitor } from '../utils/string.js';
import { getSetting } from './settingController.js';

const dialogflowSessionsClient = new dialogflow.SessionsClient();
const lngDetector = new LanguageDetect();
lngDetector.setLanguageType('iso2');
const translate = new googleTranslate.v2.Translate();

/**
 * Retrieves the value of nlu entity parameters for a given entity name or list of names.
 * @param {Object} parameters - The parameters object.
 * @param {string|string[]} entityName - The name(s) of the entity.
 * @returns {string|undefined} - The value of the entity, or undefined if not found.
 */
export function getEntityValue(parameters, entityName) {
  if (!Array.isArray(entityName)) {
    entityName = [entityName];
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const name of entityName) {
    const entityValue = _.get(parameters, `${name}.stringValue`, undefined)
        || _.get(parameters, `${name}.listValue.values[0].stringValue`, undefined);
    if (entityValue) return entityValue;
  }
  return undefined;
}

export async function DFdetectIntent(conversation, language, userText) {
  const DIALOGFLOW_TIMEOUT = await getSetting('DIALOGFLOW_TIMEOUT');
  try {
    const dialogflowSessionPath = dialogflowSessionsClient.projectAgentEnvironmentUserSessionPath(
      DIALOGFLOW_PROJECT_ID,
      DIALOGFLOW_ENVIRONMENT_ID,
      conversation.user._id.toString(),
      conversation._id.toString(),
    );
    const [response] = await BPromisify(dialogflowSessionsClient.detectIntent({
      session: dialogflowSessionPath,
      queryInput: {
        text: {
          text: userText,
          languageCode: language,
        },
      },
    })).timeout(DIALOGFLOW_TIMEOUT);
    return {
      intent: response.queryResult.intent,
      parameters: response.queryResult?.parameters?.fields || null,
    };
  } catch (err) {
    logError(
      { userId: conversation.user._id, conversationId: conversation._id },
      'DFdetectIntent error',
      err,
      {
        text: userText,
        languageCode: language,
      },
    );
    throw err;
  }
}

export function detectLanguageLocal(text) {
  const result = lngDetector.detect(text);
  if (result.length > 0 && result[0][1] > 0.3) {
    return result[0][0];
  }
  return null;
}

export async function detectLanguageGT(text) {
  const DETECT_LANGUAGE_MAX_CHAR = await getSetting('DETECT_LANGUAGE_MAX_CHAR');
  // limit text to limit usage of google translate API
  let subText = limitStringByDelimitor(text, DETECT_LANGUAGE_MAX_CHAR, ' ', true);
  subText = subText.substring(0, DETECT_LANGUAGE_MAX_CHAR + 10);
  const [detection] = await translate.detect(subText);
  return detection?.language || null;
}
