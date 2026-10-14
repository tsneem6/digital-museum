import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveAsset } from '../lib/assets';
import ImageZoom from './anim/ImageZoom';
import './Lightbox.css';

// Full-screen photo viewer shared by the project popup and Giving Back.
export function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const innerRef = useRef(null);
  const touchX = useRef(null);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  // Swipe left/right navigates on touch screens (vertical scroll unaffected).
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 48 && images.length > 1) {
      if (dx < 0) next(); else prev();
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', onKey);
    innerRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <motion.div
      className="lightbox-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="lightbox-inner"
        role="dialog"
        aria-modal="true"
        aria-label="Screenshot viewer"
        tabIndex={-1}
        ref={innerRef}
        initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
        transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }}
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          {/* Slide transition on the wrapper; ImageZoom inside adds the
              conservation-desk magnify (click to zoom, move to pan). */}
          <motion.div
            key={idx}
            className="lightbox-img"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            <ImageZoom
              src={resolveAsset(images[idx])}
              alt={`Screenshot ${idx + 1} of ${images.length}`}
            />
          </motion.div>
        </AnimatePresence>
        {images.length > 1 && (
          <>
            <button className="lightbox-arrow lightbox-arrow--prev" onClick={prev} aria-label="Previous screenshot">‹</button>
            <button className="lightbox-arrow lightbox-arrow--next" onClick={next} aria-label="Next screenshot">›</button>
            <div className="lightbox-counter mono">{idx + 1} / {images.length}</div>
          </>
        )}
        <button className="lightbox-close" onClick={onClose} aria-label="Close screenshot viewer">×</button>
      </motion.div>
    </motion.div>
  );
}
