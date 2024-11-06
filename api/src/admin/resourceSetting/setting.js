import SettingModel from '../../models/setting.js';
import { Components } from '../components.js';

const categoryStyle = {
  flexDirection: 'row', flexWrap: 'wrap', flex: true, borderBottom: '1px solid #e0e0e0', marginBottom: 40, paddingBottom: 20,
};

function parseValue(value) {
  let parsedValue = value;
  try {
    parsedValue = JSON.parse(value);
  } catch (e) {
    if (!Number.isNaN(Number(value))) {
      parsedValue = Number(value);
    } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      parsedValue = (value.toLowerCase() === 'true');
    }
  }
  return parsedValue;
}

const SettingResource = {
  resource: SettingModel,
  options: {
    id: 'Settings',
    navigation: {
      name: 'Configuration',
      icon: 'Settings',
    },
    sort: {
      sortBy: 'key',
      direction: 'asc',
    },
    listProperties: [
      'key', 'value', 'description',
    ],
    properties: {
      key: {
        isTitle: true,
      },
      description: {
        type: 'textarea',
      },
      value: {
        components: {
          list: Components.JsonProperties,
          show: Components.JsonProperties,
          edit: Components.MixedPropertiesEdit,
          new: Components.MixedPropertiesEdit,
        },
      },
      jsonDocument: {
        type: 'mixed',
        components: {
          show: Components.JsonDocument,
        },
      },
    },
    actions: {
      show: {
        layout: [
          [{ flexDirection: 'row', flex: true }, [
            ['key', { width: 1 / 2 }],
            ['_id', { width: 1 / 2 }],
          ]],
          [{ flexDirection: 'row', flex: true }, [
            ['createdAt', { width: 1 / 2 }],
            ['updatedAt', { width: 1 / 2 }],
          ]],
          [categoryStyle, [
            ['description', { width: 1 }],
          ]],
          [categoryStyle, [
            ['value', { width: 1 }],
          ]],
          [
            ['@H3', { children: 'JSON' }],
            ['jsonDocument'],
          ],
        ],
      },
      edit: {
        layout: [
          [{ flexDirection: 'row', flex: true }, [
            ['key', { width: 1 / 2 }],
            ['description', { width: 1 / 2 }],
          ]],
          [categoryStyle, [
            ['value', { width: 1 }],
          ]],
        ],
        before: async (request, context) => {
          if (request.method !== 'post') {
            return request;
          }
          // check type of request.payload.value and request.fields.value
          const parsedValue = parseValue(request.payload.value);
          request.payload.value = parsedValue;
          request.fields.value = parsedValue;
          return request;
        },
      },
      new: {
        layout: [
          [{ flexDirection: 'row', flex: true }, [
            ['key', { width: 1 / 2 }],
            ['description', { width: 1 / 2 }],
          ]],
          [categoryStyle, [
            ['value', { width: 1 }],
          ]],
        ],
        before: async (request, context) => {
          if (request.method !== 'post') {
            return request;
          }
          // check type of request.payload.value and request.fields.value
          const parsedValue = parseValue(request.payload.value);
          request.payload.value = parsedValue;
          request.fields.value = parsedValue;
          return request;
        },
      },
    },
  },
};

export default SettingResource;
