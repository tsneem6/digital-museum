import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './GuidedTour.css';

/* Anything can start the tour by dispatching this event on window —
   keeps the trigger (Hero) decoupled from the overlay (mounted in App). */
export const TOUR_EVENT = 'museum:start-tour';
export const startTour = () => window.dispatchEvent(new Event(TOUR_EVENT));

/* Stops are matched against the DOM at start time, so sections that
   aren't rendered (e.g. empty volunteering) drop out automatically. Title
   and caption resolve through i18n at render time (below), not here. */
const STOP_IDS = ['featured', 'gallery', 'career', 'volunteering', 'testimonials', 'guestbook', 'contact'];

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function scrollToStop(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
}

export default function GuidedTour() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const backArrow = isRtl ? '→' : '←';
  const nextArrow = isRtl ? '←' : '→';
  // `stops` holds ids only — title/caption resolve through t() at render,
  // so a language switch mid-tour (or a stale effect closure) never shows
  // the wrong language.
  const [stops, setStops] = useState(null); // null → tour inactive
  const [idx, setIdx] = useState(0);
  const cardRef = useRef(null);

  useEffect(() => {
    const start = () => {
      const available = STOP_IDS.filter(id => document.getElementById(id));
      if (!available.length) return;
      setStops(available);
      setIdx(0);
      scrollToStop(available[0]);
    };
    window.addEventListener(TOUR_EVENT, start);
    return () => window.removeEventListener(TOUR_EVENT, start);
  }, []);

  useEffect(() => {
    if (!stops) return;
    cardRef.current?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape') setStops(null);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, idx]);

  const go = (dir) => {
    if (!stops) return;
    const next = idx + dir;
    if (next < 0) return;
    if (next >= stops.length) { setStops(null); return; }
    setIdx(next);
    scrollToStop(stops[next]);
  };

  const stopId = stops?.[idx];
  const stop = stopId ? { title: t(`tour.${stopId}.title`), caption: t(`tour.${stopId}.caption`) } : null;

  return (
    <AnimatePresence>
      {stop && (
        <motion.aside
          className="tour-card"
          role="dialog"
          aria-label="Guided tour"
          tabIndex={-1}
          ref={cardRef}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="tour-head">
            <span className="tour-progress mono">{t('tour.progress', { current: idx + 1, total: stops.length })}</span>
            <button type="button" className="tour-end mono" onClick={() => setStops(null)}>
              {t('tour.end')}
            </button>
          </div>
          <h3 className="tour-title serif">{stop.title}</h3>
          <p className="tour-caption">{stop.caption}</p>
          <div className="tour-controls">
            <button type="button" className="tour-btn mono" onClick={() => go(-1)} disabled={idx === 0}>
              {backArrow} {t('tour.back')}
            </button>
            <button type="button" className="tour-btn tour-btn--gold mono" onClick={() => go(1)}>
              {idx === stops.length - 1 ? t('tour.finish') : `${t('tour.next')} ${nextArrow}`}
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
