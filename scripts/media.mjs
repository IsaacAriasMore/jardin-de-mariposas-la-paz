// Genera los derivados optimizados de la web en public/media/ a partir de los
// masters de Fotos/ y Videos/. Los masters NUNCA se modifican.
//
// Fotos  -> WebP + JPEG (640w, 1280w y 1920w cuando la fuente lo permite,
//           sin upscaling, manteniendo la proporción).
// Videos -> MP4 H.264 (yuv420p + faststart) y WebM VP9, sin audio, limitados
//           a 1920x1080 (horizontal) o 1080x1920 (vertical), sin upscaling.
//           Se usa el frame real del video para el poster (public/media/posters/).
//
// Binarios FFmpeg: se resuelven en este orden:
//   1) variable de entorno FFMPEG_BIN / FFPROBE_BIN
//   2) paquete ffmpeg-static / @derhuerst/ffprobe-static (devDependencies)
//   3) binario ffmpeg / ffprobe disponible en el PATH
// El pipeline es solo de generación: nunca se ejecuta FFmpeg en runtime.
//
// Clasificaciones (ver MAPEO-NOMBRES-ORIGINALES.txt y MEDIA-CATALOG.md):
//   - HOLD: no se generan derivados (autorización de publicación pendiente).
//   - PENDIENTE: no se generan derivados hasta confirmar procedencia/contenido.
//
// Uso: npm run media
/* eslint-disable no-console -- script de CLI: el log por consola es el objetivo */

import { createRequire } from 'node:module';
import { mkdir, stat, rm, rename } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);
const EXEC_OPTS = { maxBuffer: 32 * 1024 * 1024 };

const ROOT = path.resolve('.');
const SRC_IMG = path.join(ROOT, 'Fotos');
const SRC_VID = path.join(ROOT, 'Videos');
const OUT_IMG = path.join(ROOT, 'public', 'media', 'img');
const OUT_VID = path.join(ROOT, 'public', 'media', 'videos');
const OUT_POSTERS = path.join(ROOT, 'public', 'media', 'posters');

// Resolución de binarios: env var -> paquete estático -> PATH.
function resolveBinary(envKey, pkgName, fallback) {
  if (process.env[envKey]) return process.env[envKey];
  try {
    const p = require(pkgName);
    if (typeof p === 'string' && p.length) return p;
  } catch {
    // Paquete ausente: se usa el binario del PATH.
  }
  return fallback;
}

const FFMPEG = resolveBinary('FFMPEG_BIN', 'ffmpeg-static', 'ffmpeg');
const FFPROBE = resolveBinary('FFPROBE_BIN', '@derhuerst/ffprobe-static', 'ffprobe');

const SIZES = [640, 1280, 1920];
const WEBP_QUALITY = 78;
const JPEG_QUALITY = 80;
const CRF = 25;
const VP9_CRF = 36;
// Un WebM solo se conserva si es claramente menor que su MP4 (si no, se
// elimina: servir el formato más grande sería contraproducente).
const WEBM_MIN_SAVINGS = 0.1;
// Límite de hilos para x264/libvpx: el autodetección de ffmpeg puede resultar
// inestable en máquinas con muchos procesadores lógicos (crash aleatorio).
const THREADS = Math.max(1, Math.min(8, os.cpus().length));

// Fotografías aprobadas (src en Fotos/ -> prefijo del derivado en public/media/img/).
// Se excluyen los assets HOLD y PENDIENTE: ver MEDIA-CATALOG.md.
const PHOTOS = [
  { src: 'mariposa-azul-hoja-tropical.jpg', seo: 'mariposa-azul-hoja-tropical' },
  { src: 'mariposa-azul-pequena-flor-violeta.jpg', seo: 'mariposa-azul-pequena-flor-violeta' },
  { src: 'mariposa-cola-larga-volando-flores.jpg', seo: 'mariposa-cola-larga-volando-flores' },
  { src: 'mariposa-negra-amarilla-flor-roja.jpg', seo: 'mariposa-negra-amarilla-flor-roja' },
  { src: 'mariposa-sobre-flor-amarilla.jpg', seo: 'mariposa-sobre-flor-amarilla' },
  { src: 'grupo-mariposas-naranjas-en-planta.jpg', seo: 'grupo-mariposas-naranjas-en-planta' },
  { src: 'mariposas-naranjas-fondo-natural.jpg', seo: 'mariposas-naranjas-fondo-natural' },
  { src: 'mariposas-naranjas-en-vuelo.jpg', seo: 'mariposas-naranjas-en-vuelo' },
  {
    src: '118407196_1677795549050644_2796371698994772266_n.jpg',
    seo: 'mariposario-bajo-la-paz-01',
  },
  {
    src: '119239978_1695778757252323_8903119856060690491_n.jpg',
    seo: 'mariposario-bajo-la-paz-02',
  },
  {
    src: 'pexels-abdullah-elgumus-917947069-38000621.jpg',
    seo: 'pexels-abdullah-elgumus-917947069-38000621',
  },
  {
    src: 'pexels-joerg-hartmann-626385254-38778510.jpg',
    seo: 'pexels-joerg-hartmann-626385254-38778510',
  },
];

