import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './en';
import fr from './fr';

i18n
  .use(LanguageDetector) // detect user language: https://github.com/i18next/i18next-browser-languageDetector
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en, fr,
    },
    ns: ['common', 'userMessage'],
    defaultNS: 'common',
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

i18n.services.formatter.add('blockquote', (value, lng, options) => {
  // replace all "\n" with "\n > " to make the blockquote
  const newValue = value.replace(/\n/g, '\n> ');
  return newValue;
});

export default i18n;
