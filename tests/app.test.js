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
  '/visitanos',
];

// /guias está reservada para el futuro: excluida del sitemap y fuera de las
// rutas públicas hasta que existan artículos reales.
const RESERVED_ROUTES = ['/guias'];

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

test('/guias está retirada: responde 404 hasta que exista contenido real', async () => {
  for (const route of RESERVED_ROUTES) {
    const res = await request(app).get(route);
    assert.equal(res.status, 404, `GET ${route} → 404`);
    assert.match(res.text, /Página no encontrada/, `404 personalizado en ${route}`);
  }
});

test('el Home usa solo posters reales y dimensiones correctas', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);

  // Posters del hero: los nombres rotos (inexistentes) quedaron reemplazados.
  assert.ok(res.text.includes('/media/posters/mariposa-flor-amarilla-hero.jpg'));
  assert.ok(res.text.includes('/media/posters/mariposas-entre-hojas-vertical.jpg'));
  assert.ok(!res.text.includes('hero-desktop.jpg'), 'sin poster hero-desktop inexistente');
  assert.ok(!res.text.includes('hero-mobile.jpg'), 'sin poster hero-mobile inexistente');
});

test('el menú principal prioriza la conversión y ya no enlaza Conservación', async () => {
  for (const route of PUBLIC_ROUTES) {
    const res = await request(app).get(route);
    const nav = res.text.match(/<ul class="site-nav__list" id="nav-list"[\s\S]*?<\/ul>/);
    assert.ok(nav, `navbar presente en ${route}`);
    assert.ok(nav[0].includes('Consultar visita'), `CTA del menú en ${route}`);
    assert.ok(
      !nav[0].includes('/conservacion'),
      `sin enlace a Conservación en el menú de ${route}`,
    );
  }

  // Conservación sigue accesible e indexable fuera del menú principal.
  const cons = await request(app).get('/conservacion');
  assert.equal(cons.status, 200);
  const sitemap = await request(app).get('/sitemap.xml');
  assert.ok(sitemap.text.includes('<loc>https://jardindemariposaslapaz.com/conservacion</loc>'));
});

test('el Home comunica visitas guiadas, idiomas y WhatsApp en su jerarquía', async () => {
  const res = await request(app).get('/');
  const html = res.text.toLowerCase();

  assert.ok(html.includes('visitas guiadas'), 'menciona visitas guiadas');
  assert.ok(html.includes('español · inglés'), 'idiomas visibles en la franja rápida');
  assert.ok(html.includes('una experiencia guiada para distintas edades'), 'sección guiada');
  assert.ok(html.includes('+10 años'), 'tratamiento editorial +10 años');
  assert.ok(html.includes('de experiencia como guía turístico'), 'frase de apoyo del guía');
  assert.ok(html.includes('desde kínder y grupos escolares'), 'público kínder y escuelas');
  assert.ok(html.includes('hasta personas adultas mayores'), 'público adultos mayores');
  assert.ok(html.includes('consultar por whatsapp'), 'CTA WhatsApp presente');
  assert.ok(res.text.includes('href="https://wa.me/50688894483?text='), 'enlace wa.me');
  assert.ok(res.text.includes('¿Planeas una visita?'), 'CTA final de conversión');
});

test('el Home incorpora las fotos nuevas aprobadas (guía y mariposa naranja)', async () => {
  const res = await request(app).get('/');
  assert.ok(res.text.includes('guia-mariposario-mariposa-960.jpg'), 'foto del guía en Home');
  assert.ok(res.text.includes('mariposa-naranja-flores-528.jpg'), 'mariposa naranja en Home');
  assert.ok(res.text.includes('alt="Guía mostrando una mariposa durante una visita"'));
});

test('el Home mantiene un solo video (el hero) por rendimiento', async () => {
  const res = await request(app).get('/');
  // Dos elementos <video> = hero desktop + hero móvil (el oculto no descarga).
  assert.equal((res.text.match(/<video/g) || []).length, 2);
});

test('/experiencia presenta la visita guiada, idiomas y públicos', async () => {
  const res = await request(app).get('/experiencia');
  const html = res.text.toLowerCase();

  assert.ok(html.includes('visitas guiadas'), 'menciona visitas guiadas');
  assert.ok(html.includes('español e inglés'), 'idiomas en el texto');
  assert.ok(html.includes('español · inglés'), 'idiomas como dato visual');
  assert.ok(html.includes('consultar una visita'), 'CTA de consulta');
  assert.ok(html.includes('preescolar, kínder'), 'público educativo compacto');
  assert.ok(html.includes('grupos educativos'), 'grupos educativos');
  assert.ok(html.includes('adultas mayores'), 'público adultos mayores');
  assert.ok(html.includes('visitantes de distintas edades'), 'distintas edades');
  assert.ok(html.includes('+10 años'), 'tratamiento editorial +10 años');
  assert.ok(html.includes('de experiencia como guía turístico'), 'frase de apoyo del guía');
  assert.ok(html.includes('guia-grupo-adultos-960.jpg'), 'foto del guía con grupo');
  assert.ok(html.includes('visitantes-dentro-mariposario-960.jpg'), 'foto de visitantes');
  assert.ok(!html.includes('a su propio ritmo'), 'no define la visita como autónoma');
});

