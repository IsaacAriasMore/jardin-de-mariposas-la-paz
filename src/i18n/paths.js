'use strict';

const PAGE_DEFS = {
  home: { view: 'pages/home', paths: { es: '/', en: '/en' }, preloadHero: true },
  experience: {
    view: 'pages/experiencia',
    paths: { es: '/experiencia', en: '/en/tour' },
  },
  garden: {
    view: 'pages/nuestro-mariposario',
    paths: { es: '/nuestro-mariposario', en: '/en/our-butterfly-garden' },
  },
  butterflies: { view: 'pages/mariposas', paths: { es: '/mariposas', en: '/en/butterflies' } },
  gallery: { view: 'pages/galeria', paths: { es: '/galeria', en: '/en/gallery' } },
  environment: {
    view: 'pages/conservacion',
    paths: { es: '/conservacion', en: '/en/butterflies-and-their-environment' },
  },
  visit: {
    view: 'pages/visitanos',
    paths: { es: '/visitanos', en: '/en/visit-us' },
    structuredData: true,
  },
  privacy: {
    view: 'pages/legal-page',
    paths: { es: '/privacidad', en: '/en/privacy' },
    contentNamespace: 'legal',
  },
  terms: {
    view: 'pages/legal-page',
    paths: { es: '/terminos', en: '/en/terms' },
    contentNamespace: 'legal',
  },
  cookies: {
    view: 'pages/legal-page',
    paths: { es: '/cookies', en: '/en/cookies' },
    contentNamespace: 'legal',
  },
  imageRights: {
    view: 'pages/legal-page',
    paths: { es: '/derechos-imagen', en: '/en/image-rights' },
    contentNamespace: 'legal',
  },
};

const navigationPages = ['experience', 'garden', 'butterflies', 'gallery', 'visit'];
const footerPages = ['experience', 'garden', 'gallery', 'visit', 'environment'];
const legalPages = ['privacy', 'terms', 'cookies', 'imageRights'];

function getPath(page, locale) {
  return PAGE_DEFS[page]?.paths[locale] || PAGE_DEFS.home.paths.es;
}

function getPageByPath(path) {
  return Object.entries(PAGE_DEFS).find(([, definition]) =>
    Object.values(definition.paths).includes(path),
  );
}

function getLocaleFromPath(path) {
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'es';
}

function getAlternatePaths(page) {
  const definition = PAGE_DEFS[page];
  return definition ? definition.paths : PAGE_DEFS.home.paths;
}

module.exports = {
  PAGE_DEFS,
  navigationPages,
  footerPages,
  legalPages,
  getPath,
  getPageByPath,
  getLocaleFromPath,
  getAlternatePaths,
};
