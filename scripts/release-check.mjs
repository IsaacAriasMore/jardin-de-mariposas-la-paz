/* eslint-disable no-console */
import { createHash } from 'node:crypto';
import { access, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const publicDir = path.join(root, 'public');
const mediaDir = path.join(publicDir, 'media');
const sourceDirs = ['src', 'public'].map((dir) => path.join(root, dir));

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) =>
        entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
      ),
    )
  ).flat();
}

const codeFiles = (await Promise.all(sourceDirs.map(files)))
  .flat()
  .filter((file) => /\.(?:ejs|js|mjs|css|json)$/.test(file));
const references = new Set();
for (const file of codeFiles) {
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(/\/media\/[^\s"'`<>)]+/g))
    references.add(match[0].replace(/[;,]$/, ''));
}
const required = [...references].filter(
  (reference) =>
    reference.startsWith('/media/') && !reference.includes('<%') && !reference.endsWith('/'),
);
const absent = [];
const checked = [];
for (const reference of required) {
  try {
    await access(path.resolve(publicDir, `.${reference}`));
    checked.push(reference);
  } catch {
    absent.push(reference);
  }
}
const manifest = [];
for (const reference of checked) {
  const file = path.resolve(publicDir, `.${reference}`);
  try {
    const body = await readFile(file);
    manifest.push({
      path: reference,
      bytes: body.length,
      sha256: createHash('sha256').update(body).digest('hex'),
    });
  } catch {
    absent.push(reference);
  }
}
const mediaFiles = await files(mediaDir);
const mediaBytes = (
  await Promise.all(mediaFiles.map(async (file) => (await stat(file)).size))
).reduce((a, b) => a + b, 0);
await mkdir(path.join(root, 'release'), { recursive: true });
await writeFile(
  path.join(root, 'release', 'media-manifest.json'),
  JSON.stringify(manifest, null, 2),
);
console.log(
  `media files: ${mediaFiles.length}; media bytes: ${mediaBytes}; references: ${references.size}; required: ${required.length}; missing: ${absent.length}`,
);
if (absent.length) {
  console.error(absent.join('\n'));
  process.exitCode = 1;
}
