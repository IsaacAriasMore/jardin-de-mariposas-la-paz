/* eslint-disable no-console */
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('.');
const destination = path.join(root, 'release', 'jardin-de-mariposas-la-paz');
if (path.basename(destination) !== 'jardin-de-mariposas-la-paz')
  throw new Error('Unexpected release destination.');
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
for (const entry of ['package.json', 'package-lock.json', 'src', 'public', 'scripts'])
  await cp(path.join(root, entry), path.join(destination, entry), { recursive: true });
console.log(`release prepared: ${destination}`);
