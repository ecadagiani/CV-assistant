import i18next from 'i18next';
import _ from 'lodash';
import { BUTTONS } from '../../resources/constants/buttons.js';
import { INTENTS } from '../../resources/constants/intents.js';
import { PAYLOADS } from '../../resources/constants/payloads.js';
import { QUESTION_ID, QUESTION_ID_MAP } from '../../resources/constants/questionId.js';
import { RESPONSE_ID } from '../../resources/constants/responseId.js';
import { USER_MESSAGE_TYPE } from '../constants.js';

export function getButtonsIdFromQuestionId(questionId) {
  const questionIdEntry = QUESTION_ID_MAP[questionId];
  if (questionIdEntry) {
    return questionIdEntry.payloads.map( // return for each item, the corresponding button key if it exists, or undefined
      (payload) => Object.keys(BUTTONS).find((key) => BUTTONS[key].payload === payload),
    );
  }
  return [];
}
export function getButtonsIdFromPayload(payload) {
  return Object.keys(BUTTONS).find((key) => BUTTONS[key].payload === payload);
}

export function selectRandomButtons(quantity, {
  forbiddenKeys = [], // keys to never include
  avoidKeys = [], // keys to remove if possible, but strongly avoid them
  unrecommendedKeys = [], // keys to remove if possible, but not strongly avoid them
}) {
  let buttonsKeys = Object.keys(BUTTONS);
  const avoidCopy = _.shuffle(avoidKeys);
  const unrecommendedCopy = _.shuffle(unrecommendedKeys);

  // Remove forbidden buttons
  buttonsKeys = buttonsKeys.filter((key) => !forbiddenKeys.includes(key));

  // Calculate the maximum number of buttons we can remove
  const maxRemovable = buttonsKeys.length - quantity;

  // Trim unrecommendedCopy and avoidCopy if they're too large
  if (unrecommendedCopy.length + avoidCopy.length > maxRemovable) {
    const totalToRemove = (unrecommendedCopy.length + avoidCopy.length) - maxRemovable;
    const unrecommendedToRemove = Math.min(unrecommendedCopy.length, totalToRemove);
    const avoidToRemove = Math.min(avoidCopy.length, totalToRemove - unrecommendedToRemove);

    unrecommendedCopy.splice(0, unrecommendedToRemove);
    avoidCopy.splice(0, avoidToRemove);
  }

  // Remove unrecommended buttons
  buttonsKeys = buttonsKeys.filter((key) => !unrecommendedCopy.includes(key));

  // Remove avoid buttons
  buttonsKeys = buttonsKeys.filter((key) => !avoidCopy.includes(key));

  // Shuffle the remaining keys
  buttonsKeys = _.shuffle(buttonsKeys);

  const randomButtons = [];
  for (let i = 0; i < quantity && i < buttonsKeys.length; i += 1) {
    randomButtons.push( BUTTONS[buttonsKeys[i]] );
  }
  return randomButtons;
}

const getButtons = async (conversation, message) => {
  const {
    isInitiate = false,
    isNewUser = false,
    isNewConversation = false,
    isLongTimeNoSee = false,
    questionId,
    responseId,
    userMessage,
    intent,
    error,
  } = message;
  if (isInitiate) {
    if (isNewUser || isNewConversation || isLongTimeNoSee) {
      return [BUTTONS.SUMMARY, BUTTONS.PDF_CV, BUTTONS.ALL_POSSIBILITIES];
    }
    // if initiate and not new user or conversation, re-send the previous message buttons
    const previousMessage = await conversation.findLastMessageNotEmpty(message._id);
    if (previousMessage) return previousMessage.buttons;
  }
  if (userMessage.content?.payload === PAYLOADS.CONTACT_SIMPLE) return [];
  if (intent?.displayName === INTENTS.Q_CONTACT_SIMPLE) return [];
  if (questionId === QUESTION_ID.Q_RESTART) return [];

  if (error?.name) {
    if (userMessage.type === USER_MESSAGE_TYPE.CONTACT_SIMPLE_SEND) {
      return [];
    }
  }

  const forbiddenKeys = _.chain(getButtonsIdFromQuestionId(message.questionId))
    .compact()
    .uniq()
    .value();

  // Find button keys to avoid, based on previous user questions
  const avoidKeys = _.chain(conversation.messages)
    .filter((msg) => msg.questionId)
    .flatMap((msg) => getButtonsIdFromQuestionId(msg.questionId))
    .compact()
    .uniq()
    .value();

  // Find unrecommended keys based on previously sent buttons
  const unrecommendedKeys = _.chain(conversation.messages)
    .flatMap((msg) => msg.buttons || [])
    // return for each item, the corresponding button key if it exists, or undefined
    .map((button) => getButtonsIdFromPayload(button.payload))
    .filter((key) => !avoidKeys.includes(key)) // remove avoid keys
    .compact()
    .uniq()
    .value();

  if (responseId === RESPONSE_ID.R_LLM) {
    return [
      BUTTONS.CONTACT_SIMPLE,
      BUTTONS.ALL_POSSIBILITIES,
      ...selectRandomButtons(1, {
        forbiddenKeys: [...forbiddenKeys, 'CONTACT_SIMPLE', 'ALL_POSSIBILITIES'],
        avoidKeys,
        unrecommendedKeys,
      }),
    ];
  }

  return selectRandomButtons(3, { forbiddenKeys, avoidKeys, unrecommendedKeys });
};



function translateButtons(buttons) {
  return buttons.map((button) => ({
    ...button,
    text: {
      fr: button?.text?.fr || i18next.t(`button:${button.text}`, { lng: 'fr' }),
      en: button?.text?.en || i18next.t(`button:${button.text}`, { lng: 'en' }),
    },
  }));
}

const findButtonsMiddleware = (socket, conversation) => (next) => async (message) => {
  const buttons = await getButtons(conversation, message);
  message.buttons = translateButtons(buttons);
  await next(message);
};

export default findButtonsMiddleware;