// Videos aprobados. kind: 'desktop' (máx 1920 de ancho) | 'vertical' (máx 1920 de alto).
// fps null = conservar el del master. El poster se extrae de un frame real.
const VIDEOS = [
  {
    src: 'mariposa-flor-amarilla-hero-4k.mp4',
    out: 'mariposa-flor-amarilla-hero-1080p.mp4',
    kind: 'desktop',
    fps: null,
    poster: 'mariposa-flor-amarilla-hero',
    posterTime: 3,
  },
  {
    src: 'mariposas-entre-hojas-vertical-4k.mp4',
    out: 'mariposas-entre-hojas-vertical-1080.mp4',
    kind: 'vertical',
    fps: 30,
    poster: 'mariposas-entre-hojas-vertical',
    posterTime: 2,
  },
  {
    src: 'mariposa-flores-tropicales-detalle.mp4',
    out: 'mariposa-flores-tropicales-1080p.mp4',
    kind: 'desktop',
    fps: null,
    poster: 'mariposa-flores-tropicales-detalle',
    posterTime: 4,
  },
  {
    src: '13619427_1920_1080_30fps.mp4',
    out: 'pexels-13619427-1080p.mp4',
    kind: 'desktop',
    fps: null,
    poster: 'pexels-13619427-ambiente',
    posterTime: 5,
  },
  {
    src: '15160751_1080_1920_30fps.mp4',
    out: 'pexels-15160751-1080.mp4',
    kind: 'vertical',
    fps: null,
    poster: 'pexels-15160751-vertical',
    posterTime: 3,
  },
];

// Detecta encoders disponibles (libvpx-vp9 para WebM, libwebp para posters).
async function availableEncoders() {
  try {
    const { stdout } = await execFileAsync(FFMPEG, ['-hide_banner', '-encoders'], {
      ...EXEC_OPTS,
      encoding: 'utf8',
    });
    return new Set(
      stdout
        .split('\n')
        .map((l) => l.trim().split(/\s+/)[1])
        .filter(Boolean),
    );
  } catch {
    return new Set();
  }
}

function mb(bytes) {
  return (bytes / 1048576).toFixed(2);
}

// Reemplazo atómico: evita que una escritura sobre un destino existente quede
// a medias (bloqueo de archivo en Windows) y deje un derivado corrupto.
async function replaceFile(tmp, dest) {
  await rm(dest, { force: true });
  await rename(tmp, dest);
}

async function fileSize(file) {
  try {
    return (await stat(file)).size;
  } catch {
    return 0;
  }
}

async function dirSize(dir) {
  const { readdir } = await import('node:fs/promises');
  let total = 0;
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    total += entry.isDirectory() ? await dirSize(full) : (await fileSize(full)) || 0;
  }
  return total;
}

async function processPhotos() {
  await mkdir(OUT_IMG, { recursive: true });
  console.log('\n=== FOTOS ===');

  for (const photo of PHOTOS) {
    const src = path.join(SRC_IMG, photo.src);
    if (!(await fileSize(src))) {
      console.log(`[skip] master no encontrado: ${photo.src}`);
      continue;
    }
    const image = sharp(src);
    const { width, height } = await image.metadata();

    for (const size of SIZES) {
      if (size > width) continue; // Sin upscaling.
      const resized = image.clone().resize({ width: size, withoutEnlargement: true });
      const stem = `${photo.seo}-${size}`;
      await resized
        .rotate()
        .webp({ quality: WEBP_QUALITY })
        .toFile(path.join(OUT_IMG, `${stem}.webp`));
      await resized
        .rotate()
        .jpeg({ quality: JPEG_QUALITY, progressive: true })
        .toFile(path.join(OUT_IMG, `${stem}.jpg`));
    }

    console.log(
      `[img] ${photo.src} ${width}x${height} -> ${photo.seo}-{${SIZES.filter((s) => s <= width).join(',')}}.{webp,jpg}`,
    );
  }
}

