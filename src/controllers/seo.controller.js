'use strict';

const config = require('../config');

// robots.txt: políticas de rastreo + referencia al sitemap.
function robots(req, res) {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: ${config.siteUrl}/sitemap.xml
`);
}

// Páginas públicas indexables (espejo de routes/index.js). Independientes de
// la navegación visible: "/" no está en el menú pero sí indexa.
// NOTA: "/guias" está excluido a propósito: reservada para el futuro, no se
// indexa hasta tener artículos reales (evita thin content en el sitemap).
const PUBLIC_ROUTES = [
  '/',
  '/nuestro-mariposario',
  '/mariposas',
  '/experiencia',
  '/conservacion',
  '/galeria',
  '/visitanos',
];

// sitemap.xml: todas las páginas públicas.
function sitemap(req, res) {
  const urls = PUBLIC_ROUTES.map(
    (href) => `  <url>\n    <loc>${config.siteUrl}${href}</loc>\n  </url>`,
  ).join('\n');

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
