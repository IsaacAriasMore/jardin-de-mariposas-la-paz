'use strict';

const config = require('../config');
const business = require('../config/business');

// URL absoluta basada en SITE_URL (desacoplada del dominio definitivo).
function absoluteUrl(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${config.siteUrl}${clean}`;
}

// Construye el objeto de metadata SEO por página (title, description,
// canonical, Open Graph). Las vistas lo consumen vía el partial head.
function buildPageMeta({ title, description, path = '/', ogImage = null, noindex = false }) {
  const canonical = absoluteUrl(path);
  const fullTitle = `${title} · ${business.name}`;

  return {
    title: fullTitle,
    description,
    canonical,
    robots: noindex ? 'noindex, follow' : 'index, follow',
    og: {
      type: 'website',
      locale: 'es_CR',
      siteName: business.name,
      title: fullTitle,
      description,
      url: canonical,
      ...(ogImage ? { image: absoluteUrl(ogImage) } : {}),
    },
  };
}

module.exports = {
  absoluteUrl,
  buildPageMeta,
};
