'use strict';

const fs = require('node:fs');
const path = require('node:path');
const business = require('./business');

function parsePort(value) {
  if (value === undefined) return 3000;
  if (!/^\d+$/.test(String(value))) throw new Error('Invalid PORT.');
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT.');
  return port;
}

function normalizeBaseUrl(value, name, { requireHttps = false } = {}) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid ${name}.`);
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname)
    throw new Error(`Invalid ${name}.`);
  if (requireHttps && url.protocol !== 'https:')
    throw new Error(`${name} must use HTTPS in production.`);
  return url.toString().replace(/\/+$/, '');
}

function parseHttpsUrl(value, name) {
  return normalizeBaseUrl(value, name, { requireHttps: true });
}

const envFile = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const env = process.env.NODE_ENV || 'development';
const port = parsePort(process.env.PORT);
const provisionalDomain = 'jardindemariposaslapaz.com';
const siteUrlValue =
  process.env.SITE_URL || (env === 'production' ? undefined : `https://${provisionalDomain}`);
if (!siteUrlValue) throw new Error('SITE_URL is required in production.');
const siteUrl = normalizeBaseUrl(siteUrlValue, 'SITE_URL', { requireHttps: env === 'production' });
const destination = encodeURIComponent(business.location.plusCode);
const defaultMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
const defaultMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

module.exports = {
  env,
  port,
  siteUrl,
  googleMapsUrl: parseHttpsUrl(process.env.GOOGLE_MAPS_URL || defaultMapsUrl, 'GOOGLE_MAPS_URL'),
  googleMapsDirectionsUrl: parseHttpsUrl(
    process.env.GOOGLE_MAPS_DIRECTIONS_URL || defaultMapsDirectionsUrl,
    'GOOGLE_MAPS_DIRECTIONS_URL',
  ),
  parsePort,
  normalizeBaseUrl,
  parseHttpsUrl,
};
