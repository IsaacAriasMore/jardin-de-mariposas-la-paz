'use strict';

// Política de caché HTTP en producción.
// Este archivo se ejecuta en su propio proceso: forzar NODE_ENV=production
// antes de importar la configuración garantiza que la app usa la rama de
// caché diferenciada (como en Hostinger).
process.env.NODE_ENV = 'production';
process.env.SITE_URL = 'https://jardindemariposaslapaz.com';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');

const { createApp } = require('../src/app');

const app = createApp();

test('CSS/JS con nombre estable se revalidan y nunca usan caché anual', async () => {
  for (const url of ['/css/base.css', '/js/main.js']) {
    const res = await request(app).get(url);
    assert.equal(res.status, 200, `GET ${url} → 200`);
    assert.match(res.headers['cache-control'], /max-age=0/, `${url} → max-age=0`);
    assert.match(res.headers['cache-control'], /must-revalidate/, `${url} → must-revalidate`);
    assert.doesNotMatch(
      res.headers['cache-control'],
      /31536000|immutable/,
      `${url} no usa caché de 1 año`,
    );
  }
});

test('favicon con nombre estable se revalida', async () => {
  const res = await request(app).get('/favicon.svg');
  assert.equal(res.status, 200);
  assert.match(res.headers['cache-control'], /max-age=0/, 'favicon → max-age=0');
  assert.match(res.headers['cache-control'], /must-revalidate/, 'favicon → must-revalidate');
  assert.doesNotMatch(res.headers['cache-control'], /31536000|immutable/);
});

test('media con nombre estable se conserva 30 días pero sin immutable', async (t) => {
  const file = path.join(
    __dirname,
    '..',
    'public',
    'media',
    'posters',
    'mariposa-flor-amarilla-hero.jpg',
  );
  if (!fs.existsSync(file)) {
    t.skip('public/media no está presente (media se sube en el deployment)');
    return;
  }
  const res = await request(app).get('/media/posters/mariposa-flor-amarilla-hero.jpg');
  assert.equal(res.status, 200);
  assert.match(res.headers['cache-control'], /max-age=2592000/, 'media → 30 días');
  assert.doesNotMatch(
    res.headers['cache-control'],
    /immutable/,
    'media NO es immutable (se puede reemplazar en sitio)',
  );
});

test('HTML dinámico y documentos SEO usan no-cache con revalidación', async () => {
  for (const url of ['/', '/visitanos', '/robots.txt', '/sitemap.xml']) {
    const res = await request(app).get(url);
    assert.equal(res.status, 200, `GET ${url} → 200`);
    assert.equal(res.headers['cache-control'], 'no-cache', `${url} → no-cache`);
  }
});

test('estáticos conservan ETag y Last-Modified para revalidación eficiente', async () => {
  const res = await request(app).get('/css/home.css');
  assert.ok(res.headers.etag, 'ETag presente');
  assert.ok(res.headers['last-modified'], 'Last-Modified presente');
});
