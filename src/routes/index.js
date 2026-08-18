'use strict';

const { Router } = require('express');
const { pageHandler, PAGE_DEFS } = require('../controllers/pages.controller');
const seo = require('../controllers/seo.controller');

const router = Router();

// Each locale has its own indexable URL; no language auto-redirect is used.
Object.entries(PAGE_DEFS).forEach(([key, definition]) => {
  router.get(definition.paths.es, pageHandler(key, 'es'));
  router.get(definition.paths.en, pageHandler(key, 'en'));
});

router.get('/robots.txt', seo.robots);
router.get('/sitemap.xml', seo.sitemap);

module.exports = router;
