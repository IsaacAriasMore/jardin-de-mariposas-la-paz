'use strict';

const config = require('../config');
const { buildPageMeta } = require('../utils/seo');

function notFound(req, res, _next) {
  const { locale, t } = res.locals;
  res.status(404);
  res.render('pages/404', {
    page: buildPageMeta({
      title: t('errors.notFoundTitle'),
      description: t('errors.notFoundDescription'),
      path: req.path,
      locale,
      noindex: true,
    }),
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const statusCode = Number(err.status || err.statusCode) || 500;
  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  const { locale, t } = res.locals;
  res.status(statusCode);
  res.render('pages/error', {
    page: buildPageMeta({
      title: t('errors.serverTitle'),
      description: t('errors.serverDescription', { statusCode }),
      path: req.path,
      locale,
      noindex: true,
    }),
    statusCode,
    error: config.env === 'production' ? null : err,
  });
}

module.exports = { notFound, errorHandler };
