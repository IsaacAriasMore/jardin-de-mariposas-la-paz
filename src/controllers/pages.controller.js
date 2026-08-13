'use strict';

const { buildPageMeta, buildLocalBusinessSchema, absoluteUrl } = require('../utils/seo');

// Definición de páginas informativas: metadata SEO + vista asociada.
// Agregar una página nueva = agregar una entrada aquí + su ruta en routes/.
const PAGE_DEFS = [
  {
    key: 'home',
    view: 'pages/home',
    path: '/',
    title: 'Inicio',
    description:
      'Jardín de Mariposas La Paz: un mariposario rural en Bajo La Paz, San Ramón, Alajuela, Costa Rica, para observar mariposas y flores tropicales en plena naturaleza.',
    extra: { preloadHero: true },
  },
  {
    key: 'nuestroMariposario',
    view: 'pages/nuestro-mariposario',
    path: '/nuestro-mariposario',
    title: 'Nuestro Mariposario',
    description:
      'Conozca el mariposario en Bajo La Paz, San Ramón: un espacio dedicado a la observación de mariposas, la naturaleza y su conservación.',
  },
  {
    key: 'mariposas',
    view: 'pages/mariposas',
    path: '/mariposas',
    title: 'Mariposas',
    description:
      'Mariposas y flores tropicales en el Jardín de Mariposas La Paz, Bajo La Paz, San Ramón, Alajuela, Costa Rica: un recorrido fotográfico para observar la naturaleza de cerca.',
  },
  {
    key: 'experiencia',
    view: 'pages/experiencia',
    path: '/experiencia',
    title: 'Experiencia',
    description:
      'Una visita al Jardín de Mariposas La Paz en Bajo La Paz, San Ramón: observe mariposas y flores tropicales de cerca y disfrute el entorno natural a su propio ritmo.',
  },
  {
    key: 'conservacion',
    view: 'pages/conservacion',
    path: '/conservacion',
    title: 'Conservación',
    description:
      'Conservación de mariposas y biodiversidad en el Jardín de Mariposas La Paz, Bajo La Paz, San Ramón, Alajuela, Costa Rica: hábitats, flores y naturaleza.',
  },
  {
    key: 'galeria',
    view: 'pages/galeria',
    path: '/galeria',
    title: 'Galería',
    description:
      'Galería del Jardín de Mariposas La Paz, mariposario en Bajo La Paz, San Ramón, Alajuela, Costa Rica: el mariposario y fotografía de mariposas y naturaleza.',
  },
  // FUTURO (reservado, NO publicar): Guías de visita.
  //   key: 'guias'    view: 'pages/guias'   path: '/guias'
  //   Detalle: /guias/:slug (artículos reales cuando existan; sin filler).
  // Retirado temporalmente por thin content: /guias responde 404 hasta que
  // haya contenido real. Se re-agrega aquí + en routes/ + en PUBLIC_ROUTES.
  {
    key: 'visitanos',
    view: 'pages/visitanos',
    path: '/visitanos',
    title: 'Visítanos',
    description:
      'Mariposario en Bajo La Paz, San Ramón, Alajuela, Costa Rica: cómo llegar, horarios, entrada y contacto por WhatsApp del Jardín de Mariposas La Paz.',
  },
];

function makeHandler(def) {
  return function (req, res) {
    res.render(def.view, { page: buildPageMeta(def), ...def.extra });
  };
}

const pages = {};
for (const def of PAGE_DEFS) {
  pages[def.key] = makeHandler(def);
}

// Visítanos: añade structured data LocalBusiness construida exclusivamente
// con datos confirmados de business.js + config (ver src/utils/seo.js).
pages.visitanos = function (req, res) {
  const def = PAGE_DEFS.find((d) => d.key === 'visitanos');
  const page = buildPageMeta(def);
  res.render(def.view, {
    page,
    schema: buildLocalBusinessSchema({
      canonical: page.canonical,
      description: def.description,
      image: absoluteUrl('/media/img/mariposario-bajo-la-paz-01-1280.jpg'),
    }),
  });
};

module.exports = {
  pages,
  PAGE_DEFS,
};
