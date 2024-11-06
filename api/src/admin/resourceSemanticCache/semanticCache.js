import BPromise from 'bluebird';
import { getNearestSemanticCache, updateSemanticCacheEmbedding } from '../../controllers/llmController/semanticCache.js';
import SemanticCacheModel from '../../models/semanticCache.js';
import { logInfo } from '../../utils/logger.js';
import { Components } from '../components.js';

const categoryStyle = {
  flexDirection: 'row', flexWrap: 'wrap', flex: true, borderBottom: '1px solid #e0e0e0', marginBottom: 40, paddingBottom: 20,
};

const SemanticCacheResource = {
  id: 'SemanticCache',
  resource: SemanticCacheModel,
  options: {
    navigation: {
      name: 'LLM',
      icon: 'Codesandbox',
    },
    sort: {
      sortBy: 'createdAt',
      direction: 'desc',
    },
    listProperties: [
      'question', 'responseExample', 'isVerified', 'shouldUseCache', 'createdAt', 'updatedAt',
    ],
    filterProperties: [
      '_id',
      'isVerified',
      'shouldUseCache',
      'question',
      'prompt',
      'responses',
      'model',
      'createdAt', 'updatedAt',
    ],
    editProperties: [
      'isVerified',
      'shouldUseCache',
      'question',
      'responses',
      'queries',
    ],
    actions: {
      new: {
        isAccessible: false,
        isVisible: false,
      },
      getNearest: {
        actionType: 'record',
        handler: async (request, response, context) => {
          // get nearest caches
          const { record, currentAdmin } = context;
          const { nearest, totalTokens } = await getNearestSemanticCache(record.params.question, 6);
          return {
            record: record.toJSON(currentAdmin),
            nearest: nearest.filter((item) => item._id.toString() !== record.params._id.toString()),
            totalTokens,
          };
        },
      },
      reEmbed: {
        actionType: 'resource',
        component: false,
        icon: 'Package', // https://feathericons.com/
        // eslint-disable-next-line max-len
        guard: 'Be careful this will re-embed all semanticCache ! And will cost some money (~0.13$ for 100 000 questions). Are you sure?',
        handler: async (request, response, context) => {
          // // re-embed all semanticCache
          const allSemanticCache = await SemanticCacheModel.find();
          logInfo({ withStdOut: true }, `Re-embedding ${allSemanticCache.length} semanticCache`);
          BPromise.map(
            allSemanticCache,
            async (item) => updateSemanticCacheEmbedding(item._id.toString(), item.question),
            { concurrency: 10 },
          ).then((result) => {
            const totalTokens = result.reduce((acc, item) => acc + item.totalTokens, 0);
            logInfo({ withStdOut: true }, `Re-embedding semanticCache done, totalTokens=${totalTokens}`);
          });
          return { success: true, msg: 'running' };
        },
      },
      edit: {
        before: [async (request, context) => {
          // update embedding if question is changed
          if (request.method === 'post') {
            const preSemanticCache = await SemanticCacheModel.findById(request.payload._id);
            if (preSemanticCache && preSemanticCache.question !== request.payload.question) {
              await updateSemanticCacheEmbedding(preSemanticCache._id.toString(), request.payload.question);
            }
          }
          return request;
        }],
      },
      show: {
        layout: [
          [{ flexDirection: 'row', flex: true }, [
            ['_id', { width: 1 / 3 }],
            ['createdAt', { width: 1 / 3 }],
            ['updatedAt', { width: 1 / 3 }],
          ]],
          [categoryStyle, [
            ['model', { width: 1 / 4 }],
            ['modelSize', { width: 1 / 4 }],
            ['isVerified', { width: 1 / 4 }],
            ['shouldUseCache', { width: 1 / 4 }],
          ]],
          [categoryStyle, [
            ['question', { width: 1 / 2 }],
            ['responses', { width: 1 / 2 }],
          ]],
          [
            ['@H4', { children: 'Prompt' }],
            [{ ...categoryStyle, flexDirection: 'column' }, [
              ['prompt'],
            ]],
          ],
          [
            ['@H4', { children: 'Queries' }],
            [{ ...categoryStyle, flexDirection: 'column' }, [
              ['queries'],
            ]],
          ],
          [
            ['@H4', { children: 'Debug Nearests' }],
            [{ ...categoryStyle, flexDirection: 'column' }, [
              ['nearests'],
            ]],
          ],
          [
            ['@H3', { children: 'JSON' }],
            ['jsonDocument'],
          ],
        ],
      },
    },
    properties: {
      _id: {
        isTitle: true,
      },
      'responses.response': {
        type: 'textarea',
      },
      responseExample: {
        type: 'string',
        components: {
          list: Components.SemanticCacheListResponseExample,
        },
      },
      prompt: {
        type: 'textarea',
      },
      nearests: {
        type: 'mixed',
        components: {
          show: Components.SemanticCacheNearest,
        },
      },
      jsonDocument: {
        type: 'mixed',
        components: {
          show: Components.JsonDocument,
        },
      },
    },
  },
};

export default SemanticCacheResource;
