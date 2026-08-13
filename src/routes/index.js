'use strict';

const { Router } = require('express');
const { pages } = require('../controllers/pages.controller');
const seo = require('../controllers/seo.controller');

const router = Router();

// Páginas informativas
router.get('/', pages.home);
router.get('/nuestro-mariposario', pages.nuestroMariposario);
router.get('/mariposas', pages.mariposas);
router.get('/experiencia', pages.experiencia);
router.get('/conservacion', pages.conservacion);
router.get('/galeria', pages.galeria);
router.get('/visitanos', pages.visitanos);

// SEO técnico
router.get('/robots.txt', seo.robots);
router.get('/sitemap.xml', seo.sitemap);

// Evolución futura (sin rehacer el proyecto):
//   router.get('/guias', ...)             -> índice de guías (retirado por thin
//                                            content hasta tener artículos reales)
//   router.get('/guias/:slug', ...)       -> detalle de guía
//   router.get('/mariposas/:slug', ...)   -> detalle de especie
// Los controladores se agregarán cuando existan datos reales (con MySQL).
// /guias cae en el 404 normal mientras no haya contenido real.

module.exports = router;
