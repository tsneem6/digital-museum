import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import './SlidingNumber.css';

/** Odometer-style number: each digit is a vertical column of 0–9 that
 * springs to the active digit, so changes roll instead of blinking.
 * Ported from Animate UI's Sliding Number, restyled for the museum
 * (inherits font/color from its parent; no Tailwind).
 *
 * `pad` left-pads with zeros to a fixed digit count (the preloader's
 * "000" look); non-digit characters (commas from toLocaleString) render
 * as static glyphs between the rolling columns. */
function DigitColumn({ digit }) {
  const spring = useSpring(digit, { stiffness: 90, damping: 18, mass: 0.6 });

  React.useEffect(() => {
    spring.set(digit);
  }, [digit, spring]);

  const y = useTransform(spring, (v) => `${-v}em`);

  return (
    <span className="sliding-digit" aria-hidden="true">
      <motion.span className="sliding-digit-track" style={{ y }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <span key={n} className="sliding-digit-cell">{n}</span>
        ))}
      </motion.span>
    </span>
  );
}

export default function SlidingNumber({ value, pad = 0, locale = false, className = '' }) {
  const rounded = Math.max(0, Math.round(value));
  let text = locale ? rounded.toLocaleString() : String(rounded);
  if (pad > 0) text = String(rounded).padStart(pad, '0');

  return (
    <span className={`sliding-number ${className}`} role="text" aria-label={text}>
      {text.split('').map((ch, i) =>
        /\d/.test(ch)
          ? <DigitColumn key={`${text.length}-${i}`} digit={Number(ch)} />
          : <span key={`${text.length}-${i}`} className="sliding-digit-static">{ch}</span>
      )}
    </span>
  );
}
