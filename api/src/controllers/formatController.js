import i18next from 'i18next';
import _ from 'lodash';
import { PAYLOADS } from '../../resources/constants/payloads.js';
import { INPUT_TYPE, RESPONSE_TYPE } from '../constants.js';

export const getMessageId = (message, index) => `${message._id}_response${index}`;

// format one bot response
export const formatResponseToFront = (message) => (response, index) => ({
  id: getMessageId(message, index),
  type: response.type,
  content: response.content,
  date: message.createdAt,
  isUser: false,
  noScroll: response.noScroll,
  noDelay: response.noDelay,
});

// format one bot response to front, but add input and buttons
export const formatModelMessageToFront = (message) => ({
  language: message.language,
  input: message.input,
  buttons: message.buttons,
  responses: message.responses.map(formatResponseToFront(message)),
});
// format all messages from one conversation to front, with user messages and bot responses
export const formatConversationToFront = (conversation) => {
  const messages = _.sortBy(conversation.messages, 'createdAt');
  const formattedMessages = _.flatMap(messages, (message) => [
    { // user message
      id: `${message._id}_user_message`,
      type: RESPONSE_TYPE.USER_MESSAGE,
      content: message.userMessage,
      date: message.createdAt,
      isUser: true,
    },
    // bot responses
    ...message.responses.map(formatResponseToFront(message)),
  ]);
  // get the last message with bot responses to find buttons and input
  const lastServerResponse = _.last(messages.filter(({ responses }) => responses.length > 0));
  return {
    responses: formattedMessages,
    buttons: lastServerResponse?.buttons || [],
    input: lastServerResponse?.input || null,
  };
};

export const formatErrorResponseToFront = ({
  text, input, buttons, language,
} = {}) => ({
  responses: [{
    id: `error_${crypto.randomUUID()}`,
    type: RESPONSE_TYPE.TEXT_RESPONSE,
    content: i18next.t(text || 'message:error', { lng: language }),
    date: (new Date()).toISOString(),
  }],
  input: input || { type: INPUT_TYPE.DEFAULT, data: {} },
  buttons: buttons || ([{
    text: {
      en: i18next.t('button:who_is_eden', { lng: 'en' }),
      fr: i18next.t('button:who_is_eden', { lng: 'fr' }),
    },
    payload: PAYLOADS.WHO_IS_EDEN,
  }, {
    text: {
      en: i18next.t('button:experience', { lng: 'en' }),
      fr: i18next.t('button:experience', { lng: 'fr' }),
    },
    payload: PAYLOADS.EXPERIENCE,
  }, {
    text: {
      en: i18next.t('button:skills', { lng: 'en' }),
      fr: i18next.t('button:skills', { lng: 'fr' }),
    },
    payload: PAYLOADS.SKILLS,
  }]),
});

/**
 * Formats the waiting message to be sent to the front-end.
 *
 * @param {Array<{content: string, type: string}>} responses - The array of response objects.
 * @returns {Object} The formatted waiting message object.
 */
export const formatWaitingMessageToFront = (responses) => ({
  keepWaiting: true,
  responses: responses.map((r) => ({
    ...r,
    id: `waiting_${crypto.randomUUID()}`,
    date: (new Date()).toISOString(),
  })),
});
