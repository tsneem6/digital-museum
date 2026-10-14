// Light / dark mode. index.html applies the initial theme before React
// loads (no flash); this module flips it and remembers the choice.
const KEY = 'museum_theme';
const THEME_COLOR = { light: '#fff4f8', dark: '#1c0f18' };

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
  window.dispatchEvent(new CustomEvent('museum:theme', { detail: theme }));
}
