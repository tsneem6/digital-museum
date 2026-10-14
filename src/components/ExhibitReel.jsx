import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveAsset, isRealLink } from '../lib/assets';
import './ExhibitReel.css';

/* Auto-generated cinematic slideshow for a project — built entirely from data
   the project already has (cover, screenshots, title, tech). Story-style
   segmented progress, Ken Burns drift on each image, plaque-voice captions. */

const SLIDE_MS = 4200;

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ExhibitReel({ project, onClose }) {
  const images = useMemo(
    () => [project.coverImage, ...(project.screenshots || [])].filter(Boolean),
    [project]
  );

  const slides = useMemo(() => [
    { type: 'title', img: images[0] },
    ...images.slice(1).map((img, i) => ({ type: 'shot', img, n: i + 1 })),
    { type: 'end' },
  ], [images]);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduced = useRef(prefersReduced()).current;
  const rootRef = useRef(null);

  const slide = slides[idx];
  const isEnd = slide.type === 'end';

  const go = (dir) => {
    setIdx(i => Math.max(0, Math.min(i + dir, slides.length - 1)));
  };

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Decode the next image ahead of its slide so crossfades never show a blank.
  useEffect(() => {
    const next = slides[idx + 1]?.img;
    if (next) { const im = new Image(); im.src = resolveAsset(next); }
  }, [idx, slides]);

  return (
    <motion.div
      className="reel-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — exhibit reel`}
      tabIndex={-1}
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Segmented story progress — the active fill's animation end IS the
          slide timer, so pausing the CSS animation pauses the reel exactly. */}
      <div className="reel-progress" aria-hidden="true">
        {slides.map((s, i) => (
          <span key={i} className="reel-seg">
            <span
              className={`reel-seg-fill ${i < idx || isEnd ? 'done' : ''} ${i === idx && !isEnd ? 'active' : ''}`}
              style={i === idx && !isEnd ? {
                animationDuration: `${SLIDE_MS}ms`,
                animationPlayState: playing ? 'running' : 'paused',
              } : undefined}
              onAnimationEnd={i === idx && !isEnd ? () => go(1) : undefined}
            />
          </span>
        ))}
      </div>

      {/* Top chrome */}
      <div className="reel-chrome">
        <span className="reel-kicker mono">Exhibit reel — {project.title}</span>
        <div className="reel-chrome-btns">
          {!isEnd && (
            <button
              type="button"
              className="reel-icon-btn mono"
              onClick={() => setPlaying(p => !p)}
              aria-label={playing ? 'Pause reel' : 'Resume reel'}
            >
              {playing ? '❚❚' : '▶'}
            </button>
          )}
          <button type="button" className="reel-icon-btn" onClick={onClose} aria-label="Close reel">
            ×
          </button>
        </div>
      </div>

      {/* Slides */}
      <div className="reel-stage">
        <AnimatePresence mode="sync">
          <motion.div
            key={idx}
            className="reel-slide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.8 }}
          >
            {slide.img && (
              <img
                className="reel-img"
                src={resolveAsset(slide.img)}
                alt=""
                draggable="false"
              />
            )}
            {slide.type !== 'end' && <div className="reel-scrim" />}

            {slide.type === 'title' && (
              <div className="reel-caption">
                <span className="mono reel-caption-kicker">The museum presents</span>
                <h2 className="serif reel-title">{project.title}</h2>
                <span className="mono reel-caption-meta">{project.category} · {project.year}</span>
              </div>
            )}

            {slide.type === 'shot' && (
              <div className="reel-caption reel-caption--corner">
                <span className="mono reel-caption-meta">
                  {String(slide.n).padStart(2, '0')} / {String(images.length - 1).padStart(2, '0')}
                  {project.tech?.[slide.n - 1] ? ` — ${project.tech[slide.n - 1]}` : ''}
                </span>
              </div>
            )}

            {slide.type === 'end' && (
              <div className="reel-end" style={{ background: `color-mix(in srgb, ${project.color || '#c7356f'} 30%, #2a1424)` }}>
                <div className="reel-end-glow" style={{ background: project.accentColor }} />
                <span className="mono reel-caption-kicker">Fin</span>
                <h2 className="serif reel-title">{project.title}</h2>
                {project.subtitle && <p className="reel-end-sub">{project.subtitle}</p>}
                <div className="reel-end-actions">
                  {isRealLink(project.link) && (
                    <a className="reel-btn reel-btn--gold mono" href={project.link} target="_blank" rel="noreferrer">
                      Visit live →
                    </a>
                  )}
                  {isRealLink(project.repo) && (
                    <a className="reel-btn mono" href={project.repo} target="_blank" rel="noreferrer">
                      Repository
                    </a>
                  )}
                  <button type="button" className="reel-btn mono" onClick={() => { setIdx(0); setPlaying(true); }}>
                    ↺ Replay
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Story-style tap zones (not on the end card — it has buttons) */}
        {!isEnd && (
          <>
            <button type="button" className="reel-zone reel-zone--prev" onClick={() => go(-1)} aria-label="Previous slide" />
            <button type="button" className="reel-zone reel-zone--next" onClick={() => go(1)} aria-label="Next slide" />
          </>
        )}
      </div>
    </motion.div>
  );
}
