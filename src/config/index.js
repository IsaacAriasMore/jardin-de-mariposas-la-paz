'use strict';

// Carga opcional de .env (nativo de Node 20.12+, sin dependencias).
// Si .env no existe se usan los valores por defecto definidos abajo.
const path = require('node:path');

try {
  process.loadEnvFile(path.join(__dirname, '..', '..', '.env'));
} catch {
  // Sin .env: se usa la configuración por defecto.
}

const PROVISIONAL_DOMAIN = 'jardindemariposaslapaz.com';

// URL provisional de Google Maps basada en el Plus Code del negocio.
// Se sobrescribe con GOOGLE_MAPS_URL cuando se tenga el enlace oficial.
const DEFAULT_GOOGLE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=5F36%2BVVC%20Bajo%20La%20Paz%2C%20San%20Ram%C3%B3n%2C%20Alajuela%2020201%2C%20Costa%20Rica';

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  siteUrl: String(process.env.SITE_URL || `https://${PROVISIONAL_DOMAIN}`).replace(/\/+$/, ''),
  googleMapsUrl: process.env.GOOGLE_MAPS_URL || DEFAULT_GOOGLE_MAPS_URL,
};
