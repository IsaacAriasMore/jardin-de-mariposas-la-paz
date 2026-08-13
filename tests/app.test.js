'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createApp } = require('../src/app');

const app = createApp();

const PUBLIC_ROUTES = [
  '/',
  '/nuestro-mariposario',
  '/mariposas',
  '/experiencia',
  '/conservacion',
  '/galeria',
  '/guias',
  '/visitanos',
];

test('la app inicia y las rutas principales responden 200 con el layout EJS', async () => {
  for (const route of PUBLIC_ROUTES) {
    const res = await request(app).get(route);
    assert.equal(res.status, 200, `GET ${route} → 200`);
    assert.match(res.text, /<html lang="es">/, `layout aplicado en ${route}`);
    assert.match(res.text, /Jardín de Mariposas La Paz/, `nombre del negocio en ${route}`);
  }
});

test('cada página define title, meta description y canonical propios', async () => {
  for (const route of PUBLIC_ROUTES) {
    const res = await request(app).get(route);
    assert.ok(res.text.match(/<title>[^<]+<\/title>/), `title en ${route}`);
    assert.ok(
      res.text.match(/<meta name="description" content="[^"]+/),
      `meta description en ${route}`,
    );
    assert.ok(res.text.includes('rel="canonical"'), `canonical en ${route}`);
    assert.ok((res.text.match(/<h1[ >]/g) || []).length === 1, `un solo H1 en ${route}`);
  }
});

test('una ruta desconocida responde 404 con la página personalizada', async () => {
  const res = await request(app).get('/ruta-que-no-existe');
  assert.equal(res.status, 404);
  assert.match(res.text, /Página no encontrada/);
  assert.match(res.text, /<html lang="es">/);
});

test('/visitanos incluye structured data LocalBusiness y contacto completo', async () => {
  const res = await request(app).get('/visitanos');
  assert.equal(res.status, 200);

  const match = res.text.match(
    /<script type="application\/ld\+json" nonce="([^"]+)">([\s\S]*?)<\/script>/,
  );
  assert.ok(match, 'JSON-LD presente con nonce CSP');
  assert.ok(match[1].length > 0, 'nonce CSP no vacío');

  const schema = JSON.parse(match[2]);
  assert.equal(schema['@type'], 'LocalBusiness');
  assert.equal(schema.name, 'Jardín de Mariposas La Paz');
  assert.deepEqual(schema.telephone, ['+50688894483', '+50688803433']);
  assert.equal(schema.address.addressLocality, 'Bajo La Paz');
  assert.equal(schema.address.postalCode, '20201');
  assert.equal(schema.openingHoursSpecification.length, 2);
  assert.ok(schema.hasMap.startsWith('https://www.google.com/maps/'));
  assert.equal(schema.sameAs[0], 'https://www.facebook.com/mariposaslapaz/');

  assert.ok(res.text.includes('href="https://wa.me/50688894483?text='));
  assert.ok(res.text.includes('href="tel:+50688894483"'));
  assert.ok(res.text.includes('href="tel:+50688803433"'));
  assert.ok(res.text.includes('5F36+VVC'));
  assert.ok(res.text.includes('200 metros sureste de la Escuela/Liceo Arredondo Blanco'));
  assert.ok(res.text.includes('8:00 a. m.'));
});

test('robots.txt se sirve y referencia el sitemap', async () => {
  const res = await request(app).get('/robots.txt');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /text\/plain/);
  assert.match(res.text, /Sitemap: https:\/\/jardindemariposaslapaz\.com\/sitemap\.xml/);
});

test('sitemap.xml lista todas las rutas públicas', async () => {
  const res = await request(app).get('/sitemap.xml');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /application\/xml/);
  for (const route of PUBLIC_ROUTES) {
    assert.ok(
      res.text.includes(`<loc>https://jardindemariposaslapaz.com${route}</loc>`),
      `sitemap incluye ${route}`,
    );
  }
});
