'use strict';

const config = require('../config');
const business = require('../config/business');

// robots.txt: políticas de rastreo + referencia al sitemap.
function robots(req, res) {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: ${config.siteUrl}/sitemap.xml
`);
}

// sitemap.xml: todas las páginas públicas (derivadas de la navegación oficial).
function sitemap(req, res) {
  const urls = business.navigation
    .map((item) => `  <url>\n    <loc>${config.siteUrl}${item.href}</loc>\n  </url>`)
    .join('\n');

  res.type('application/xml');
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `${urls}\n` +
      `</urlset>\n`,
  );
}

module.exports = {
  robots,
  sitemap,
};
