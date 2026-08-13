'use strict';

const { buildPageMeta } = require('../utils/seo');

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
      'Galería del Jardín de Mariposas La Paz, mariposario en Bajo La Paz, San Ramón, Alajuela, Costa Rica: el jardín y fotografía de mariposas y naturaleza.',
  },
  {
    key: 'guias',
    view: 'pages/guias',
    path: '/guias',
    title: 'Guías',
    description:
      'Guías de visita y recomendaciones para planear y disfrutar su recorrido por el Jardín de Mariposas La Paz.',
  },
  {
    key: 'visitanos',
    view: 'pages/visitanos',
    path: '/visitanos',
    title: 'Visítanos',
    description:
      'Ubicación, horario y contacto del Jardín de Mariposas La Paz en Bajo La Paz, San Ramón, Alajuela, Costa Rica.',
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

module.exports = {
  pages,
  PAGE_DEFS,
};
