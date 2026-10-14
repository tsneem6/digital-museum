// Resolves project image references. Data can contain three shapes:
//  - repo-relative paths ("images/p1-cover.jpg") — need the Vite base prefix
//  - data URIs (fresh uploads from the editor) — pass through
//  - absolute URLs — pass through
// '#' is the editor's placeholder for "no link yet" — treat it as absent.
export const isRealLink = (url) => Boolean(url) && url !== '#';

export function resolveAsset(src) {
  if (!src) return src;
  if (src.startsWith('data:') || /^https?:\/\//.test(src)) return src;
  return import.meta.env.BASE_URL + src.replace(/^\//, '');
}
