import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMuseum } from '../context/MuseumContext';
import { SITE, FIRST_NAME } from '../../site.config.js';
import { getTheme, setTheme } from '../lib/theme';
import './Navbar.css';

export default function Navbar({ revealed = true }) {
  const { isAdmin, setAdminPanel, openEditor } = useMuseum();
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setThemeState] = useState(getTheme);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };

  const links = [
    { href: '#gallery', label: t('nav.gallery') },
    { href: '#featured', label: t('nav.featured') },
    { href: '#career', label: t('nav.story') },
    { href: '#contact', label: t('nav.contact') },
  ];

  return (
    <nav className={`nav ${scrolled ? 'is-scrolled' : ''} ${revealed ? 'is-in' : ''}`} aria-label={t('nav.label')}>
      <div className="nav-pill">
        <a href="#hero" className="nav-brand" aria-label={`${SITE.ownerName} — ${t('footer.home')}`}>
          <span className="nav-mono" aria-hidden="true">{SITE.initials}</span>
          <span className="nav-name">{FIRST_NAME}</span>
        </a>

        <div id="nav-links" className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          {links.map(l => (
            <a key={l.href} href={l.href} className="nav-link" onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="nav-tools">
          <button
            type="button"
            className="nav-icon"
            onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
            aria-label={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            title={i18n.language === 'ar' ? 'English' : 'العربية'}
          >
            {i18n.language === 'ar' ? 'EN' : 'ع'}
          </button>
          <button
            type="button"
            className="nav-icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
            title={theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
          >
            {theme === 'dark' ? '☀︎' : '☾'}
          </button>
          {isAdmin ? (
            <button type="button" className="nav-edit" onClick={() => openEditor()}>
              ✎ <span>{t('nav.edit')}</span>
            </button>
          ) : (
            <button
              type="button"
              className="nav-icon nav-key"
              onClick={() => setAdminPanel(true)}
              aria-label={t('nav.editorAccess')}
              title={t('nav.editorAccess')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="15" r="4" /><path d="M10.8 12.2 20 3m-3 3 2 2m-4 0 2 2" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className={`nav-burger ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-controls="nav-links"
            aria-label={t('nav.menu')}
          >
            <span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
