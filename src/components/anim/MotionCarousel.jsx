import React, { useState, useEffect, useRef, Children } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MotionCarousel.css';

const EASE = [0.16, 1, 0.3, 1];

/** Auto-advancing, drag-to-navigate carousel — Animate UI's Motion
 * Carousel reduced to the museum's manners: one slide at a time, slow
 * rotation, pauses while the visitor is looking (hover) or has the tab
 * hidden, gold dot rail. Children are the slides. */
export default function MotionCarousel({ children, interval = 6000, className = '' }) {
  const slides = Children.toArray(children);
  const [[index, direction], setState] = useState([0, 1]);
  const hovering = useRef(false);

  const go = (dir) => {
    setState(([i]) => [(i + dir + slides.length) % slides.length, dir]);
  };

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      if (!hovering.current && !document.hidden) go(1);
    }, interval);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, interval]);

  if (slides.length === 0) return null;

  return (
    <div
      className={`motion-carousel ${className}`}
      onMouseEnter={() => { hovering.current = true; }}
      onMouseLeave={() => { hovering.current = false; }}
    >
      <div className="motion-carousel-stage">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            className="motion-carousel-slide"
            custom={direction}
            initial={{ opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -48 }}
            transition={{ duration: 0.55, ease: EASE }}
            drag={slides.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -56) go(1);
              else if (info.offset.x > 56) go(-1);
            }}
          >
            {slides[index]}
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <div className="motion-carousel-dots" role="tablist" aria-label="Testimonial slides">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              className={`motion-carousel-dot ${i === index ? 'active' : ''}`}
              onClick={() => setState([i, i > index ? 1 : -1])}
            />
          ))}
        </div>
      )}
    </div>
  );
}
