import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { SITE, BASE_PATH, SITE_URL } from './site.config.js'

// Monogram favicon built from site.config.js, inlined as a data URI so the
// tab icon follows the owner's initials without a separate asset to edit.
function faviconDataUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e9679d"/><stop offset="100%" stop-color="#a3245a"/></linearGradient></defs><rect width="100" height="100" rx="30" fill="#ffe1ec"/><rect width="96" height="96" x="2" y="2" rx="22" fill="none" stroke="url(#g)" stroke-width="2" opacity="0.55"/><text x="50" y="67" font-family="Arial Rounded MT Bold, Nunito, sans-serif" font-weight="700" font-size="44" letter-spacing="1" fill="url(#g)" text-anchor="middle">${SITE.initials}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const TOKENS = {
  __SITE_NAME__: SITE.ownerName,
  __SITE_TAGLINE__: SITE.tagline,
  __SITE_URL__: SITE_URL,
  __BASE_PATH__: process.env.VITE_BASE || BASE_PATH,
  __FAVICON__: faviconDataUri(),
}

const fill = (text) =>
  Object.entries(TOKENS).reduce((out, [token, value]) => out.split(token).join(value), text)

// Fills the __TOKENS__ in index.html during dev and build, and in the static
// public/ files (404 page, robots.txt, sitemap.xml) once they are copied
// into dist/ — those are served verbatim by GitHub Pages, so they need the
// real name and URL baked in.
function siteConfigPlugin() {
  let outDir = 'dist'
  return {
    name: 'site-config',
    configResolved(config) { outDir = path.resolve(config.root, config.build.outDir) },
    transformIndexHtml: (html) => fill(html),
    closeBundle() {
      for (const file of ['404.html', 'robots.txt', 'sitemap.xml']) {
        const p = path.join(outDir, file)
        if (existsSync(p)) writeFileSync(p, fill(readFileSync(p, 'utf8')))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteConfigPlugin()],
  // VITE_BASE=./ builds a copy that runs from any folder (used by
  // `npm run preview:local` and for the shareable test preview).
  base: process.env.VITE_BASE || BASE_PATH,
})
