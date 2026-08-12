'use strict';

// node --test ejecuta cada archivo en su propio proceso, así que es seguro
// limpiar las variables de entorno aquí antes de importar la configuración.

const { test } = require('node:test');
const assert = require('node:assert/strict');

delete process.env.NODE_ENV;
delete process.env.PORT;
delete process.env.SITE_URL;
delete process.env.GOOGLE_MAPS_URL;

const config = require('../src/config');
const business = require('../src/config/business');

test('la configuración funciona con valores por defecto sin .env', () => {
  assert.equal(config.env, 'development');
  assert.equal(config.port, 3000);
  assert.equal(config.siteUrl, 'https://jardindemariposaslapaz.com');
  assert.ok(config.googleMapsUrl.startsWith('https://www.google.com/maps/'));
});

test('los datos oficiales del negocio están completos', () => {
  assert.equal(business.name, 'Jardín de Mariposas La Paz');
  assert.equal(business.location.address, 'Bajo La Paz, San Ramón, Alajuela, Costa Rica');
  assert.equal(
    business.location.reference,
    '200 metros sureste de la Escuela/Liceo Arredondo Blanco',
  );
  assert.equal(
    business.location.plusCode,
    '5F36+VVC, Bajo La Paz, San Ramón, Alajuela 20201, Costa Rica',
  );
  assert.equal(business.phones.primary, '+506 8889-4483');
  assert.equal(business.phones.primaryWa, '50688894483');
  assert.equal(business.phones.secondary, '+506 8880-3433');
  assert.equal(business.facebookUrl, 'https://www.facebook.com/mariposaslapaz/');
  assert.equal(business.priceNote, 'Consultar por WhatsApp');
  assert.equal(business.hours.length, 3);
  assert.equal(business.navigation.length, 6);
  assert.deepEqual(
    business.navigation.map((item) => item.label),
    ['Nuestro Mariposario', 'Mariposas', 'Experiencia', 'Conservación', 'Galería', 'Visítanos'],
  );
});

test('los enlaces de WhatsApp se generan codificados con el teléfono principal', () => {
  const { buildWhatsAppLink } = require('../src/utils/whatsapp');
  const link = buildWhatsAppLink();

  assert.ok(link.startsWith('https://wa.me/50688894483?text='));
  assert.ok(!link.includes(' '), 'la URL no debe contener espacios');

  const custom = buildWhatsAppLink('¿Cuál es el precio?');
  assert.ok(custom.includes(encodeURIComponent('¿Cuál es el precio?')));
});

test('la utilidad SEO genera título, canonical y Open Graph correctos', () => {
  const { buildPageMeta, absoluteUrl } = require('../src/utils/seo');

  const meta = buildPageMeta({
    title: 'Visítanos',
    description: 'Ubicación y horario.',
    path: '/visitanos',
  });

  assert.equal(meta.title, 'Visítanos · Jardín de Mariposas La Paz');
  assert.equal(meta.canonical, 'https://jardindemariposaslapaz.com/visitanos');
  assert.equal(meta.robots, 'index, follow');
  assert.equal(meta.og.locale, 'es_CR');
  assert.equal(meta.og.url, meta.canonical);

  assert.equal(absoluteUrl(), 'https://jardindemariposaslapaz.com/');
  assert.equal(absoluteUrl('/galeria'), 'https://jardindemariposaslapaz.com/galeria');

  const noindex = buildPageMeta({ title: '404', description: 'x', path: '/x', noindex: true });
  assert.equal(noindex.robots, 'noindex, follow');
});
