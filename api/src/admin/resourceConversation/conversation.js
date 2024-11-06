import { FRONT_URL } from '../../config.js';
import ConversationModel from '../../models/conversation.js';
import { Components } from '../components.js';
import { bulkDeleteAdminJSHandler, deleteAdminJSHandler } from '../utils/actionHandler.js';

const categoryStyle = {
  flexDirection: 'row', flexWrap: 'wrap', flex: true, borderBottom: '1px solid #e0e0e0', marginBottom: 40, paddingBottom: 20,
};

const ConversationResource = {
  id: 'Conversation',
  resource: ConversationModel,
  options: {
    sort: {
      sortBy: 'updatedAt',
      direction: 'desc',
    },
    listProperties: [
      'user', 'language', 'origin', 'ip.country', 'messages',
      'createdAt', 'updatedAt',
    ],
    actions: {
      show: {
        layout: [
          [{ flexDirection: 'row', flex: true }, [
            ['user', { width: 1 / 2 }],
            ['chatLinkUser', { width: 1 / 2 }],
          ]],
          [{ flexDirection: 'row', flex: true }, [
            ['_id', { width: 1 / 3 }],
            ['createdAt', { width: 1 / 3 }],
            ['updatedAt', { width: 1 / 3 }],
          ]],
          [categoryStyle, [
            ['language', { width: 1 / 3 }],
            ['origin', { width: 1 / 3 }],
            ['userAgent', { width: 1 / 3 }],
          ]],
          [categoryStyle, [
            ['ip.address', { width: 1 / 2 }],
            ['ip.country', { width: 1 / 2 }],
            ['ip.region', { width: 1 / 2 }],
            ['ip.city', { width: 1 / 2 }],
          ]],
          [
            ['@H4', { children: 'Messages' }],
            [categoryStyle, [
              'messages',
            ]],
          ],
          [
            ['@H3', { children: 'JSON' }],
            ['jsonDocument'],
          ],
        ],
      },
      bulkDelete: {
        actionType: 'bulk',
        handler: bulkDeleteAdminJSHandler(async (recordId, context) => ConversationModel.findOneAndDelete({ _id: recordId })),
      },
      delete: {
        actionType: 'record',
        handler: deleteAdminJSHandler(async (recordId, context) => ConversationModel.findOneAndDelete({ _id: recordId })),
      },
    },
    properties: {

      // 'string' | 'float' | 'number' | 'boolean' | 'date' | 'datetime' | 'mixed' |
      // 'reference' | 'key-value' | 'richtext' | 'textarea' | 'password' | 'currency' | 'phone' | 'uuid';
      _id: {
        isTitle: true,
        // if we not set this, it will display user._id instead for conversation title (example: in message list)
      },
      user: {
        isTitle: false,
      },
      chatLinkUser: {
        type: 'uuid',
        components: {
          show: Components.ChatLink,
        },
        props: {
          frontUrl: FRONT_URL,
          idKey: 'user',
          queryKey: 'userId',
        },
      },
      messages: {
        type: 'reference',
        components: {
          show: Components.MessagesList,
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

export default ConversationResource;
