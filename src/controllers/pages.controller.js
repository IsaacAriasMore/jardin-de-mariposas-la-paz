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
      'Mariposario en Bajo La Paz, San Ramón, con tour guiado en español e inglés para conocer el ciclo de vida de las mariposas.',
    extra: { preloadHero: true },
  },
  {
    key: 'nuestroMariposario',
    view: 'pages/nuestro-mariposario',
    path: '/nuestro-mariposario',
    title: 'Nuestro Mariposario',
    description:
      'Conoce Jardín de Mariposas La Paz en Bajo La Paz, San Ramón: un mariposario donde puedes observar mariposas y disfrutar de un recorrido guiado.',
  },
  {
    key: 'mariposas',
    view: 'pages/mariposas',
    path: '/mariposas',
    title: 'Mariposas',
    description:
      'Descubre el ciclo de vida, los hábitos y el fascinante mundo de las mariposas junto a Jardín de Mariposas La Paz en San Ramón.',
  },
  {
    key: 'experiencia',
    view: 'pages/experiencia',
    path: '/experiencia',
    title: 'Tour por el Mariposario',
    description:
      'Tour guiado por el mariposario en San Ramón con guía certificado por el ICT, atención en español e inglés y aprendizaje sobre el ciclo de vida de las mariposas.',
  },
  {
    key: 'conservacion',
    view: 'pages/conservacion',
    path: '/conservacion',
    title: 'Mariposas y su entorno',
    description:
      'Conoce la relación de las mariposas con las plantas, su entorno y la importancia de la biodiversidad en Jardín de Mariposas La Paz, San Ramón.',
  },
  {
    key: 'galeria',
    view: 'pages/galeria',
    path: '/galeria',
    title: 'Galería',
    description:
      'Galería de Jardín de Mariposas La Paz: fotografías del mariposario, visitas guiadas e imágenes ilustrativas del mundo de las mariposas.',
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
      'Horarios, ubicación, Google Maps y contacto de Jardín de Mariposas La Paz en Bajo La Paz, San Ramón. Consulta el tour guiado por WhatsApp.',
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
