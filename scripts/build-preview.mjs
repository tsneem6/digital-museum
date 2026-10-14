// Builds a test copy of the site that opens by double-clicking — no server,
// no install on the viewing computer. Its editor is a demo: any password
// opens it and nothing is published. Output: preview/index.html (all code
// and styles inlined) next to preview/images/.
//
//   npm run build:preview
//
// Browsers refuse to load separate JavaScript files from a file:// page, so
// everything is bundled into one chunk and written straight into the HTML.

import { build } from 'vite';
import { readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'preview');

process.env.VITE_BASE = './';
// The test copy gets a demo editor (any password, never publishes) so the
// editor can be tried without a Supabase account. Normal builds never set this.
process.env.VITE_DEMO_EDITOR = 'true';
rmSync(outDir, { recursive: true, force: true });

await build({
  root,
  logLevel: 'warn',
  build: {
    outDir,
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 100_000,
    rolldownOptions: { output: { codeSplitting: false } },
  },
});

const assetsDir = path.join(outDir, 'assets');
let html = readFileSync(path.join(outDir, 'index.html'), 'utf8');

// <link rel="stylesheet" href="./assets/x.css"> → <style>…</style>
html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/assets\/([^"]+\.css)"[^>]*>/g, (_, file) =>
  `<style>${readFileSync(path.join(assetsDir, file), 'utf8')}</style>`);

// <script type="module" src="./assets/x.js"></script> → inline module
html = html.replace(/<script type="module"[^>]*src="\.\/assets\/([^"]+\.js)"[^>]*><\/script>/g, (_, file) => {
  const js = readFileSync(path.join(assetsDir, file), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${js}</script>`;
});

// Drop module preloads that would point at files we no longer need.
html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');

writeFileSync(path.join(outDir, 'index.html'), html);
rmSync(assetsDir, { recursive: true, force: true });
for (const f of ['404.html', 'robots.txt', 'sitemap.xml']) rmSync(path.join(outDir, f), { force: true });

console.log(`Test copy ready: ${path.relative(root, path.join(outDir, 'index.html'))}`);
console.log(`Files: ${readdirSync(outDir).join(', ')}`);
