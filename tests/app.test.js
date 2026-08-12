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
