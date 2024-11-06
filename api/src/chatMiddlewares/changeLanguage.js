import { INTENTS } from '../../resources/constants/intents.js';
import { PAYLOADS } from '../../resources/constants/payloads.js';
import { getEntityValue } from '../controllers/nluController.js';

const changeLanguageMiddleware = (socket, conversation) => (next) => async (message) => {
  const {
    intent, userMessage, parameters, detectedLanguage, isDifferentLanguage, isSupportedLanguage,
  } = message;

  let newLanguage;

  if (intent?.displayName === INTENTS.Q_CHANGE_LANGUAGE || userMessage?.content?.payload === PAYLOADS.CHANGE_LANGUAGE) {
  // if user ask to change language
    const languageValue = getEntityValue(parameters, 'language')?.toLowerCase();
    const language2Value = getEntityValue(parameters, 'language2')?.toLowerCase();

    // if language is specified
    if (languageValue || language2Value) {
      if (['francais', 'french'].includes(languageValue || language2Value)) {
        newLanguage = 'fr';
      } else if (['english', 'anglais'].includes(languageValue || language2Value)) {
        newLanguage = 'en';
      }
    } else {
      // if language is not specified, we toggle the language
      newLanguage = message.language === 'fr' ? 'en' : 'fr';
    }
  } else if (detectedLanguage && isDifferentLanguage) {
    // if not change language intent
    // if detected language and is different from conversation language
    if (isSupportedLanguage) {
      // detected language is supported
      newLanguage = detectedLanguage;
    } else if (conversation.language !== 'en') {
      // detected language is not supported, and conversation language is not english
      newLanguage = 'en';
    }
  }

  if (newLanguage) {
    message.language = newLanguage;
    conversation.language = newLanguage;
    await Promise.all([message.save(), conversation.save()]);
  }
  await next(message);
};

export default changeLanguageMiddleware;
