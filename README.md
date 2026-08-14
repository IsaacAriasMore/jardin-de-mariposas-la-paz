# Jardín de Mariposas La Paz

Sitio web oficial de **Jardín de Mariposas La Paz** — mariposario en **Bajo La Paz, San Ramón, Alajuela, Costa Rica**.

> **Estado actual: candidato de lanzamiento.**
> El sitio incluye experiencia bilingüe, tema claro/oscuro, controles globales de movimiento, medios responsivos y comprobaciones de integridad de release. Ver `MEDIA-CATALOG.md` para procedencia y pendientes de derechos de los medios.

---

## Objetivo

Página web pública del mariposario que permita a visitantes potenciales:

- Descubrir qué es el mariposario y dónde queda (ubicación, horario, contacto).
- Ver las mariposas, la experiencia de visita y las acciones de conservación.
- Revisar fotografías reales del mariposario junto con material fotográfico y audiovisual editorial de apoyo.
- Contactar por WhatsApp y consultar el precio de entrada.

## Stack

| Capa             | Tecnología                                                               |
| ---------------- | ------------------------------------------------------------------------ |
| Runtime          | Node.js ≥ 22.9                                                           |
| Servidor         | Express 4                                                                |
| Templates        | EJS + `express-ejs-layouts`                                              |
| Markup           | HTML5 semántico                                                          |
| Estilos          | CSS moderno con tokens personalizados (sin framework; sin paso de build) |
| Scripts frontend | JavaScript vanilla (tema, idioma, movimiento y carga de video)           |
| Seguridad        | Helmet                                                                   |
| Tests            | `node:test` (runner nativo) + Supertest                                  |
| Calidad          | ESLint (flat config) + Prettier                                          |

Decisiones de la Fase 1:

- **CSS custom con tokens en OKLCH en lugar de Tailwind**: el proyecto es Express + EJS sin build step; las skills de diseño consultadas recomiendan no añadir dependencias solo por estar disponibles. La base (`public/css/base.css`) define tokens semánticos (color, tipografía, radio, movimiento) listos para la identidad visual de la Fase 2.
- **Sin dotenv**: Node 22+ carga `.env` nativamente (`process.loadEnvFile`). Un archivo `.env` es opcional; sin él la app usa los valores por defecto.
- **Sin MySQL todavía**: la arquitectura deja espacio para especies, artículos, galería, FAQ, configuración y panel admin (ver _Evolución futura_).

## Arquitectura (MVC)

```
├── .env.example              # Variables de entorno documentadas
├── .gitignore
├── eslint.config.js
├── package.json
├── public/
│   ├── css/base.css          # Tokens, tema y sistema visual compartido
│   ├── favicon.svg
│   └── media/                # Medios optimizados servidos por la web (ignorados en Git)
├── src/
│   ├── app.js                # Fábrica de la app Express (importable en tests)
│   ├── server.js             # Arranque del servidor
│   ├── config/
│   │   ├── index.js          # Validación de PORT, SITE_URL y URLs externas
│   │   └── business.js       # FUENTE ÚNICA de datos del negocio
│   ├── controllers/
│   │   ├── pages.controller.js  # Definición + handlers de las páginas
│   │   └── seo.controller.js    # robots.txt y sitemap.xml
│   ├── middleware/
│   │   ├── error-handlers.js    # 404 + error centralizado (500)
│   │   └── view-locals.js       # Datos compartidos con todas las vistas
│   ├── i18n/                 # Inicialización, idiomas y rutas localizadas
│   ├── locales/               # Catálogos es/en versionados
│   ├── routes/index.js       # Mapa de rutas oficiales
│   ├── utils/
│   │   ├── seo.js            # Metadata por página (title/descripción/OG/canonical)
│   │   └── whatsapp.js       # Enlaces wa.me codificados (teléfono principal)
│   └── views/
│       ├── layout.ejs
│       ├── partials/         # head, navbar, footer
│       └── pages/            # 7 páginas + 404 + error
└── tests/
    ├── app.test.js           # Rutas 200, 404, robots, sitemap, SEO/H1
    └── config.test.js        # Defaults de entorno y datos del negocio
```

Principio: **el negocio se configura una sola vez** (`src/config/business.js`) y todo lo demás (navbar, footer, contacto, WhatsApp, sitemap) se deriva de ahí. Las views no contienen lógica de negocio.

## Instalación

```bash
npm install
```

## Ejecución local

```bash
npm run dev      # Desarrollo con recarga automática (node --watch)
npm start        # Producción local
```

Abrir `http://localhost:3000`.

## Variables de entorno

Ver `.env.example`. Las más relevantes:

| Variable          | Default                       | Descripción                                             |
| ----------------- | ----------------------------- | ------------------------------------------------------- |
| `NODE_ENV`        | `development`                 | `production` oculta errores y aplica caché estática     |
| `PORT`            | `3000`                        | Puerto HTTP                                             |
| `SITE_URL`        | URL provisional del negocio   | URL pública; obligatoria y HTTPS en `production`        |
| `GOOGLE_MAPS_URL` | URL del Plus Code provisional | Enlace de mapa desacoplado; se reemplaza por el oficial |

Copie el archivo solo si necesita cambiar valores: `Copy-Item .env.example .env` (o `cp` en Linux/macOS). `.env` nunca se versiona.

## Scripts

```bash
npm run dev           # Desarrollo con recarga
npm run test          # Tests estructurales (node:test)
npm run lint          # ESLint
npm run format        # Prettier (escribe)
npm run format:check  # Prettier (verifica)
npm run release:check # Referencias, tamaños y hashes de medios publicados
npm run release:build # Ensambla el paquete de entrega en release/
```

