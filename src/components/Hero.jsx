import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useMuseum } from '../context/MuseumContext';
import { startTour } from './GuidedTour';
import { SITE, FIRST_NAME, categoryIcon } from '../../site.config.js';
import { resolveAsset } from '../lib/assets';
import EditHere from './EditHere';
import './Hero.css';

const EASE = [0.16, 1, 0.3, 1];
const stage = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function Hero({ revealed = true }) {
  const { projects, settings } = useMuseum();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const name = isAr ? (SITE.firstNameAr || FIRST_NAME) : FIRST_NAME;

  // Her three biggest categories become the little interest chips.
  const topCats = useMemo(() => {
    const counts = {};
    projects.forEach(p => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
  }, [projects]);
  const catCount = new Set(projects.map(p => p.category).filter(Boolean)).size;

  const anim = revealed ? 'show' : 'hidden';

  return (
    <section className="hero" id="hero">
      <div className="hero-bg" aria-hidden="true" />

      <div className="container hero-grid">
        <motion.div className="hero-text" variants={stage} initial="hidden" animate={anim}>
          <motion.p className="hero-hello" variants={rise}>
            <span className="hero-wave" aria-hidden="true">👋</span> {t('hero.hello')}
          </motion.p>

          <motion.h1 className="hero-title" variants={rise}>
            {t('hero.im')} <span className="hero-name">{name}</span>
          </motion.h1>

          <motion.p className="hero-role" variants={rise}>
            {isAr ? SITE.roleAr : SITE.role} <span aria-hidden="true">@</span> {isAr ? SITE.schoolAr : SITE.school}
          </motion.p>

          <motion.p className="hero-desc" variants={rise}>{t('hero.desc')}</motion.p>

          {topCats.length > 0 && (
            <motion.ul className="hero-chips" variants={rise} aria-label={t('hero.interests')}>
              {topCats.map(c => (
                <li key={c} className="hero-chip"><span aria-hidden="true">{categoryIcon(c)}</span> {c}</li>
              ))}
            </motion.ul>
          )}

          <motion.div className="hero-actions" variants={rise}>
            <a href="#gallery" className="hero-btn hero-btn--main">{t('hero.enter')}</a>
            <a href="#contact" className="hero-btn hero-btn--soft">{t('hero.sayHi')}</a>
            <button type="button" className="hero-tour" onClick={startTour}>{t('hero.tour')}</button>
          </motion.div>
        </motion.div>

        {/* Museum pass — her ID card */}
        <motion.div
          className="hero-pass-wrap"
          initial={{ opacity: 0, y: 30, rotate: 4 }}
          animate={revealed ? { opacity: 1, y: 0, rotate: 2.5 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
        >
          <span className="hero-lanyard" aria-hidden="true" />
          <div className="hero-pass">
            <div className="hero-pass-top">
              <span>{t('hero.pass')}</span>
              <span>{SITE.schoolShort} · {SITE.established}</span>
            </div>

            <div className="hero-photo">
              {settings?.photo ? (
                <img src={resolveAsset(settings.photo)} alt={SITE.ownerName} />
              ) : (
                <span className="hero-initials" aria-hidden="true">{SITE.initials}</span>
              )}
            </div>
            <EditHere view="profile" label={t('hero.editPhoto')} className="hero-photo-edit" />

            <p className="hero-pass-name">{SITE.ownerName}</p>
            <p className="hero-pass-role">{isAr ? SITE.roleAr : SITE.role}</p>

            <dl className="hero-stats">
              <div><dt>{t('hero.statProjects')}</dt><dd>{projects.length}</dd></div>
              <div><dt>{t('hero.statCategories')}</dt><dd>{catCount}</dd></div>
              <div><dt>{t('hero.statSince')}</dt><dd>{SITE.established}</dd></div>
            </dl>

            <div className="hero-barcode" aria-hidden="true" />
          </div>

          <span className="hero-sticker hero-sticker--1" aria-hidden="true">⚙️</span>
          <span className="hero-sticker hero-sticker--2" aria-hidden="true">💖</span>
          <span className="hero-sticker hero-sticker--3" aria-hidden="true">🤖</span>
          <span className="hero-sticker hero-sticker--4" aria-hidden="true">✨</span>
        </motion.div>
      </div>
    </section>
  );
}
