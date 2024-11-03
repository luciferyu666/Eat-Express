import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: 'Welcome',
          // 其他英文翻译
        },
      },
      zh: {
        translation: {
          welcome: '欢迎',
          // 其他中文翻译
        },
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
