import BanModel from '../../models/ban.js';

const BanResource = {
  resource: BanModel,
  options: {
    navigation: {
      name: 'Configuration',
      icon: 'Settings',
    },
    properties: {
      _id: {
        isVisible: {
          list: true, filter: true, show: true, edit: false,
        },
      },
      type: {
        isTitle: true,
        availableValues: [
          { value: 'IP', label: 'IP Address' },
          { value: 'IP_REGEX', label: 'IP Regex' },
          { value: 'COUNTRY', label: 'Country' },
        ],
      },
      value: {
        isTitle: true,
      },
      reason: {
        type: 'textarea',
      },
      active: {
        isVisible: {
          list: true, filter: true, show: true, edit: true,
        },
      },
      createdAt: {
        isVisible: {
          list: true, filter: true, show: true, edit: false,
        },
      },
      updatedAt: {
        isVisible: {
          list: true, filter: false, show: true, edit: false,
        },
      },
    },
    filterProperties: ['type', 'value', 'active', 'createdAt'],
    listProperties: ['type', 'value', 'active', 'createdAt'],
    showProperties: ['type', 'value', 'reason', 'active', 'createdAt', 'updatedAt'],
    editProperties: ['type', 'value', 'reason', 'active'],
    sort: {
      sortBy: 'createdAt',
      direction: 'desc',
    },
  },
};

export default BanResource;
