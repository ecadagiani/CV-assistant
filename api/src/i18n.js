import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

import { NODE_APP_PATH } from './config.js';

async function initI18n() {
  return i18next
    .use(Backend)
    .init({
      backend: {
        loadPath: `${NODE_APP_PATH}/resources/locales/{{lng}}/{{ns}}.json`,
      },
      ns: ['common', 'message', 'variables', 'button', 'timeline', 'skills', 'smalltalk'],
      lng: 'en',
      fallbackLng: 'en',
      preload: ['en', 'fr'],
      debug: false,
    });
}

export default initI18n;
