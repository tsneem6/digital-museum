// Moves base64 images embedded in src/data/projects.js out to real files in
// public/images/, replacing each data URI with a repo-relative path that
// resolveAsset() already understands. Content-hashed filenames make the
// operation idempotent: re-running never duplicates files or churns the repo.
//
// Runs automatically in the deploy workflow; can also be run locally:
//   node scripts/extract-images.mjs

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'src', 'data', 'projects.js');
const outDir = path.join(root, 'public', 'images');

const EXT = { jpeg: 'jpg', jpg: 'jpg', png: 'png', webp: 'webp', gif: 'gif' };

const src = readFileSync(dataPath, 'utf8');
let count = 0;

const next = src.replace(
  /"data:image\/([a-z]+);base64,([A-Za-z0-9+/=]+)"/g,
  (match, type, b64) => {
    const ext = EXT[type];
    if (!ext) return match; // unknown subtype — leave untouched
    const buf = Buffer.from(b64, 'base64');
    const hash = createHash('sha1').update(buf).digest('hex').slice(0, 12);
    const name = `x-${hash}.${ext}`;
    mkdirSync(outDir, { recursive: true });
    const file = path.join(outDir, name);
    if (!existsSync(file)) writeFileSync(file, buf);
    count++;
    return JSON.stringify(`images/${name}`);
  }
);

if (count > 0) writeFileSync(dataPath, next);
console.log(
  count > 0
    ? `Extracted ${count} embedded image(s) to public/images/`
    : 'No embedded images found — nothing to do.'
);
