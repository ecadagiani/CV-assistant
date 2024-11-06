import { reEmbedAllKnowledge, updateKnowledgeEmbedding } from '../../controllers/llmController/knowledge.js';
import KnowledgeModel from '../../models/knowledge.js';
import { logInfo } from '../../utils/logger.js';
import { Components } from '../components.js';

const categoryStyle = {
  flexDirection: 'row', flexWrap: 'wrap', flex: true, borderBottom: '1px solid #e0e0e0', marginBottom: 40, paddingBottom: 20,
};

const KnowledgeResource = {
  id: 'Knowledge',
  resource: KnowledgeModel,
  options: {
    navigation: {
      name: 'LLM',
      icon: 'Codesandbox',
    },
    sort: {
      sortBy: 'key',
      direction: 'asc',
    },
    listProperties: [
      'key', 'text', 'createdAt', 'updatedAt',
    ],
    filterProperties: [
      '_id', 'key', 'text', 'createdAt', 'updatedAt',
    ],
    editProperties: [
      'key', 'text',
    ],
    actions: {
      new: {
        after: [async (request, context) => {
          if (request?.notice?.type === 'success') {
            const totalTokens = await updateKnowledgeEmbedding(
              request.record.id,
              request.record.params.key,
              request.record.params.text,
            );
            logInfo({ withStdOut: true }, `New knowledge created, key=${request.record.params.key}, totalTokens=${totalTokens}`);
          }
          return request;
        }],
      },
      edit: {
        before: [async (request, context) => {
          if (request.method === 'post') {
            const preKnowledge = await KnowledgeModel.findById(request.payload._id);
            if (preKnowledge && (preKnowledge.key !== request.payload.key || preKnowledge.text !== request.payload.text)) {
              const totalTokens = await updateKnowledgeEmbedding(
                request.payload._id,
                request.payload.key,
                request.payload.text,
              );
              logInfo({ withStdOut: true }, `Knowledge updated, key=${request.payload.key}, totalTokens=${totalTokens}`);
            }
          }
          return request;
        }],
      },
      reEmbed: {
        actionType: 'resource',
        component: false,
        icon: 'Package', // https://feathericons.com/
        // eslint-disable-next-line max-len
        guard: 'Be careful this will re-embed all knowledge ! And will cost a little money. Are you sure?',
        handler: async (request, response, context) => {
          const knowledgesCount = await KnowledgeModel.countDocuments();
          logInfo({ withStdOut: true }, `Re-embedding ${knowledgesCount} knowledges`);
          reEmbedAllKnowledge().then((totalTokens) => {
            logInfo({ withStdOut: true }, `Re-embedding knowledges done, totalTokens=${totalTokens}`);
          });

          return { success: true, msg: 'running' };
        },
      },
      show: {
        layout: [
          [{ flexDirection: 'row', flex: true }, [
            ['_id', { width: 1 / 3 }],
            ['createdAt', { width: 1 / 3 }],
            ['updatedAt', { width: 1 / 3 }],
          ]],
          [categoryStyle, [
            ['key', { width: 1 }],
          ]],
          [categoryStyle, [
            ['text', { width: 1 }],
          ]],
          [
            ['@H3', { children: 'JSON' }],
            ['jsonDocument'],
          ],
        ],
      },
    },
    properties: {
      key: {
        isTitle: true,
      },
      text: {
        type: 'textarea',
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

export default KnowledgeResource;
