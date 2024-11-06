/* eslint-disable import/prefer-default-export */
import _ from 'lodash';
import { RESPONSE_ID } from '../../../resources/constants/responseId.js';
import { RESPONSE_TYPE, USER_MESSAGE_TYPE } from '../../constants.js';
import { sliceAddEllipsis } from '../../utils/string.js';
import { getSettings } from '../settingController.js';

export async function parsePreviousMessagesForLLM(conversation, message) {
  const previousMessages = await conversation.findPreviousMessagesNotEmpty(message._id);
  if (!previousMessages || previousMessages.length === 0) {
    return [];
  }
  const {
    USER_TEXT_MAX_LENGTH,
    LLM_PREVIOUS_MESSAGES_MAX,
    LLM_PREVIOUS_MESSAGES_SUMMARIZED,
    LLM_PREVIOUS_MESSAGE_SUMMARIZED_MAX_LENGTH,
    LLM_PREVIOUS_MESSAGE_MAX_LENGTH,
  } = await getSettings(
    'USER_TEXT_MAX_LENGTH',
    'LLM_PREVIOUS_MESSAGES_MAX',
    'LLM_PREVIOUS_MESSAGES_SUMMARIZED',
    'LLM_PREVIOUS_MESSAGE_SUMMARIZED_MAX_LENGTH',
    'LLM_PREVIOUS_MESSAGE_MAX_LENGTH',
  );
  return _.chain(previousMessages)
    .slice(previousMessages.length - LLM_PREVIOUS_MESSAGES_MAX, previousMessages.length) // retain only the last LLM_PREVIOUS_MESSAGES_MAX messages
    .map((previousMessage, index) => {
      const isMessageToSummarize = index < LLM_PREVIOUS_MESSAGES_SUMMARIZED;
      let userMessage = '';
      let assistantMessage = '';
      switch (previousMessage.userMessage.type) {
        case USER_MESSAGE_TYPE.INITIATE:
          userMessage = '--open_conversation--';
          break;
        case USER_MESSAGE_TYPE.DEFAULT:
          userMessage = previousMessage.userMessage.content.text;
          break;
        case USER_MESSAGE_TYPE.CONTACT_SIMPLE_SEND:
          userMessage = '--send_mail--'
            + `\n<body>${sliceAddEllipsis(previousMessage.userMessage.content.body || '', USER_TEXT_MAX_LENGTH)}</body>`;
          break;
        case USER_MESSAGE_TYPE.CONTACT_SIMPLE_CANCEL:
          userMessage = '--cancel_send_mail--';
          break;
        default:
          return null;
      }

      switch (previousMessage.responseId) {
        case RESPONSE_ID.R_LLM_TIMEOUT:
          return null;
        case RESPONSE_ID.R_ACHIEVEMENTS:
          assistantMessage = '<timeline_achievements/>';
          break;
        case RESPONSE_ID.R_EXPERIENCES:
        case RESPONSE_ID.R_TIMELINE:
          assistantMessage = '<timeline_all/>';
          break;
        case RESPONSE_ID.R_REWARDS:
          assistantMessage = '<timeline_rewards/>';
          break;
        case RESPONSE_ID.R_DEGREE:
          assistantMessage = '<timeline_degree/>';
          break;
        case RESPONSE_ID.R_EXPERIENCE_FREELANCE:
          assistantMessage = '<timeline_freelance/>';
          break;
        case RESPONSE_ID.R_PORTFOLIO:
          assistantMessage = '<timeline_portfolio/>';
          break;
        case RESPONSE_ID.R_SKILLS:
          assistantMessage = '<skills_tree/>';
          break;
        case RESPONSE_ID.R_PRIVACY_POLICY:
          assistantMessage = '<privacy_policy/>';
          break;
        case RESPONSE_ID.R_TERM_OF_USE:
          assistantMessage = '<term_of_use/>';
          break;
        default: {
          const parsedResponses = previousMessage.responses.map((response) => {
            switch (response.type) {
              case RESPONSE_TYPE.TEXT_RESPONSE: {
                let text = response.content;
                if (typeof response.content === 'object' && typeof response.content[message.language] === 'string') {
                  text = response.content[message.language];
                }
                if (isMessageToSummarize) return sliceAddEllipsis(text || '', LLM_PREVIOUS_MESSAGE_SUMMARIZED_MAX_LENGTH);
                return sliceAddEllipsis(text || '', LLM_PREVIOUS_MESSAGE_MAX_LENGTH);
              }
              case RESPONSE_TYPE.LLM_RESPONSE:
                if (isMessageToSummarize) {
                  return sliceAddEllipsis(response.content.text || '', LLM_PREVIOUS_MESSAGE_SUMMARIZED_MAX_LENGTH);
                }
                return sliceAddEllipsis(response.content.text || '', LLM_PREVIOUS_MESSAGE_MAX_LENGTH);
              case RESPONSE_TYPE.TEXT_WITH_IMAGE:
                if (isMessageToSummarize) {
                  return sliceAddEllipsis(response.content.text || '', LLM_PREVIOUS_MESSAGE_SUMMARIZED_MAX_LENGTH);
                }
                return sliceAddEllipsis(response.content.text || '', LLM_PREVIOUS_MESSAGE_MAX_LENGTH);
              case RESPONSE_TYPE.EVENT:
                if (isMessageToSummarize) return `<event(${response.content.title})/>`;
                return `<event(${response.content.title})>${
                  sliceAddEllipsis(response.content.text || '', LLM_PREVIOUS_MESSAGE_MAX_LENGTH)
                }</event>`;
              default:
                return 'unsuported';
            }
          });
          if (parsedResponses.includes('unsuported')) {
            return null;
          }
          assistantMessage = parsedResponses.join('\n');
          break;
        }
      }

      return {
        user: userMessage,
        assistant: assistantMessage,
      };
    }).compact()
    .value();
}
