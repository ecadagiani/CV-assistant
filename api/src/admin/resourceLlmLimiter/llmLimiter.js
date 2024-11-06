import LlmLimiterModel from '../../models/llmLimiter.js';
import { Components } from '../components.js';

const categoryStyle = {
  flexDirection: 'row', flexWrap: 'wrap', flex: true, borderBottom: '1px solid #e0e0e0', marginBottom: 40, paddingBottom: 20,
};

const llmLimiterResource = {
  id: 'llmLimiterResource',
  resource: LlmLimiterModel,
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
      '_id', 'user', 'ipAddress', 'largeModelCount', 'slimModelCount',
      'largeModelLimit', 'slimModelLimit', 'createdAt', 'updatedAt',
    ],
    filterProperties: [
      '_id', 'user', 'ipAddress', 'largeModelCount', 'slimModelCount',
      'largeModelLimit', 'slimModelLimit', 'createdAt', 'updatedAt',
    ],
    editProperties: [
      'largeModelCount',
      'slimModelCount',
      'largeModelLimit',
      'slimModelLimit',
    ],
    actions: {
      show: {
        layout: [
          [{ flexDirection: 'row', flex: true }, [
            ['_id', { width: 1 / 3 }],
            ['createdAt', { width: 1 / 3 }],
            ['updatedAt', { width: 1 / 3 }],
          ]],
          [categoryStyle, [
            ['user', { width: 1 / 2 }],
            ['ipAddress', { width: 1 / 2 }],
          ]],
          [categoryStyle, [
            ['largeModelCount', { width: 1 / 2 }],
            ['slimModelCount', { width: 1 / 2 }],
            ['largeModelLimit', { width: 1 / 2 }],
            ['slimModelLimit', { width: 1 / 2 }],
          ]],
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
      jsonDocument: {
        type: 'mixed',
        components: {
          show: Components.JsonDocument,
        },
      },
    },
  },
};

export default llmLimiterResource;
