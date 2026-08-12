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
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:'],
          mediaSrc: ["'self'"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
          formAction: ["'self'", 'https://wa.me'],
          frameAncestors: ["'self'"],
        },
      },
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
