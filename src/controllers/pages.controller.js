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
      'Jardín de Mariposas La Paz: un mariposario en Bajo La Paz, San Ramón, Alajuela, Costa Rica, donde las mariposas viven en vuelo libre entre plantas y flores tropicales.',
    extra: { preloadHero: true },
  },
  {
    key: 'nuestroMariposario',
    view: 'pages/nuestro-mariposario',
    path: '/nuestro-mariposario',
    title: 'Nuestro Mariposario',
    description:
      'Conozca el mariposario en Bajo La Paz, San Ramón: un espacio dedicado a las mariposas, las plantas que las sostienen y su conservación.',
  },
  {
    key: 'mariposas',
    view: 'pages/mariposas',
    path: '/mariposas',
    title: 'Mariposas',
    description:
      'Las mariposas que habitan el Jardín de Mariposas La Paz: color, plantas hospederas y comportamiento en vuelo libre.',
  },
  {
    key: 'experiencia',
    view: 'pages/experiencia',
    path: '/experiencia',
    title: 'Experiencia',
    description:
      'Lo que se vive en una visita al mariposario: mariposas en vuelo libre, flores tropicales y cercanía con la naturaleza.',
  },
  {
    key: 'conservacion',
    view: 'pages/conservacion',
    path: '/conservacion',
    title: 'Conservación',
    description:
      'El valor de conservar mariposas y sus hábitats: plantas hospederas, polinización y jardines amigables con la vida silvestre.',
  },
  {
    key: 'galeria',
    view: 'pages/galeria',
    path: '/galeria',
    title: 'Galería',
    description:
      'Galería de fotos y videos del Jardín de Mariposas La Paz: mariposas, flores y momentos del jardín.',
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
