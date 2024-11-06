import AdminJSExpress from '@adminjs/express';
// eslint-disable-next-line import/no-unresolved
import * as AdminJSMongoose from '@adminjs/mongoose';
import AdminJS from 'adminjs';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import {
  ADMIN_PASSWORD, ADMIN_ROOT_PATH, ADMIN_USER,
  API_URL,
  IS_PRODUCTION,
} from '../config.js';
import { getStats } from '../controllers/dbController/stats.js';
import { logError } from '../utils/logger.js';
import { genRandomString } from '../utils/string.js';
import { Components, componentLoader } from './components.js';
import BanResource from './resourceBan/ban.js';
import ConversationResource from './resourceConversation/conversation.js';
import KnowledgeResource from './resourceKnowledge/knowledge.js';
import llmLimiterResource from './resourceLlmLimiter/llmLimiter.js';
import MessageResource from './resourceMessage/message.js';
import SemanticCacheResource from './resourceSemanticCache/semanticCache.js';
import SettingResource from './resourceSetting/setting.js';
import UserResource from './resourceUser/user.js';

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const authenticate = async (email, password) => {
  const DEFAULT_ADMIN = {
    email: ADMIN_USER,
    password: ADMIN_PASSWORD,
  };
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

export function startAdminJS() {
  const sessionStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: 'sessionAdminJS',
    stringify: false,
    autoRemove: 'interval',
    autoRemoveInterval: 1,
  });

  const sessionSecret = genRandomString(20);

  const adminJS = new AdminJS({
    rootPath: ADMIN_ROOT_PATH,
    loginPath: `${ADMIN_ROOT_PATH}/login`,
    logoutPath: `${ADMIN_ROOT_PATH}/logout`,
    componentLoader,
    resources: [
      UserResource,
      ConversationResource,
      MessageResource,
      SemanticCacheResource,
      llmLimiterResource,
      BanResource,
      SettingResource,
      KnowledgeResource,
    ],
    // in production, we use bin/bundle-admin.js to bundle the adminjs assets, and serve them from the API
    assetsCDN: IS_PRODUCTION ? `${API_URL}${ADMIN_ROOT_PATH}-bundle/` : undefined,
    assets: {
      styles: [
        `${ADMIN_ROOT_PATH}-static/messageView.css`,
        `${ADMIN_ROOT_PATH}-static/conversationView.css`,
        `${ADMIN_ROOT_PATH}-static/semanticCacheView.css`,
        `${ADMIN_ROOT_PATH}-static/userView.css`,
        `${ADMIN_ROOT_PATH}-static/reactJsonViewLite.css`,
      ],
    },
    dashboard: {
      component: Components.Dashboard,
      handler: async () => {
        try {
          return await getStats();
        } catch (e) {
          logError({}, 'Error getting stats for admin dashboard:', e);
          return null;
        }
      },
    },
  });

  if (IS_PRODUCTION) {
    // in production, we bundle adminjs assets in image creation
    adminJS.initialize();
  } else {
    adminJS.watch();
  }

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJS,
    {
      authenticate,
      cookieName: 'adminjs',
      cookiePassword: sessionSecret,
    },
    null,
    {
      name: 'adminjs',
      store: sessionStore,
      secret: sessionSecret,
      resave: true,
      saveUninitialized: true,
      cookie: {
        httpOnly: IS_PRODUCTION,
        secure: IS_PRODUCTION,
      },
    },
  );

  return {
    adminJS,
    adminRouter,
  };
}

export default startAdminJS;
