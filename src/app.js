'use strict';

const path = require('node:path');
const crypto = require('node:crypto');
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
          scriptSrc: [
            "'self'",
            (req, res) => {
              // Nonce por petición para permitir el JSON-LD inline (Visítanos)
              // sin abrir 'unsafe-inline'. La vista usa el mismo <%- cspNonce %>.
              res.locals.cspNonce = crypto.randomBytes(16).toString('hex');
              return `'nonce-${res.locals.cspNonce}'`;
            },
          ],
          connectSrc: ["'self'"],
          formAction: ["'self'", 'https://wa.me'],
          // frameSrc: qué iframes puede cargar nuestra web (solo el embed
          // oficial de Google Maps en /visitanos). frameAncestors (quién puede
          // embebernos) se mantiene en ['self'] intacto.
          frameSrc: ["'self'", 'https://www.google.com'],
          frameAncestors: ["'self'"],
        },
      },
    }),
  );

  // Estáticos: estrategia de caché diferenciada por tipo de asset.
  //
  // HTML dinámico (rutas), robots.txt y sitemap.xml no pasan por aquí: el
  // middleware de más abajo les pone `Cache-Control: no-cache` para forzar
  // revalidación (ETag de Express) en cada visita.
  //
  // Media (imgs, videos, posters): nombres con dimensión/resolución (p. ej.
  // -1280.webp). Se permiten reemplazos en sitio manteniendo el nombre, por
  // eso se conserva durante 30 días, sin immutable.
  //
  // CSS/JS y favicon: nombres estables sin hash de contenido → se revalidan
  // en cada uso para que los cambios de código lleguen tras un deploy. ETag y
  // Last-Modified permiten que las copias sin cambios reciban un 304.
  app.use(
    express.static(path.join(__dirname, '..', 'public'), {
      maxAge: 0,
      setHeaders(res, filePath) {
        if (config.env !== 'production') return;

        const ext = path.extname(filePath).toLowerCase();

        if (['.mp4', '.webm', '.jpg', '.jpeg', '.webp', '.png'].includes(ext)) {
          res.setHeader('Cache-Control', 'public, max-age=2592000');
          return;
        }

        if (['.css', '.js', '.svg', '.ico'].includes(ext)) {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
          return;
        }
      },
    }),
  );

  // HTML y documentos SEO dinámicos: no-cache (revalidación eficiente vía
  // ETag). No aplica a estáticos: sus headers ya fueron fijados por
  // express.static arriba, que responde sin llamar a next().
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });

  app.use(viewLocals);
  app.use(expressLayouts);

  app.use('/', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
