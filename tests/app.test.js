'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
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

const LOCALIZED_ROUTES = [
  ['/', '/en'],
  ['/experiencia', '/en/tour'],
  ['/nuestro-mariposario', '/en/our-butterfly-garden'],
  ['/mariposas', '/en/butterflies'],
  ['/galeria', '/en/gallery'],
  ['/conservacion', '/en/butterflies-and-their-environment'],
  ['/visitanos', '/en/visit-us'],
];

// /guias está reservada para el futuro: excluida del sitemap y fuera de las
// rutas públicas hasta que existan artículos reales.
const RESERVED_ROUTES = ['/guias'];

test('la app inicia y las rutas principales responden 200 con el layout EJS', async () => {
  for (const route of PUBLIC_ROUTES) {
    const res = await request(app).get(route);
    assert.equal(res.status, 200, `GET ${route} → 200`);
    assert.match(res.text, /<html lang="es-CR"/, `layout aplicado en ${route}`);
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
  assert.match(res.text, /<html lang="es-CR"/);
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
    assert.ok(
      res.text.includes('class="site-nav__brand" href="/">Jardín de Mariposas La Paz</a>'),
      `marca oficial en ${route}`,
    );
    assert.ok(nav[0].includes('Consultar visita'), `CTA del menú en ${route}`);
    assert.ok(nav[0].includes('Tour guiado'), `label Tour guiado en el menú de ${route}`);
    assert.ok(
      !/class="site-nav__link[^"]*" href="\/conservacion"/.test(nav[0]),
      `sin enlace a Conservación en el menú de ${route}`,
    );
  }

  // Conservación sigue accesible e indexable fuera del menú principal.
  const cons = await request(app).get('/conservacion');
  assert.equal(cons.status, 200);
  const sitemap = await request(app).get('/sitemap.xml');
  assert.ok(sitemap.text.includes('<loc>https://jardindemariposaslapaz.com/conservacion</loc>'));
});

test('el Home comunica el tour guiado, la credencial ICT y WhatsApp en su jerarquía', async () => {
  const res = await request(app).get('/');
  const html = res.text.toLowerCase();

  assert.ok(html.includes('tour por el mariposario'), 'título de la sección guiada');
  assert.ok(html.includes('guía certificado por el ict'), 'credencial ICT del guía');
  assert.ok(html.includes('español · inglés'), 'idiomas visibles en la franja rápida');
  assert.ok(html.includes('español e inglés'), 'atención en español e inglés');
  assert.ok(html.includes('ciclo de vida'), 'propuesta de aprendizaje');
  assert.ok(html.includes('desde kínder y grupos escolares'), 'público kínder y escolares');
  assert.ok(html.includes('hasta familias, personas adultas y adultas mayores'), 'público general');
  assert.ok(html.includes('consultar por whatsapp'), 'CTA WhatsApp presente');
  assert.ok(html.includes('precio y duración'), 'precio y duración se remiten a WhatsApp');
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
  const css = fs.readFileSync(path.join(__dirname, '..', 'public', 'css', 'base.css'), 'utf8');
  assert.equal((res.text.match(/<video/g) || []).length, 1);
  assert.match(css, /\.hero > \.hero__media\s*\{\s*position: absolute;\s*z-index: 0;/);
  assert.match(css, /\.hero > \.hero__overlay\s*\{\s*position: absolute;\s*z-index: 1;/);
  assert.match(
    res.text,
    /mariposa-flor-amarilla-hero-1080p\.webm[\s\S]*mariposa-flor-amarilla-hero-1080p\.mp4/,
  );
  assert.match(
    res.text,
    /mariposas-entre-hojas-vertical-1080\.webm[\s\S]*mariposas-entre-hojas-vertical-1080\.mp4/,
  );
  assert.match(res.text, /preload="none"/, 'el video no solicita media antes de decidir el modo');
  assert.match(
    res.text,
    /autoplay/,
    'el video declara intención de autoplay cuando se carga en full',
  );
  assert.match(res.text, /data-source-desktop-webm=/, 'fuente desktop declarada como dato');
  assert.match(res.text, /data-source-mobile-webm=/, 'fuente móvil declarada como dato');
  assert.match(res.text, /data-hero-motion-toggle/, 'control explícito de movimiento presente');
  assert.match(res.text, /aria-label="Pausar movimiento"/, 'control de movimiento accesible');
  assert.match(
    res.text,
    /hero__motion-toggle-label">Pausar movimiento/,
    'control en estado full por defecto',
  );
});

test('Motion inicia en full sin una preferencia válida guardada', () => {
  const mainScript = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'main.js'), 'utf8');
  assert.match(mainScript, /\['full', 'reduced'\]\.includes\(value\) \? value : 'full'/);
  assert.match(mainScript, /function hasFullMotion\(\) \{\s+return preference === 'full';\s+\}/);
  assert.match(mainScript, /function setMotionPreference\(value, options = \{\}\)/);
  assert.match(mainScript, /function setMotionToggle\(\)/);
  assert.doesNotMatch(mainScript, /preference === 'system'/);
});

