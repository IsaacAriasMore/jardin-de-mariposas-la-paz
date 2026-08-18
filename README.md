# Jardín de Mariposas La Paz

Sitio web estático oficial de **Jardín de Mariposas La Paz**, en Bajo La Paz, San Ramón, Alajuela, Costa Rica.

## Arquitectura final

El sitio publicado vive completamente en `site/` y contiene HTML, CSS, JavaScript de navegador, SVG, imágenes, videos, XML y `.htaccess`. No requiere Node.js, npm, Express, EJS, i18next, Helmet, PM2 ni un proceso de servidor.

Las 22 rutas públicas, en español e inglés, están materializadas como HTML independiente. Las URLs limpias se sirven mediante los directorios `ruta/index.html`; `site/404.html` es la página de error personalizada.

## Vista previa local sin Node

Con Python disponible:

```powershell
python -m http.server 4173 --directory site
```

Después, abre `http://127.0.0.1:4173/`. El servidor de preview solo sirve archivos; no forma parte del runtime publicado.

## Publicación en Hostinger

Sube **todo el contenido de `site/`**, incluidos los archivos ocultos, directamente a `public_html/`. El archivo `site/.htaccess` debe quedar en la raíz de `public_html/`; es necesario para URLs limpias, 404, headers, CSP, caché y compresión cuando los módulos de Apache estén disponibles.

No subas `src/`, `public/`, `dist/`, `scripts/`, `tests/`, `Fotos/`, `Videos/`, `node_modules/`, archivos `.env` ni la documentación interna.

## Rutas

Español: `/`, `/experiencia`, `/nuestro-mariposario`, `/mariposas`, `/galeria`, `/conservacion`, `/visitanos`, `/privacidad`, `/terminos`, `/cookies`, `/derechos-imagen`.

English: `/en`, `/en/tour`, `/en/our-butterfly-garden`, `/en/butterflies`, `/en/gallery`, `/en/butterflies-and-their-environment`, `/en/visit-us`, `/en/privacy`, `/en/terms`, `/en/cookies`, `/en/image-rights`.

## Verificación

La migración fue validada antes de retirar Node con 49/49 tests, lint, formato, integridad de medios, 22 rutas, 23 HTML incluyendo 404, JSON-LD válido, CSP estática con hashes y cero enlaces internos rotos. La auditoría npm quedó no verificada cuando el endpoint de advisories no respondió.

Las auditorías de procedencia y derechos permanecen en [MEDIA-CATALOG.md](MEDIA-CATALOG.md). La revisión legal previa al lanzamiento está en [PRE-LAUNCH-CHECKLIST.md](PRE-LAUNCH-CHECKLIST.md).

## Materiales fuente

`Fotos/` y `Videos/` son masters locales ignorados por Git. No forman parte del paquete que se publica. La documentación de nombres y procedencia se conserva fuera de `site/`.