## Rutas

| Ruta                   | Página                                                         |
| ---------------------- | -------------------------------------------------------------- |
| `/`                    | Inicio                                                         |
| `/nuestro-mariposario` | Nuestro Mariposario (ruta oficial; `nuestro-jardin` NO se usa) |
| `/mariposas`           | Mariposas                                                      |
| `/experiencia`         | Tour por el Mariposario                                        |
| `/conservacion`        | Mariposas y su entorno                                         |
| `/galeria`             | Galería                                                        |
| `/visitanos`           | Visítanos (ubicación, horario, contacto)                       |
| `/robots.txt`          | Rutas de rastreo + sitemap                                     |
| `/sitemap.xml`         | Sitemap de páginas públicas                                    |
| _cualquier otra_       | 404 personalizado (noindex)                                    |

### Guías (reservada para una fase futura)

`/guias` está **reservada** para futuros artículos de guía, pero actualmente **no existe como ruta pública**:

- Responde `404` (cae en el 404 personalizado, sin redirect ni página vacía).
- No está en la navegación ni en el `sitemap.xml` (excluida de `PUBLIC_ROUTES`).
- Se habilitará cuando existan guías con contenido real; no se inventa contenido.
- La arquitectura futura contempla:

  - `/guias` — índice de guías
  - `/guias/:slug` — detalle de una guía

Evolución prevista sin rehacer el proyecto: `/mariposas/:slug` (detalle de especie) y la sección _Guías_ (los controladores y vistas se agregan cuando existan datos reales; ver `PRODUCT.md`).

## SEO

- `title` + `meta description` + `canonical` + Open Graph por página, generados en `src/utils/seo.js` a partir de `SITE_URL` (no hay URLs hardcodeadas).
- Un único `H1` por página.
- `robots.txt` y `sitemap.xml` dinámicos.
- `noindex` automático en 404 y error.
- JSON-LD `LocalBusiness` en `/visitanos` (datos solo de `business.js` + `config`), CSP explícita con nonce y `frame-src` para el embed de Google Maps.
- OG/Twitter, canonical, sitemap y JSON-LD se construyen desde la configuración y los catálogos localizados.

## Idioma, tema y movimiento

- Español e inglés comparten la misma estructura de rutas y catálogos en `src/locales/`; la paridad de claves se valida en tests.
- El tema se guarda en `localStorage` y actualiza `meta[name="theme-color"]` sin recarga.
- El control global de movimiento respeta la preferencia del visitante y `prefers-reduced-motion`; los videos decorativos no se cargan ni reproducen cuando el movimiento está reducido.

## Validación de release

Antes de una entrega, ejecutar `npm test`, `npm run lint`, `npm run format:check`, `npm run release:check` y `npm run release:build`.

`release:check` verifica que toda referencia publicada a `/media/` exista y genera `release/media-manifest.json` con hashes SHA-256. `release:build` copia únicamente el runtime, código, medios publicados y scripts necesarios a `release/jardin-de-mariposas/`. La carpeta `release/` es un artefacto local ignorado por Git.

## WhatsApp

Todo enlace se genera con `src/utils/whatsapp.js` (helper único, URL codificada, teléfono principal desde `business.js`). Las vistas nunca repiten URLs manualmente.

## Assets originales (`Fotos/`, `Videos/`, `GUIA-DE-USO.md`, `MAPEO-NOMBRES-ORIGINALES.txt`)

- **Son masters locales y NO se versionan en Git** (ver `.gitignore`): los videos 4K suman ~95 MB y no deben entrar al historial.
- **No se modifican, no se sobrescriben, no se convierten destructivamente.**
- Para la web se publican copias optimizadas en `public/media/`; sus referencias, tamaño y hash se validan con `npm run release:check`. Ver `GUIA-DE-USO.md` y `MEDIA-CATALOG.md`.
- Si más adelante se desea versionar los masters, se recomienda Git LFS y quitar las líneas `Fotos/` / `Videos/` del `.gitignore`.

## Evolución futura

- **MySQL** (vía `mysql2` + un pool en `src/config` o `src/services`): especies, artículos/guías, galería administrable, FAQ, configuración y panel administrativo. Los módulos `models/`, `repositories/`, `validators/` y `middleware/` de panel se crearán cuando haya uso real, evitando carpetas vacías.
- **Dominio definitivo**: se compra y se fija en `SITE_URL` (reemplaza provisional `jardindemariposaslapaz.com`).
- **Enlace oficial de Google Maps**: se define en `GOOGLE_MAPS_URL` (provisionalmente el Plus Code).
- La evolución futura se limita a contenido y capacidades confirmadas del negocio; no se deben publicar especies, precios, testimonios ni derechos de uso no verificados.

## Publicación en Hostinger

1. Ejecutar las validaciones de release y subir el contenido de `release/jardin-de-mariposas/`, sin `node_modules/` ni `.env`.
2. Crear `.env` con `NODE_ENV=production`, `PORT` y `SITE_URL=https://<dominio>`; el arranque falla si `SITE_URL` no es HTTPS válido.
3. Ejecutar `npm ci --omit=dev` y arrancar con `npm start` (o `pm2 start src/server.js`).
4. Configurar proxy inverso HTTPS hacia `http://localhost:<PORT>`.
5. Confirmar los pendientes de procedencia/derechos marcados en `MEDIA-CATALOG.md` antes de publicar los medios.

## Licencia

Proyecto privado del negocio (`UNLICENSED`). Los materiales fotográficos y de video pertenecen a sus autores originales (ver `MAPEO-NOMBRES-ORIGINALES.txt`).
