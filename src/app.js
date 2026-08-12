'use strict';

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const expressLayouts = require('express-ejs-layouts');

const config = require('./config');
const routes = require('./routes');
const viewLocals = require('./middleware/view-locals');
const { notFound, errorHandler } = require('./middleware/error-handlers');

// Fábrica de la aplicación Express (desacoplada del arranque del servidor
// para poderla importar en pruebas con supertest).
function createApp() {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.disable('x-powered-by');

  app.use(
    helmet({
      // Fase 2 (diseño): definir una Content Security Policy explícita que permita
      // los estilos/scripts inline y JSON-LD previstos. Mientras tanto se desactiva
      // la CSP por defecto para no bloquear el desarrollo.
      contentSecurityPolicy: false,
    }),
  );

  app.use(
    express.static(path.join(__dirname, '..', 'public'), {
      maxAge: config.env === 'production' ? '365d' : 0,
    }),
  );

  app.use(viewLocals);
  app.use(expressLayouts);

  app.use('/', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
