import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMuseum } from '../context/MuseumContext';
import { isRealLink } from '../lib/assets';
import { SOCIALS } from '../lib/socials';
import { SITE } from '../../site.config.js';
import Magnetic from './anim/Magnetic';
import './Footer.css';

// "GitHub" was dropped as a share target: there's no such thing as sharing
// *to* GitHub, and having it here duplicated the real GitHub profile link
// one column over in "Connect" -- same word, two different meanings, same
// footer. LinkedIn now opens an actual share dialog instead of just copying
// a link (that's what "Copy Link" is already for).
const SHARE_SOURCES = [
  {
    source: 'linkedin',
    label: 'footer.shareLinkedin',
    action: 'linkedin-share',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9z"/>
      </svg>
    ),
  },
  {
    source: 'copy-link',
    label: 'footer.copyLink',
    action: 'copy',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const { settings } = useMuseum();
  const { t, i18n } = useTranslation();
  const year = new Date().getFullYear();
  const [copiedSource, setCopiedSource] = useState(null);

  const handleShare = async (source, action) => {
    const link = window.location.href.split('#')[0];

    if (action === 'linkedin-share') {
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      setCopiedSource(source);
      setTimeout(() => {
        setCopiedSource((current) => (current === source ? null : current));
      }, 2000);
    } catch {
      // Clipboard API unavailable in this context -- nothing to gracefully fall back to.
    }
  };

  return (
    <footer id="about" className="footer">
      <div className="container footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo serif">{SITE.ownerName}</div>
            <p className="footer-tagline">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="footer-links-col">
            <p className="footer-col-title mono">{t('footer.navigate')}</p>
            <a href="#hero">{t('footer.home')}</a>
            <a href="#featured">{t('nav.featured')}</a>
            <a href="#gallery">{t('nav.gallery')}</a>
            <button
              type="button"
              className="footer-ticket-link footer-lang-toggle mono"
              onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
              aria-label={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              {i18n.language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          <div className="footer-links-col">
            <p className="footer-col-title mono">{t('footer.connect')}</p>
            {SOCIALS.map(({ key, label }) => isRealLink(settings.social?.[key]) && (
              <a key={key} href={settings.social[key]} target="_blank" rel="noreferrer">{label}</a>
            ))}
            {settings.email && <a href={`mailto:${settings.email}`}>{t('footer.email')}</a>}
          </div>
        </div>

        <div className="footer-share">
          <p className="footer-col-title mono">{t('footer.share')}</p>
          <div className="footer-share-btns">
            {SHARE_SOURCES.map(({ source, label, action, icon }) => (
              <Magnetic key={source} strength={0.2}>
                <button
                  type="button"
                  className="footer-share-btn"
                  onClick={() => handleShare(source, action)}
                  aria-label={t(label)}
                  title={t(label)}
                >
                  {icon}
                  <span className="mono">{copiedSource === source ? t('footer.copied') : t(label)}</span>
                </button>
              </Magnetic>
            ))}
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <span className="mono footer-copy">© {year} {t('footer.museumName', { name: SITE.ownerName })}</span>
          <span className="mono footer-copy">{t('footer.crafted')}</span>
        </div>
      </div>
    </footer>
  );
}
