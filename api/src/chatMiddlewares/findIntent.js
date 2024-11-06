import BPromise from 'bluebird';
import { STATIC_INTENTS } from '../../resources/constants/intents.js';
import { SUPPORTED_LANGUAGES } from '../config.js';
import { USER_MESSAGE_TYPE } from '../constants.js';
import { DFdetectIntent, detectLanguageGT, detectLanguageLocal } from '../controllers/nluController.js';
import { getSetting } from '../controllers/settingController.js';
import { logInfo } from '../utils/logger.js';

async function detectLanguage(text) {
  if (text.length < 10 || text.split(' ').length < 3) {
    // if text is too short or too few words, we do not detect language
    return null;
  }

  const localResult = detectLanguageLocal(text);

  // SIMPLE CASE: (to avoid to much google translate API calls)
  // if detected language is find in local and is a supported result
  if (localResult && SUPPORTED_LANGUAGES.includes(localResult)) {
    return localResult;
  }

  const DETECT_LANGUAGE_TIMEOUT = await getSetting('DETECT_LANGUAGE_TIMEOUT');
  try {
    // detect language with Google Translate
    const gtResult = await BPromise.method(detectLanguageGT)(text).timeout(DETECT_LANGUAGE_TIMEOUT);
    return gtResult;
  } catch (err) {
    return localResult;
  }
}

function detectStaticIntent(text) {
  const findedIntent = STATIC_INTENTS.find(
    (staticIntent) => {
      const { fullEqual, firstWord, regex } = staticIntent.triggers;
      if (fullEqual) {
        if (fullEqual.includes(text.trim().toLowerCase())) return true;
      }
      if (firstWord) {
        const words = text.trim().split(' ');
        if (words.length > 0 && firstWord.includes(words[0].toLowerCase())) return true;
      }
      if (regex) {
        if (regex.some((reg) => new RegExp(reg).test(text))) return true;
      }
      return false;
    },
  );
  if (findedIntent) return { displayName: findedIntent.displayName };
  return null;
}

const findIntentMiddleware = (socket, conversation) => (next) => async (message) => {
  // do not have to check intent, if we have payload or not a default message
  if (message.userMessage.content?.payload || message.userMessage.type !== USER_MESSAGE_TYPE.DEFAULT) {
    logInfo(
      { userId: conversation.user._id, conversationId: conversation._id },
      'findIntent - no need to detect intent we have payload or not a default message',
    );
    await next(message);
    return;
  }

  // detect static intent
  const staticIntent = detectStaticIntent(message.userMessage.content.text);
  if (staticIntent) {
    message.intent = staticIntent;
    logInfo(
      { userId: conversation.user._id, conversationId: conversation._id },
      'findIntent - staticIntent',
      staticIntent?.displayName,
    );
    await next(message);
    return;
  }

  // detect intent
  const [{ intent, parameters }, detectedLanguage] = await Promise.all([
    DFdetectIntent(conversation, message.language, message.userMessage.content.text),
    detectLanguage(message.userMessage.content.text),
  ]);
  message.intent = intent;
  message.parameters = parameters;
  message.detectedLanguage = detectedLanguage;

  // if is fallback
  if (intent.isFallback && detectedLanguage && detectedLanguage !== message.language) {
    // if language detected is different from conversation language
    message.isDifferentLanguage = true;

    // if language is different, we test intent with language toggled
    // even if the language is not supported, we test the intent detection, because the language detection could be false
    const secondLanguage = message.language === 'en' ? 'fr' : 'en';
    const secondIntentDetection = await DFdetectIntent(conversation, secondLanguage, message.userMessage.content.text);

    if (!secondIntentDetection.intent.isFallback) {
      // toggle language give NO fallback
      message.intent = secondIntentDetection.intent;
      message.parameters = secondIntentDetection.parameters;
      message.detectedLanguage = secondLanguage;
      message.isSupportedLanguage = true;
    } else {
      // toggle language give fallback
      // we give the detected language
      message.detectedLanguage = detectedLanguage;
      message.isSupportedLanguage = SUPPORTED_LANGUAGES.includes(detectedLanguage);
    }
  }

  if (message?.intent?.displayName) {
    logInfo(
      { userId: conversation.user._id, conversationId: conversation._id },
      'findIntent - intent',
      message?.intent?.displayName,
    );
  }
  if (message?.parameters) {
    logInfo(
      { userId: conversation.user._id, conversationId: conversation._id },
      'findIntent - parameters',
      message?.parameters,
    );
  }
  logInfo(
    { userId: conversation.user._id, conversationId: conversation._id },
    'findIntent - language',
    {
      detectedLanguage,
      isDifferentLanguage: message.isDifferentLanguage,
      isSupportedLanguage: message.isSupportedLanguage,
    },
  );

  await next(message);
};

export default findIntentMiddleware;