test('el control global de motion se localiza y acompaña al Hero en páginas públicas', async () => {
  const [homeEs, homeEn, internalEs] = await Promise.all([
    request(app).get('/'),
    request(app).get('/en'),
    request(app).get('/galeria'),
  ]);

  assert.match(homeEs.text, /data-motion-toggle/);
  assert.match(homeEs.text, /data-label-pause="Pausar movimiento"/);
  assert.match(homeEs.text, /data-label-activate="Activar movimiento"/);
  assert.match(homeEs.text, /data-hero-motion-toggle/);
  assert.match(homeEn.text, /data-label-pause="Pause motion"/);
  assert.match(homeEn.text, /data-label-activate="Enable motion"/);
  assert.match(internalEs.text, /data-motion-toggle/);
});

test('las hojas de estilo se cargan según el tipo de página y los mosaicos reservan espacio', async () => {
  const [home, gallery, garden] = await Promise.all([
    request(app).get('/'),
    request(app).get('/galeria'),
    request(app).get('/nuestro-mariposario'),
  ]);

  assert.match(home.text, /href="\/css\/base\.css"/);
  assert.match(home.text, /href="\/css\/home\.css"/);
  assert.doesNotMatch(home.text, /href="\/css\/pages\.css"/);
  assert.match(gallery.text, /href="\/css\/base\.css"/);
  assert.match(gallery.text, /href="\/css\/pages\.css"/);
  assert.doesNotMatch(gallery.text, /href="\/css\/home\.css"/);
  assert.match(
    garden.text,
    /srcset="\/media\/img\/grupo-mariposas-naranjas-en-planta-640\.jpg 640w/,
  );
  assert.match(garden.text, /width="1280" height="1920"/);
});

test('el video inmersivo se difiere y usa la preferencia global de Motion', async () => {
  const [experienceEs, experienceEn] = await Promise.all([
    request(app).get('/experiencia'),
    request(app).get('/en/tour'),
  ]);
  const mainScript = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'main.js'), 'utf8');

  for (const page of [experienceEs, experienceEn]) {
    assert.match(page.text, /data-motion-video/);
    assert.match(page.text, /preload="none"/);
    assert.match(
      page.text,
      /data-video-src="\/media\/videos\/mariposa-flores-tropicales-1080p\.mp4"/,
    );
    assert.doesNotMatch(
      page.text,
      /<source\s+src="\/media\/videos\/mariposa-flores-tropicales-1080p\.mp4"/,
    );
    assert.match(page.text, /data-motion-toggle/);
  }
  assert.match(mainScript, /function syncExperienceVideo\(\)/);
  assert.match(mainScript, /rootMargin: '400px 0px'/);
  assert.match(mainScript, /clearExperienceVideo\(\)/);
});

