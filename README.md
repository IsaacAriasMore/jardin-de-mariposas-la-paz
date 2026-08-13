# Jardín de Mariposas La Paz

Sitio web oficial de **Jardín de Mariposas La Paz** — mariposario en **Bajo La Paz, San Ramón, Alajuela, Costa Rica**.

> **Estado actual: Fase 1 — arquitectura, configuración y scaffolding.**
> Las páginas tienen estructura y contenido semilla (correcto y sin datos inventados), pero el diseño visual completo se desarrolla en la Fase 2. Ver `GUIA-DE-USO.md` para el uso de los materiales fotográficos y de video.

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
| Scripts frontend | JavaScript vanilla (a incorporar cuando haya interacción)                |
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
│   ├── css/base.css          # Tokens + estilos base (paleta provisional)
│   ├── favicon.svg
│   └── media/                # Medios optimizados servidos por la web (ignorados en Git)
├── src/
│   ├── app.js                # Fábrica de la app Express (importable en tests)
│   ├── server.js             # Arranque del servidor
│   ├── config/
│   │   ├── index.js          # Entorno: PORT, SITE_URL, GOOGLE_MAPS_URL
│   │   └── business.js       # FUENTE ÚNICA de datos del negocio
│   ├── controllers/
│   │   ├── pages.controller.js  # Definición + handlers de las páginas
│   │   └── seo.controller.js    # robots.txt y sitemap.xml
│   ├── middleware/
│   │   ├── error-handlers.js    # 404 + error centralizado (500)
│   │   └── view-locals.js       # Datos compartidos con todas las vistas
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

| Variable          | Default                              | Descripción                                             |
| ----------------- | ------------------------------------ | ------------------------------------------------------- |
| `NODE_ENV`        | `development`                        | `production` oculta errores y aplica caché estática     |
| `PORT`            | `3000`                               | Puerto HTTP                                             |
| `SITE_URL`        | `https://jardindemariposaslapaz.com` | URL pública (dominio definitivo pendiente de compra)    |
| `GOOGLE_MAPS_URL` | URL del Plus Code provisional        | Enlace de mapa desacoplado; se reemplaza por el oficial |

Copie el archivo solo si necesita cambiar valores: `Copy-Item .env.example .env` (o `cp` en Linux/macOS). `.env` nunca se versiona.

## Scripts

```bash
npm run dev           # Desarrollo con recarga
npm run test          # Tests estructurales (node:test)
npm run lint          # ESLint
npm run format        # Prettier (escribe)
npm run format:check  # Prettier (verifica)
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
- Pendiente (Fase 2): imagen OG con el material real y esquema `Organization`.

## WhatsApp

Todo enlace se genera con `src/utils/whatsapp.js` (helper único, URL codificada, teléfono principal desde `business.js`). Las vistas nunca repiten URLs manualmente.

## Assets originales (`Fotos/`, `Videos/`, `GUIA-DE-USO.md`, `MAPEO-NOMBRES-ORIGINALES.txt`)

- **Son masters locales y NO se versionan en Git** (ver `.gitignore`): los videos 4K suman ~95 MB y no deben entrar al historial.
- **No se modifican, no se sobrescriben, no se convierten destructivamente.**
- Para la web se generan **copias optimizadas** en `public/media/` con `npm run media` (escritorio 1920×1080, móvil 1080×1920, MP4 H.264 y WebM si es posible, `autoplay muted loop playsinline`, sin audio para fondos automáticos). Ver `GUIA-DE-USO.md`.
- Si más adelante se desea versionar los masters, se recomienda Git LFS y quitar las líneas `Fotos/` / `Videos/` del `.gitignore`.

## Evolución futura

- **MySQL** (vía `mysql2` + un pool en `src/config` o `src/services`): especies, artículos/guías, galería administrable, FAQ, configuración y panel administrativo. Los módulos `models/`, `repositories/`, `validators/` y `middleware/` de panel se crearán cuando haya uso real, evitando carpetas vacías.
- **Dominio definitivo**: se compra y se fija en `SITE_URL` (reemplaza provisional `jardindemariposaslapaz.com`).
- **Enlace oficial de Google Maps**: se define en `GOOGLE_MAPS_URL` (provisionalmente el Plus Code).
- **Diseño completo** (Fase 2): paleta, tipografías, hero con video, galería, JSON-LD y optimización de medios.

## Publicación en Hostinger

1. Subir el proyecto (sin `node_modules/` ni `.env`) y ejecutar `npm install`.
2. Crear `.env` con `NODE_ENV=production`, `PORT` y `SITE_URL=https://<dominio>`.
3. Iniciar con `npm start` (o `pm2 start src/server.js`).
4. Proxy inverso (Apache/nginx de Hostinger) hacia `http://localhost:<PORT>` + SSL/HTTPS.
5. Los masters deben generarse optimizados en `public/media/` antes de subir (no subir los 4K).

## Licencia

Proyecto privado del negocio (`UNLICENSED`). Los materiales fotográficos y de video pertenecen a sus autores originales (ver `MAPEO-NOMBRES-ORIGINALES.txt`).
