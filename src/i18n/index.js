import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ar from './ar.json';

// Bilingual museum: English and Arabic. Only the museum's own voice (chrome,
// section headings, microcopy) translates — exhibit content in projects.js
// stays as written until Arabic copy exists for it. Resources are bundled
// (a few KB) so language switching is instant and offline-safe.

const STORAGE_KEY = 'museum_lang';

const stored = (() => {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
})();
const initial = stored || (navigator.language?.startsWith('ar') ? 'ar' : 'en');

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React escapes already
});

// Keep the document itself in sync — direction, lang attribute, and a class
// hook for any CSS that needs more than :lang().
function applyLang(lng) {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
}
applyLang(initial);

i18n.on('languageChanged', (lng) => {
  applyLang(lng);
  try { localStorage.setItem(STORAGE_KEY, lng); } catch { /* private mode */ }
});

export default i18n;