test('los reveals se prearman por grupo antes de la intersección', () => {
  const mainScript = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'main.js'), 'utf8');
  const homeTemplate = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'views', 'pages', 'home.ejs'),
    'utf8',
  );
  assert.match(mainScript, /animation\.pause\(\);\s+animation\.currentTime = 0;/);
  assert.match(mainScript, /fill: 'both'/);
  assert.match(mainScript, /getRevealGroups\(\)/);
  assert.doesNotMatch(mainScript, /function animateReveal/);
  ['tour', 'mariposario', 'mariposas', 'galeria', 'cta'].forEach((group) => {
    assert.match(homeTemplate, new RegExp(`data-motion-group="${group}"`));
  });
});

test('las páginas internas declaran grupos coordinados sin reveals anidados', () => {
  const pagesRoot = path.join(__dirname, '..', 'src', 'views', 'pages');
  const requiredGroups = {
    'experiencia.ejs': ['tour-detalles', 'ciclo-vida', 'experiencia-inmersiva', 'cta-experiencia'],
    'nuestro-mariposario.ejs': ['mariposario-principal', 'visita-acompanada', 'entorno-galeria'],
    'mariposas.ejs': ['transformacion', 'banda-mariposa', 'diversidad-galeria', 'observar-cta'],
    'galeria.ejs': ['galeria-principal', 'galeria-cta'],
    'conservacion.ejs': ['entorno-principal', 'ecosistema', 'aprender-cta'],
    'visitanos.ejs': ['ubicacion', 'informacion-practica', 'contacto-cta'],
  };

  Object.entries(requiredGroups).forEach(([file, groups]) => {
    const template = fs.readFileSync(path.join(pagesRoot, file), 'utf8');
    groups.forEach((group) => {
      assert.match(template, new RegExp(`data-motion-group="${group}"`));
    });
    assert.doesNotMatch(template, /reveal-image|reveal-stagger|reveal-clip/);
  });
});

test('el menú móvil conserva un botón accesible con icono SVG de tres líneas', async () => {
  const res = await request(app).get('/');
  const nav = res.text.match(/<button[\s\S]*?class="nav-toggle"[\s\S]*?<\/button>/);
  assert.ok(nav, 'botón de menú presente');
  assert.match(nav[0], /aria-expanded="false"/);
  assert.match(nav[0], /aria-controls="nav-list"/);
  assert.equal((nav[0].match(/<line /g) || []).length, 3, 'icono SVG de tres líneas');
});

