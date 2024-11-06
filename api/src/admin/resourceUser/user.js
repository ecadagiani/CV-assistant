import { FRONT_URL } from '../../config.js';
import UserModel from '../../models/user.js';
import { Components } from '../components.js';
import { bulkDeleteAdminJSHandler, deleteAdminJSHandler } from '../utils/actionHandler.js';

const categoryStyle = {
  flexDirection: 'row', flexWrap: 'wrap', flex: true, borderBottom: '1px solid #e0e0e0', marginBottom: 40, paddingBottom: 20,
};

const UserResource = {
  id: 'User',
  resource: UserModel,
  options: {
    sort: {
      sortBy: 'updatedAt',
      direction: 'desc',
    },
    listProperties: [
      '_id', 'conversations', 'createdAt', 'updatedAt',
    ],
    actions: {
      show: {
        layout: [
          [{ flexDirection: 'row', flex: true }, [
            ['_id', { width: 1 / 2 }],
            ['chatLinkUser', { width: 1 / 2 }],
          ]],
          [{ flexDirection: 'row', flex: true }, [
            ['createdAt', { width: 1 / 2 }],
            ['updatedAt', { width: 1 / 2 }],
          ]],
          [
            ['@H4', { children: 'Conversations' }],
            [categoryStyle, [
              'conversations',
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
        handler: bulkDeleteAdminJSHandler(async (recordId, context) => UserModel.findOneAndDelete({ _id: recordId })),
      },
      delete: {
        actionType: 'record',
        handler: deleteAdminJSHandler(async (recordId, context) => UserModel.findOneAndDelete({ _id: recordId })),
      },
    },
    properties: {
      _id: {
        // if we not set this, it will display conversations[0]._id instead for user title (example: in message list)
        isTitle: true,
      },
      chatLinkUser: {
        type: 'uuid',
        components: {
          show: Components.ChatLink,
        },
        props: {
          frontUrl: FRONT_URL,
          idKey: '_id',
          queryKey: 'userId',
        },
      },
      conversations: {
        type: 'reference',
        components: {
          show: Components.ConversationList,
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

export default UserResource;