async function transcodeVideo(video, encoders) {
  const src = path.join(SRC_VID, video.src);
  const dest = path.join(OUT_VID, video.out);
  const scale = video.kind === 'vertical' ? "scale=-2:'min(ih,1920)'" : "scale='min(iw,1920)':-2";

  if (!(await fileSize(src))) {
    console.log(`[skip] master no encontrado: ${video.src}`);
    return;
  }

  const base = ['-y', '-i', src, '-map', '0:v:0', '-an'];
  const tail = ['-vf', scale, '-threads', String(THREADS)];
  if (video.fps) tail.push('-r', String(video.fps));

  const tmpMp4 = `${dest}.tmp.mp4`;
  try {
    const mp4Args = [
      ...base,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      String(CRF),
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      ...tail,
      tmpMp4,
    ];
    await execFileAsync(FFMPEG, mp4Args, EXEC_OPTS);
    await replaceFile(tmpMp4, dest);
    console.log(`[mp4]  ${video.src} -> ${video.out}`);
  } finally {
    await rm(tmpMp4, { force: true });
  }

  if (encoders.has('libvpx-vp9')) {
    const destWebm = dest.replace(/\.mp4$/, '.webm');
    const tmpWebm = `${destWebm}.tmp.webm`;
    try {
      const vp9Args = [
        ...base,
        '-c:v',
        'libvpx-vp9',
        '-deadline',
        'good',
        '-cpu-used',
        '4',
        '-crf',
        String(VP9_CRF),
        '-b:v',
        '0',
        ...tail,
        tmpWebm,
      ];
      await execFileAsync(FFMPEG, vp9Args, EXEC_OPTS);
      const mp4Size = await fileSize(dest);
      const webmSize = await fileSize(tmpWebm);
      if (mp4Size && webmSize < mp4Size * (1 - WEBM_MIN_SAVINGS)) {
        await replaceFile(tmpWebm, destWebm);
        console.log(`[webm] ${video.src} -> ${path.basename(destWebm)}`);
      } else {
        await rm(destWebm, { force: true });
        console.log(`[webm] ${video.src} -> omitido (sin reducción frente a MP4)`);
      }
    } finally {
      await rm(tmpWebm, { force: true });
    }
  }
}

async function processVideos(encoders) {
  await mkdir(OUT_VID, { recursive: true });
  console.log('\n=== VIDEOS ===');
  for (const video of VIDEOS) {
    await transcodeVideo(video, encoders);
  }
}

async function processPosters(encoders) {
  await mkdir(OUT_POSTERS, { recursive: true });
  console.log('\n=== POSTERS (frames reales de cada video) ===');

  for (const video of VIDEOS) {
    const src = path.join(SRC_VID, video.src);
    const base = path.join(OUT_POSTERS, video.poster);
    const scale = video.kind === 'vertical' ? "scale=-2:'min(ih,1280)'" : "scale='min(iw,1280)':-2";

    if (!(await fileSize(src))) continue;

    const args = [
      '-y',
      '-ss',
      String(video.posterTime),
      '-i',
      src,
      '-frames:v',
      '1',
      '-an',
      '-vf',
      scale,
      '-threads',
      String(THREADS),
    ];

    const tmpJpg = `${base}.tmp.jpg`;
    try {
      await execFileAsync(FFMPEG, [...args, '-q:v', '3', tmpJpg], EXEC_OPTS);
      await replaceFile(tmpJpg, `${base}.jpg`);
      console.log(`[poster] ${video.poster}.jpg`);
    } finally {
      await rm(tmpJpg, { force: true });
    }

    if (encoders.has('libwebp')) {
      const tmpWebp = `${base}.tmp.webp`;
      try {
        await execFileAsync(
          FFMPEG,
          [...args, '-c:v', 'libwebp', '-lossless', '0', '-q:v', '80', tmpWebp],
          EXEC_OPTS,
        );
        await replaceFile(tmpWebp, `${base}.webp`);
        console.log(`[poster] ${video.poster}.webp`);
      } finally {
        await rm(tmpWebp, { force: true });
      }
    }
  }
}

async function main() {
  console.log(`Binarios: ffmpeg=${FFMPEG}`);
  console.log(`          ffprobe=${FFPROBE}`);

  const encoders = await availableEncoders();
  console.log(
    `Encoders: libx264=${encoders.has('libx264')} libvpx-vp9=${encoders.has('libvpx-vp9')} libwebp=${encoders.has('libwebp')}`,
  );

  await processPhotos();
  await processVideos(encoders);
  await processPosters(encoders);

  const mastersSize = (await dirSize(SRC_IMG)) + (await dirSize(SRC_VID));
  const derivSize =
    (await dirSize(OUT_IMG)) + (await dirSize(OUT_VID)) + (await dirSize(OUT_POSTERS));

  console.log('\n=== RESUMEN ===');
  console.log(`Masters (Fotos/ + Videos/):  ${mb(mastersSize)} MB`);
  console.log(`Derivados (public/media/):   ${mb(derivSize)} MB`);
  console.log(`Los masters en Fotos/ y Videos/ quedan intactos.`);
}

main().catch((err) => {
  console.error('[media] error:', err.message || err);
  process.exit(1);
});
