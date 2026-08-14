'use strict';

const path = require('node:path');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');

const supportedLngs = ['es', 'en'];

i18next.use(Backend).init({
  initAsync: false,
  fallbackLng: 'es',
  supportedLngs,
  preload: supportedLngs,
  ns: ['common', 'pages'],
  defaultNS: 'common',
  returnEmptyString: false,
  backend: {
    loadPath: path.join(__dirname, '..', 'locales', '{{lng}}', '{{ns}}.json'),
  },
});

function getTranslator(locale) {
  const language = supportedLngs.includes(locale) ? locale : 'es';
  return i18next.getFixedT(language);
}

module.exports = {
  supportedLngs,
  getTranslator,
};
