// Genera los assets optimizados de la web en public/media/ a partir de los
// masters de Fotos/ y Videos/. Los origenes NUNCA se modifican.
//
// Fotos  -> WebP + JPEG (640w y 1280w, sin upscaling)
// Videos -> copia de desarrollo bajo public/media/videos/ con el nombre del
//           archivo de producción (gitignored). En producción se generan
//           versiones optimizadas con FFmpeg (ver README.md) en las mismas
//           rutas, sin cambiar el marcado.
//
// Uso: npm run media

import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve('.');
const SRC_IMG = path.join(ROOT, 'Fotos');
const SRC_VID = path.join(ROOT, 'Videos');
const OUT_IMG = path.join(ROOT, 'public', 'media', 'img');
const OUT_VID = path.join(ROOT, 'public', 'media', 'videos');
const OUT_POSTERS = path.join(ROOT, 'public', 'media', 'posters');

const SIZES = [640, 1280];
const WEBP_QUALITY = 78;
const JPEG_QUALITY = 80;

// Pares: master en Fotos/ -> prefijo de salida en public/media/img/
const PHOTOS = [
  'mariposa-azul-hoja-tropical',
  'mariposa-azul-pequena-flor-violeta',
  'mariposa-cola-larga-volando-flores',
  'mariposa-negra-amarilla-flor-roja',
  'mariposa-sobre-flor-amarilla',
  'grupo-mariposas-naranjas-en-planta',
  'mariposas-naranjas-fondo-natural',
  'mariposas-naranjas-en-vuelo',
];

// Videos: master en Videos/ -> nombre de producción en public/media/videos/
const VIDEOS = [
  ['mariposa-flor-amarilla-hero-4k.mp4', 'mariposa-flor-amarilla-hero-1080p.mp4'],
  ['mariposas-entre-hojas-vertical-4k.mp4', 'mariposas-entre-hojas-vertical-1080.mp4'],
  ['mariposa-flores-tropicales-detalle.mp4', 'mariposa-flores-tropicales-1080p.mp4'],
];

async function processPhotos() {
  await mkdir(OUT_IMG, { recursive: true });
  const manifest = [];

  for (const name of PHOTOS) {
    const src = path.join(SRC_IMG, `${name}.jpg`);
    const image = sharp(src);
    const { width, height } = await image.metadata();

    for (const size of SIZES) {
      const targetWidth = Math.min(size, width);
      const resized = image.clone().resize({ width: targetWidth, withoutEnlargement: true });

      await resized
        .rotate()
        .webp({ quality: WEBP_QUALITY })
        .toFile(path.join(OUT_IMG, `${name}-${size}.webp`));
      await resized
        .rotate()
        .jpeg({ quality: JPEG_QUALITY, progressive: true })
        .toFile(path.join(OUT_IMG, `${name}-${size}.jpg`));
    }

    manifest.push({ name, width, height, out: `${name}-${SIZES.join('/')}.webp+jpg` });
    console.log(`[img] ${name}.jpg ${width}x${height} -> ${name}-{640,1280}.{webp,jpg}`);
  }

  return manifest;
}

// Posters de desarrollo derivados de las fotografías (mientras no se genere
// el frame real del video con FFmpeg en producción).
async function processPosters() {
  await mkdir(OUT_POSTERS, { recursive: true });
  const posters = [
    ['mariposa-azul-hoja-tropical', 'hero-desktop.jpg'],
    ['mariposa-azul-hoja-tropical', 'hero-mobile.jpg'],
  ];

  for (const [name, out] of posters) {
    const src = path.join(SRC_IMG, `${name}.jpg`);
    await sharp(src)
      .rotate()
      .resize({ width: 1280, withoutEnlargement: true })
      .jpeg({ quality: 78, progressive: true })
      .toFile(path.join(OUT_POSTERS, out));
    console.log(`[poster] ${out}`);
  }
}

// Copias de desarrollo de los videos (masters 4K, NO optimizados, gitignored).
// En producción se reemplazan por versiones FFmpeg del mismo nombre.
async function copyDevVideos() {
  await mkdir(OUT_VID, { recursive: true });

  for (const [master, prodName] of VIDEOS) {
    const src = path.join(SRC_VID, master);
    const dest = path.join(OUT_VID, prodName);
    await copyFile(src, dest);
    console.log(`[video-dev] ${master} -> ${prodName} (copia de desarrollo)`);
  }
}

async function main() {
  const manifest = await processPhotos();
  await processPosters();
  await copyDevVideos();

  console.log(
    `\nTotales: ${manifest.length} fotos procesadas, ${VIDEOS.length} videos copiados (dev).`,
  );
  console.log('Nota: los masters en Fotos/ y Videos/ quedan intactos.');
}

main().catch((err) => {
  console.error('[media] error:', err);
  process.exit(1);
});