test('las fotos aprobadas se distribuyen y 482005509 (HOLD) no aparece en ninguna página', async () => {
  const pages = {};
  for (const route of PUBLIC_ROUTES) {
    pages[route] = (await request(app).get(route)).text;
  }

  assert.ok(pages['/nuestro-mariposario'].includes('guia-acompanando-visitante-960.jpg'));
  assert.ok(pages['/mariposas'].includes('mariposa-oscura-puntos-azules-960.jpg'));
  assert.ok(pages['/galeria'].includes('visitantes-dentro-mariposario-960.jpg'));
  assert.ok(pages['/galeria'].includes('guia-acompanando-visitante-960.jpg'));
  assert.ok(pages['/galeria'].includes('mariposa-oscura-puntos-azules-960.jpg'));

  for (const [route, html] of Object.entries(pages)) {
    assert.ok(!html.includes('482005509'), `482005509 (HOLD) fuera de ${route}`);
  }
});

test('/visitanos ofrece el bloque educativo/grupal y la atención en español e inglés', async () => {
  const res = await request(app).get('/visitanos');
  assert.equal(res.status, 200);
  assert.ok(res.text.includes('¿Planea una visita educativa o grupal?'));
  assert.ok(res.text.includes('Acompañamiento en español e inglés'));
  assert.ok(res.text.includes('Consultar por WhatsApp'));
});

test('el JSON-LD de /visitanos no inventa el nombre alternativo', async () => {
  const res = await request(app).get('/visitanos');
  const match = res.text.match(
    /<script type="application\/ld\+json" nonce="([^"]+)">([\s\S]*?)<\/script>/,
  );
  assert.ok(match, 'JSON-LD presente con nonce CSP');
  const schema = JSON.parse(match[2]);
  assert.equal(schema.name, 'Jardín de Mariposas La Paz');
  assert.equal(schema.alternateName, undefined, 'sin alternateName no confirmado');
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

test('/visitanos incluye el embed de Google Maps y la CSP lo permite', async () => {
  const res = await request(app).get('/visitanos');
  assert.equal(res.status, 200);

  // iframe del mapa oficial: partes estables sin pegar el parámetro `pb=` entero.
  assert.ok(res.text.includes('https://www.google.com/maps/embed'), 'iframe del mapa presente');
  assert.ok(
    res.text.includes('title="Ubicación de Jardín de Mariposas La Paz en Google Maps"'),
    'iframe con title accesible',
  );
  assert.match(res.text, /<iframe[^>]*loading="lazy"/, 'iframe con carga lazy');
  assert.ok(
    res.text.includes('referrerpolicy="strict-origin-when-cross-origin"'),
    'referrerpolicy estricta en el iframe',
  );
  assert.ok(res.text.includes('Ver en Google Maps'), 'el enlace externo se mantiene');

  // CSP: frame-src permite solo el embed oficial; frame-ancestors sin relajar.
  const csp = res.headers['content-security-policy'];
  assert.ok(csp.includes("frame-src 'self' https://www.google.com"), 'CSP permite el embed');
  assert.ok(csp.includes("frame-ancestors 'self'"), 'frame-ancestors sigue en self');
  assert.ok(!csp.includes('frame-ancestors *'), 'frame-ancestors sin comodines');
});

test('robots.txt se sirve y referencia el sitemap', async () => {
  const res = await request(app).get('/robots.txt');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /text\/plain/);
  assert.match(res.text, /Sitemap: https:\/\/jardindemariposaslapaz\.com\/sitemap\.xml/);
});

test('sitemap.xml lista todas las rutas públicas y excluye las reservadas', async () => {
  const res = await request(app).get('/sitemap.xml');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /application\/xml/);
  for (const route of PUBLIC_ROUTES) {
    assert.ok(
      res.text.includes(`<loc>https://jardindemariposaslapaz.com${route}</loc>`),
      `sitemap incluye ${route}`,
    );
  }
  for (const route of RESERVED_ROUTES) {
    assert.ok(
      !res.text.includes(`<loc>https://jardindemariposaslapaz.com${route}</loc>`),
      `sitemap NO incluye ${route}`,
    );
  }
});
