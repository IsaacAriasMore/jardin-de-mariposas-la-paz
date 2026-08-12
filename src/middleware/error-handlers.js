'use strict';

const config = require('../config');
const { buildPageMeta } = require('../utils/seo');

// Página 404 personalizada para cualquier ruta no registrada.
function notFound(req, res, _next) {
  res.status(404);
  res.render('pages/404', {
    page: buildPageMeta({
      title: 'Página no encontrada',
      description:
        'La página que buscaba no existe o fue movida. Revise la dirección o vuelva a la página de inicio.',
      path: req.path,
      noindex: true,
    }),
  });
}

// Manejo centralizado de errores. En producción no se expone el stack.
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number(err.status || err.statusCode) || 500;

  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  res.status(statusCode);
  res.render('pages/error', {
    page: buildPageMeta({
      title: 'Error del servidor',
      description: 'Ocurrió un error inesperado. Intente nuevamente en unos momentos.',
      path: req.path,
      noindex: true,
    }),
    statusCode,
    error: config.env === 'production' ? null : err,
  });
}

module.exports = {
  notFound,
  errorHandler,
};
