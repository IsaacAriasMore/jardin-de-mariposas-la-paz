# Guía de uso del material — Jardín de Mariposas

Clasificación completa (stock / real / pendiente / HOLD), dimensiones y licencias:
`MEDIA-CATALOG.md`. Mapeo de nombres masters -> derivados: `MAPEO-NOMBRES-ORIGINALES.txt`.

## Pipeline de medios

- Generar derivados: `npm run media` (Sharp para fotos; FFmpeg para videos y posters).
- Los masters (`Fotos/`, `Videos/`) nunca se tocan; los derivados van a `public/media/`.
- Binarios: se usa `ffmpeg-static` y `@derhuerst/ffprobe-static` (devDependencies),
  con override vía `FFMPEG_BIN` / `FFPROBE_BIN` o el binario del PATH.
- Formato web: imágenes WebP (+ JPEG fallback) a 640/1280/1920 px sin upscaling
  (las fuentes menores a 640 px generan un derivado a 480w + el ancho natural);
  videos MP4 H.264 (yuv420p, faststart, sin audio) y WebM VP9 solo cuando es menor
  que el MP4; posters extraídos de un frame real de cada video.
- Los videos del hero se sirven como `autoplay muted loop playsinline`; por eso se
  elimina el audio en todos los derivados.

> Para producción (Hostinger) se genera `public/media/` ANTES del deployment.
> No se sirven masters desde `public/` ni videos 4K.

## Prioridad recomendada

### HERO PRINCIPAL
**Video (desktop):** `mariposa-flor-amarilla-hero-1080p.mp4` (WebM: `.webm`)
- Horizontal 16:9, 4K original, fondo suave, mariposa sobre flor amarilla.
- Poster: `mariposa-flor-amarilla-hero.jpg` (frame real del video).

**Hero móvil:** `mariposas-entre-hojas-vertical-1080.mp4` (WebM: `.webm`)
- Vertical 9:16, ideal para sustituir el horizontal en pantallas móviles.
- Poster: `mariposas-entre-hojas-vertical.jpg`.

**Imagen de respaldo / portada (fallback, OG):** `mariposa-azul-hoja-tropical`
- La más impactante del grupo; azul intenso sobre verde tropical.

## SECCIÓN “NUESTRAS MARIPOSAS” / ESPECIES DESTACADAS
- `mariposa-negra-amarilla-flor-roja` — perfil claro sobre flor roja; tarjeta de especie.
- `mariposa-azul-pequena-flor-violeta` — macro limpio; variedad de tamaño y color.
- `mariposa-azul-hoja-tropical` — protagonista visual; puede repetirse con otro recorte.

> Antes de mostrar nombres científicos o de especie, confirmar la identificación.
> Los nombres de archivo son descriptivos y no afirman especies.

## SECCIÓN “LA EXPERIENCIA” / “VIVE EL MARIPOSARIO”
- **Video:** `mariposa-flores-tropicales-1080p.mp4` (solo MP4; el WebM no reducía).
  Plano cercano de vegetación y flores; funciona dentro de la página, no como hero.
  Poster: `mariposa-flores-tropicales-detalle.jpg`.
- **Imagen:** `mariposa-cola-larga-volando-flores` — comportamiento y movimiento.

## SECCIÓN NATURALEZA / FLORA / POLINIZACIÓN
- `mariposa-sobre-flor-amarilla` — relación mariposa-flor muy clara; bloque con texto.

## GALERÍA
- `grupo-mariposas-naranjas-en-planta` — vertical, varias mariposas; masonry.
- `mariposas-naranjas-fondo-natural` — vertical oscuro; rompe la galería clara.
- `mariposas-naranjas-en-vuelo` — artística, con movimiento; pieza decorativa.

## AUTENTICIDAD DEL LUGAR (Visítanos / contacto)
- `mariposario-bajo-la-paz-01` y `mariposario-bajo-la-paz-02` — fotos REALES del
  negocio (Facebook): interior con sendero y vegetación; estructura con crisálidas.
  Idóneas donde importe mostrar el lugar de verdad.

## Videos de apoyo (STOCK, contenido pendiente de confirmar)
- `pexels-13619427-1080p` (horizontal) y `pexels-15160751-1080` (vertical):
  ambiente/flora o fondos de sección. Confirmar contenido visual antes de
  acompañarlos de textos sobre "nuestro mariposario".

## Reglas
- Las fotos STOCK no deben acompañarse de textos como "en nuestro jardín" o
  "así se ven en nuestro mariposario". Los videos actuales son STOCK: no deben
  presentarse como grabados en el mariposario.
- `482005509_*.jpg` está en HOLD (menores/personas): no integrar a la web.
- `505011602_*.jpg`, `505835868_*.jpg`, `506940932_*.jpg`, `506941578_*.jpg`,
  `507088230_*.jpg` y `508109705_*.jpg` están PENDIENTES DE CONFIRMAR PROCEDENCIA:
  no integrar ni generar derivados hasta confirmación explícita del propietario.
  Las 4 con personas requieren además autorización de publicación (slugs propuestos
  en el MAPEO).
- `480999978_*.jpg` está PENDIENTE: no integrar hasta confirmar procedencia.
- Las imágenes menores a 640 px (p. ej. `505835868_*.jpg`, 528w) generan solo
  derivados a 480w + ancho natural: nunca se agrandan ni se declaran mayores.
- No cargar los masters 4K en la web: usar siempre los derivados de `public/media/`.
