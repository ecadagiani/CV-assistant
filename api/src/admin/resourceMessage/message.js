import { INTENTS } from '../../../resources/constants/intents.js';
import { PAYLOADS } from '../../../resources/constants/payloads.js';
import { QUESTION_ID } from '../../../resources/constants/questionId.js';
import { RESPONSE_ID } from '../../../resources/constants/responseId.js';
import { FRONT_URL } from '../../config.js';
import { INPUT_TYPE, USER_MESSAGE_TYPE } from '../../constants.js';
import MessageModel from '../../models/message.js';
import { Components } from '../components.js';

const categoryStyle = {
  flexDirection: 'row', flexWrap: 'wrap', flex: true, borderBottom: '1px solid #e0e0e0', marginBottom: 40, paddingBottom: 20,
};

const MessageResource = {
  id: 'Message',
  resource: MessageModel,
  options: {
    sort: {
      sortBy: 'createdAt',
      direction: 'desc',
    },
    listProperties: [
      'conversation', 'userMessage.content.text', 'userMessage.content.payload',
      'intent.displayName', 'questionId', 'responseId',
      'createdAt', 'updatedAt',
    ],
    filterProperties: [
      'isFreeText_forFilter',
      'llm_forFilter',
      'isError_forFilter',
      'isFallback_forFilter',
      'isContact_forFilter',
      '_id', 'conversation', 'questionId', 'responseId',
      'intent.displayName',
      'isInitiate', 'isNewUser', 'isNewConversation', 'isLongTimeNoSee',
      'language', 'detectedLanguage', 'isDifferentLanguage', 'isSupportedLanguage',
      'userMessage.type', 'userMessage.language', 'userMessage.content.payload',
      'input.type',
      'semanticCache', 'model',
      'createdAt', 'updatedAt',
    ],
    actions: {
      show: {
        layout: [
          [{ flexDirection: 'row', flex: true }, [
            ['conversation', { width: 1 / 2 }],
            ['chatLinkConversation', { width: 1 / 2 }],
          ]],
          [{ flexDirection: 'row', flex: true }, [
            ['_id', { width: 1 / 3 }],
            ['createdAt', { width: 1 / 3 }],
            ['updatedAt', { width: 1 / 3 }],
          ]],
          [categoryStyle, [
            ['questionId', { width: 1 / 2 }],
            ['responseId', { width: 1 / 2 }],
          ]],
          [categoryStyle, [
            ['receivedAt', { width: 1 / 2 }],
            ['repliedAt', { width: 1 / 2 }],
          ]],
          [categoryStyle, [
            ['userMessage.type', { width: 1 / 2 }],
            ['userMessage.language', { width: 1 / 2 }],
            ['userMessage.content.payload', { width: 1 / 2 }],
            ['userMessage.content.text', { width: 1 / 2 }],
            ['userMessage.content', { width: 1 }],
          ]],
          [
            ['@H4', { children: 'NLU' }],
            [categoryStyle, [
              ['intent.displayName', { width: 1 / 2 }],
              ['intent.isFallback', { width: 1 / 2 }],
              ['parameters', { width: 1 }],
            ]],
          ],
          [
            ['@H4', { children: 'LLM' }],
            [categoryStyle, [
              ['semanticCache', { width: 1 / 3 }],
              ['semanticCacheCreated', { width: 1 / 3 }],
              ['generated', { width: 1 / 3 }],
              ['model', { width: 1 / 4 }],
              ['modelSize', { width: 1 / 4 }],
              ['tokens', { width: 2 / 4 }],
            ]],
          ],
          [
            ['@H4', { children: 'Language' }],
            [categoryStyle, [
              ['language', { width: 1 / 4 }],
              ['detectedLanguage', { width: 1 / 4 }],
              ['isDifferentLanguage', { width: 1 / 4 }],
              ['isSupportedLanguage', { width: 1 / 4 }],
            ]],
          ],
          [
            ['@H4', { children: 'Init booleans' }],
            [categoryStyle, [
              ['isInitiate', { width: 1 / 4 }],
              ['isNewUser', { width: 1 / 4 }],
              ['isNewConversation', { width: 1 / 4 }],
              ['isLongTimeNoSee', { width: 1 / 4 }],
            ]],
          ],
          [
            ['@H4', { children: 'Error' }],
            [categoryStyle, [
              ['error.name', { width: 1 / 3 }],
              ['error.message', { width: 1 / 3 }],
              ['error.stack', { width: 1 / 3 }],
            ]],
          ],
          [
            ['@H4', { children: 'Response' }],
            [{ ...categoryStyle, flexDirection: 'column' }, [
              ['responses'],
              ['buttons'],
              [
                { flexDirection: 'row', flex: true, flexWrap: 'wrap' }, [
                  ['input.type', { width: 1 / 3 }],
                  ['input.data', { width: 2 / 3 }],
                ],
              ],
            ]],
          ],
          [
            ['@H3', { children: 'JSON' }],
            ['jsonDocument'],
          ],
        ],
      },
      list: {
        before: (request, context) => {
          const { query = {} } = request;
          if (query['filters.isError_forFilter'] === 'true') {
            delete query['filters.isError_forFilter'];
            query['filters.responseId'] = RESPONSE_ID.R_ERROR;
          }

          if (query['filters.isFallback_forFilter'] === 'true') {
            query['filters.responseId'] = RESPONSE_ID.R_FALLBACK;
            delete query['filters.isFallback_forFilter'];
          }

          // all message when message is sent
          if (query['filters.isContact_forFilter'] === 'true') {
            query['filters.responseId'] = RESPONSE_ID.R_SEND_CONTACT_SIMPLE;
            delete query['filters.isContact_forFilter'];
          }

          // all message without payload
          if (query['filters.isFreeText_forFilter'] === 'true') {
            query['filters.intent.displayName'] = '';
            delete query['filters.isFreeText_forFilter'];
          }

          // message answer by LLM
          if (query['filters.llm_forFilter']) {
            switch (query['filters.llm_forFilter']) {
              case 'generated':
                query['filters.responseId'] = RESPONSE_ID.R_LLM;
                query['filters.generated'] = 'true';
                break;
              case 'cached':
                query['filters.responseId'] = RESPONSE_ID.R_LLM;
                query['filters.generated'] = 'false';
                query['filters.semanticCacheCreated'] = 'false';
                break;
              case 'timeout':
                query['filters.responseId'] = RESPONSE_ID.R_LLM_TIMEOUT;
                break;
              default:
            }
            delete query['filters.llm_forFilter'];
          }
          request.query = query;
          return request;
        },
      },
    },
    properties: {
      // 'string' | 'float' | 'number' | 'boolean' | 'date' | 'datetime' | 'mixed' | 'reference' | 'key-value' | 'richtext' | 'textarea' | 'password' | 'currency' | 'phone' | 'uuid';
      _id: {
        isTitle: true,
      },
      conversation: {
        isTitle: false,
      },
      chatLinkConversation: {
        type: 'uuid',
        components: {
          show: Components.ChatLink,
        },
        props: {
          frontUrl: FRONT_URL,
          idKey: 'conversation',
          queryKey: 'conversationId',
        },
      },
      tokens: {
        // type: 'mixed',
        type: 'key-value',
      },
      parameters: {
        type: 'mixed',
        components: {
          show: Components.JsonProperties,
        },
      },
      responses: {
        type: 'mixed',
        components: {
          show: Components.JsonProperties,
        },
      },
      buttons: {
        type: 'mixed',
        components: {
          show: Components.JsonProperties,
        },
      },
      'input.data': {
        type: 'mixed',
        components: {
          show: Components.JsonProperties,
        },
      },
      'userMessage.content': {
        type: 'mixed',
        components: {
          show: Components.JsonProperties,
        },
      },
      jsonDocument: {
        type: 'mixed',
        components: {
          show: Components.JsonDocument,
        },
      },
      questionId: {
        availableValues: Object.values(QUESTION_ID).map((questionId) => ({ value: questionId, label: questionId })),
      },
      responseId: {
        availableValues: Object.values(RESPONSE_ID).map((responseId) => ({ value: responseId, label: responseId })),
      },
      'userMessage.content.payload': {
        availableValues: Object.values(PAYLOADS).map((payload) => ({ value: payload, label: payload })),
      },
      'intent.displayName': {
        availableValues: Object.values(INTENTS).map((intent) => ({ value: intent, label: intent })),
      },
      'intent.isFallback': {
        type: 'boolean',
      },
      'userMessage.type': {
        availableValues: Object.values(USER_MESSAGE_TYPE).map((type) => ({ value: type, label: type })),
      },
      'input.type': {
        availableValues: Object.values(INPUT_TYPE).map((type) => ({ value: type, label: type })),
      },
      isError_forFilter: {
        type: 'boolean',
      },
      isFallback_forFilter: { // because intent.isFallback, have a front error, the select cannot remember the value
        type: 'boolean',
      },
      isContact_forFilter: {
        type: 'boolean',
      },
      isFreeText_forFilter: {
        type: 'boolean',
      },
      llm_forFilter: {
        type: 'string',
        availableValues: [
          { value: 'generated', label: 'Generated' },
          { value: 'cached', label: 'Cached' },
          { value: 'timeout', label: 'Timeout' },
        ],
      },
    },
    translations: {
      en: {
        properties: {
          conversation: 'Conversation',
          'userMessage.content.text': 'User message',
          'userMessage.content.payload': 'Payload',
          'intent.displayName': 'Intent',
          questionId: 'Question ID',
          responseId: 'Response ID',
          'input.data': 'Input data',
          isError_forFilter: 'Is error',
          isFallback_forFilter: 'Is fallback',
          isContact_forFilter: 'Is contact',
          isFreeText_forFilter: 'Is free text',
          llm_forFilter: 'LLM',
        },
      },
    },
  },
};

export default MessageResource;