test('/experiencia presenta el tour guiado, la credencial ICT y el aprendizaje', async () => {
  const res = await request(app).get('/experiencia');
  const html = res.text.toLowerCase();

  assert.ok(html.includes('tour por el mariposario'), 'título del tour');
  assert.ok(html.includes('guía certificado por el ict'), 'credencial ICT en el lead');
  assert.ok(html.includes('español e inglés'), 'idiomas en el texto');
  assert.ok(html.includes('consultar visita'), 'CTA de consulta');
  assert.ok(html.includes('preescolar, kínder'), 'público educativo compacto');
  assert.ok(html.includes('grupos educativos'), 'grupos educativos');
  assert.ok(html.includes('adultas mayores'), 'público adultos mayores');
  assert.ok(html.includes('para disfrutar en compañía'), 'bloque de familias y adultos');
  assert.ok(html.includes('ciclo de vida'), 'propuesta de aprendizaje');
  assert.ok(html.includes('crisálida'), 'etapas del ciclo de vida');
  assert.ok(html.includes('comportamiento, alimentación, reproducción'), 'contenido educativo');
  assert.ok(html.includes('precio y duración'), 'precio y duración se remiten a WhatsApp');
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

test('/visitanos ofrece el tour guiado y la credencial ICT', async () => {
  const res = await request(app).get('/visitanos');
  assert.equal(res.status, 200);
  assert.ok(res.text.includes('¿Quieres realizar el tour?'));
  assert.match(res.text, /guía\s+certificado por el ICT/);
  assert.ok(res.text.includes('español o inglés'));
  assert.ok(res.text.includes('precio y duración'));
  assert.ok(res.text.includes('Consultar por WhatsApp'));
});

test('el footer es conciso: sin referencia/Plus Code y con números sin duplicar', async () => {
  const res = await request(app).get('/');
  const footer = res.text.match(/<footer class="site-footer"[\s\S]*?<\/footer>/);
  assert.ok(footer, 'footer presente en Home');

  assert.ok(footer[0].includes('Tour guiado'), 'Explorar prioriza el tour');
  assert.ok(footer[0].includes('Mariposas y su entorno'), 'Conservación como enlace secundario');
  assert.ok(footer[0].includes('Facebook · @mariposaslapaz'), 'Facebook en Contacto');
  assert.ok(footer[0].includes('href="tel:+50688803433"'), 'teléfono alternativo presente');

  assert.ok(!footer[0].includes('5F36+VVC'), 'sin Plus Code en el footer');
  assert.ok(!footer[0].includes('200 metros sureste'), 'sin referencia exacta en el footer');
  assert.equal(
    (footer[0].match(/\+506 8889-4483/g) || []).length,
    0,
    'número principal fuera de la etiqueta visible de WhatsApp',
  );
  assert.match(footer[0], />WhatsApp<\//, 'botón de WhatsApp conciso');
});

test('Mariposas quedó sin la sección pendiente de fichas', async () => {
  const res = await request(app).get('/mariposas');
  assert.equal(res.status, 200);
  assert.ok(res.text.includes('Mariposa oscura con puntos azules'), 'caption de la foto aprobada');
  assert.ok(!res.text.includes('Las fichas de cada especie'), 'sin bloque de fichas');
  assert.ok(!res.text.includes('En camino'), 'sin sección en camino');
  assert.ok(!res.text.includes('identificación científica'), 'sin nota de identificación');
  assert.ok(res.text.includes('Conocer el tour'), 'CTA al tour presente');
  assert.ok(res.text.includes('Una mirada de cerca'), 'contexto editorial de la foto azul');
  assert.ok(
    res.text.includes('alt="Mariposa azul posada sobre una hoja tropical"'),
    'foto azul mantiene alt descriptivo',
  );
});

test('Conservación se presenta como "Mariposas y su entorno"', async () => {
  const res = await request(app).get('/conservacion');
  assert.equal(res.status, 200);
  assert.ok(
    res.text.includes('<h1') && res.text.includes('Mariposas y su entorno'),
    'H1 renombrado',
  );
  assert.ok(res.text.includes('Aprender también ayuda a valorar'), 'cierre educativo');
  assert.ok(res.text.includes('Conocer el tour'), 'CTA al tour presente');
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
  assert.equal(schema.telephone, '+50688894483');
  assert.equal(schema.address.addressLocality, 'San Ramón');
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
  assert.ok(res.text.includes('Abrir en Google Maps'), 'acción secundaria del mapa presente');
  assert.ok(res.text.includes('Cómo llegar'), 'acción de indicaciones presente');
  assert.match(
    res.text,
    /href="https:\/\/www\.google\.com\/maps\/dir\/\?api=1&amp;destination=/,
    'las indicaciones usan una URL de direcciones separada',
  );

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

test('todas las rutas inglesas responden con idioma, navegación y contenido localizado', async () => {
  for (const [, englishPath] of LOCALIZED_ROUTES) {
    const res = await request(app).get(englishPath);
    assert.equal(res.status, 200, `GET ${englishPath} → 200`);
    assert.match(res.text, /<html lang="en"/, `lang inglés en ${englishPath}`);
    assert.ok(res.text.includes('Primary navigation'), `navegación inglesa en ${englishPath}`);
    assert.ok(res.text.includes('Ask about a visit'), `CTA inglesa en ${englishPath}`);
    assert.ok(
      !res.text.includes('Navegación principal'),
      `sin navegación española en ${englishPath}`,
    );
  }
});

test('cada URL localizada declara canonical propio y alternates recíprocos', async () => {
  for (const [spanishPath, englishPath] of LOCALIZED_ROUTES) {
    const [spanish, english] = await Promise.all([
      request(app).get(spanishPath),
      request(app).get(englishPath),
    ]);
    const base = 'https://jardindemariposaslapaz.com';

    assert.ok(spanish.text.includes(`rel="canonical" href="${base}${spanishPath}"`));
    assert.ok(english.text.includes(`rel="canonical" href="${base}${englishPath}"`));
    for (const html of [spanish.text, english.text]) {
      assert.ok(html.includes(`hreflang="es-CR" href="${base}${spanishPath}"`));
      assert.ok(html.includes(`hreflang="en" href="${base}${englishPath}"`));
      assert.ok(html.includes(`hreflang="x-default" href="${base}${spanishPath}"`));
    }
  }
});

test('el selector ES/EN conserva la página equivalente', async () => {
  for (const [spanishPath, englishPath] of LOCALIZED_ROUTES) {
    const [spanish, english] = await Promise.all([
      request(app).get(spanishPath),
      request(app).get(englishPath),
    ]);
    assert.ok(spanish.text.includes(`href="${englishPath}">EN</a>`), `ES → EN para ${spanishPath}`);
    assert.ok(english.text.includes(`href="${spanishPath}">ES</a>`), `EN → ES para ${englishPath}`);
  }
});

test('los catálogos de traducción tienen la misma estructura de claves', () => {
  const readCatalog = (locale, namespace) =>
    JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '..', 'src', 'locales', locale, `${namespace}.json`),
        'utf8',
      ),
    );
  const leafPaths = (value, prefix = '') =>
    Object.entries(value).flatMap(([key, child]) => {
      const current = prefix ? `${prefix}.${key}` : key;
      return child && typeof child === 'object' && !Array.isArray(child)
        ? leafPaths(child, current)
        : [current];
    });

  for (const namespace of ['common', 'pages']) {
    assert.deepEqual(
      leafPaths(readCatalog('es', namespace)).sort(),
      leafPaths(readCatalog('en', namespace)).sort(),
      `paridad de claves en ${namespace}`,
    );
  }
});

test('el tema se aplica antes de estilos, persiste separado de motion y ofrece paleta oscura', async () => {
  const home = await request(app).get('/');
  const css = fs.readFileSync(path.join(__dirname, '..', 'public', 'css', 'base.css'), 'utf8');
  const script = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'main.js'), 'utf8');

  assert.match(home.text, /<html lang="es-CR" data-theme="light">/);
  assert.match(home.text, /localStorage\.getItem\('jmlp-theme-v1'\)/);
  assert.ok(home.text.indexOf('jmlp-theme-v1') < home.text.indexOf('/css/base.css'));
  assert.match(home.text, /data-theme-toggle/);
  assert.match(css, /html\[data-theme='dark'\]/);
  assert.match(css, /color-scheme: dark/);
  assert.match(script, /const storageKey = 'jmlp-motion-preference-v2';/);
  assert.match(script, /const themeStorageKey = 'jmlp-theme-v1';/);
  assert.match(script, /const themeColors = \{ light: '#f1f4f2', dark: '#10231d' \};/);
  assert.doesNotMatch(script, /#f7f4ed/);
  assert.match(script, /localStorage\.setItem\(themeStorageKey, value\)/);
});

test('el bosque ambiental distribuye la densidad aprobada por seccion y respeta movimiento reducido', async () => {
  const [home, experience, garden, butterflies, gallery, environment, visit] = await Promise.all([
    request(app).get('/'),
    request(app).get('/experiencia'),
    request(app).get('/nuestro-mariposario'),
    request(app).get('/mariposas'),
    request(app).get('/galeria'),
    request(app).get('/conservacion'),
    request(app).get('/visitanos'),
  ]);
  const css = fs.readFileSync(path.join(__dirname, '..', 'public', 'css', 'base.css'), 'utf8');
  const countButterflies = (html) =>
    (html.match(/class="section-butterfly section-butterfly--/g) || []).length;

  assert.doesNotMatch(home.text, /ambient-forest|ambient-glow|ambient-canopy/);
  assert.equal(countButterflies(home.text), 18);
  assert.equal(countButterflies(experience.text), 16);
  assert.equal(countButterflies(garden.text), 15);
  assert.equal(countButterflies(butterflies.text), 18);
  assert.equal(countButterflies(gallery.text), 15);
  assert.equal(countButterflies(environment.text), 15);
  assert.equal(countButterflies(visit.text), 15);
  assert.match(experience.text, /section-butterfly--experience-tour/);
  assert.match(environment.text, /section-butterfly--environment-main/);
  assert.match(home.text, /butterfly--slot-0/);
  assert.match(home.text, /butterfly--slot-7/);
  assert.doesNotMatch(home.text, /section-butterfly[^>]*\sstyle=/);
  assert.doesNotMatch(home.text, /ambient-butterfly/);
  assert.doesNotMatch(css, /offset-path:/);
  assert.match(css, /\.section-butterfly\.butterfly--slot-0/);
  assert.doesNotMatch(css, /ambient-glow|ambient-canopy|forest-drift/);
  assert.match(css, /html\[data-motion='reduced'\] \.section-butterfly__flight/);
});

test('las leyendas tecnicas de medios no se muestran en la interfaz', async () => {
  const [home, experience, environment] = await Promise.all([
    request(app).get('/'),
    request(app).get('/experiencia'),
    request(app).get('/conservacion'),
  ]);

  assert.doesNotMatch(home.text, /<figcaption[^>]*>Imagen ilustrativa:/);
  assert.doesNotMatch(experience.text, /experiencia-immersive__hero-caption/);
  assert.doesNotMatch(environment.text, /<figcaption[^>]*>Imagen ilustrativa:/);
});

test('la densidad de mariposas y los catálogos no conservan parámetros legacy inactivos', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'public', 'css', 'base.css'), 'utf8');
  const templatesDir = path.join(__dirname, '..', 'src', 'views', 'pages');
  const templates = fs
    .readdirSync(templatesDir)
    .filter((file) => file.endsWith('.ejs'))
    .map((file) => fs.readFileSync(path.join(templatesDir, file), 'utf8'))
    .join('\n');

  assert.doesNotMatch(css, /\.butterfly--(?:small|medium|large)\s*\{/);
  assert.doesNotMatch(templates, /butterflies: \['[^']+ butterfly--/);

  for (const locale of ['es', 'en']) {
    const pages = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'src', 'locales', locale, 'pages.json'), 'utf8'),
    );
    assert.equal(pages.experience.immersive.caption, undefined);
    assert.equal(pages.butterflies.gallery.captions, undefined);
    assert.equal(pages.gallery.items.captions, undefined);
    assert.equal(pages.environment.main.illustrationCaption, undefined);
  }
});

test('el sitemap expone exactamente las catorce URLs públicas localizadas', async () => {
  const res = await request(app).get('/sitemap.xml');
  const locations = [...res.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expected = LOCALIZED_ROUTES.flatMap(([spanishPath, englishPath]) => [
    `https://jardindemariposaslapaz.com${spanishPath}`,
    `https://jardindemariposaslapaz.com${englishPath}`,
  ]);
  assert.deepEqual(locations.sort(), expected.sort());
});
