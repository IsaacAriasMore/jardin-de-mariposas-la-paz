'use strict';

const {
  buildPageMeta,
  buildLocalBusinessSchema,
  absoluteUrl,
  serializeJsonLd,
} = require('../utils/seo');
const { PAGE_DEFS, getPath } = require('../i18n/paths');

function pageHandler(key, locale) {
  return function renderPage(req, res) {
    const definition = PAGE_DEFS[key];
    const namespace = definition.contentNamespace || 'pages';
    const content = res.locals.t(`${namespace}:${key}`, { returnObjects: true });
    const meta = res.locals.t(`${namespace}:meta.${key}`, { returnObjects: true });
    const page = buildPageMeta({
      ...meta,
      path: getPath(key, locale),
      locale,
      alternatePaths: definition.paths,
    });
    const locals = { content, page, preloadHero: Boolean(definition.preloadHero) };

    if (definition.structuredData) {
      locals.schema = serializeJsonLd(
        buildLocalBusinessSchema({
          canonical: page.canonical,
          description: meta.description,
          image: absoluteUrl('/media/img/mariposario-bajo-la-paz-01-1280.jpg'),
        }),
      );
    }

    res.render(definition.view, locals);
  };
}

module.exports = {
  pageHandler,
  PAGE_DEFS,
};
