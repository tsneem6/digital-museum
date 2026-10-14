import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './HelloKitty.css';

const FIRST_APPEARANCE = 6_000;
const PEEK_MS = 7_000; // must match the kitty-peek animation in HelloKitty.css
const SIDES = ['bottom', 'left', 'right', 'top'];

// Which way is "into the page" for each edge: the kitty is drawn standing on
// her bottom edge, so she is rotated to put that edge against the screen edge.
const ROTATION = { bottom: 0, top: 180, left: 90, right: -90 };

const pick = (arr, not) => {
  const options = arr.filter(x => x !== not);
  return options[Math.floor(Math.random() * options.length)];
};

/** Hello Kitty peeks in from a random edge of the screen every so often,
 * waves, and ducks back out. Hovering holds her in place; clicking her gets
 * a "hi!" and a little burst of hearts. Disabled under prefers-reduced-motion. */
export default function HelloKitty() {
  const { t } = useTranslation();
  const [peek, setPeek] = useState(null); // { side, pos, key }
  const [hearts, setHearts] = useState(0);
  const timerRef = useRef(null);
  const lastSide = useRef(null);

  const scheduleNext = useCallback((delay) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // The navbar floats along the top centre; only peek from the top on
      // wide screens, beside it rather than behind it.
      const sides = window.innerWidth >= 1300 ? SIDES : SIDES.filter(x => x !== 'top');
      const side = pick(sides, lastSide.current);
      lastSide.current = side;
      // Keep clear of the corners (and the navbar along the top).
      const pos = side === 'left' || side === 'right'
        ? 25 + Math.random() * 55
        : side === 'top'
          ? (Math.random() < 0.5 ? 2 : 94) + Math.random() * 4 // either side of the navbar
          : 12 + Math.random() * 76;
      setPeek({ side, pos, key: Date.now() });
    }, delay);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    scheduleNext(FIRST_APPEARANCE);
    return () => clearTimeout(timerRef.current);
  }, [scheduleNext]);

  const handleDone = (e) => {
    if (e.animationName !== 'kitty-peek') return;
    setPeek(null);
    setHearts(0);
    // Pop back in 20–45 seconds later, from a different side.
    scheduleNext(20_000 + Math.random() * 25_000);
  };

  if (!peek) return null;

  const { side, pos } = peek;
  // The anchor point on the edge; CSS pins the other coordinate per side.
  const anchor = side === 'left' || side === 'right' ? { top: `${pos}%` } : { left: `${pos}%` };

  return (
    <div
      key={peek.key}
      className={`kitty kitty--${side}`}
      style={{ ...anchor, '--kitty-rot': `${ROTATION[side]}deg`, '--kitty-peek-ms': `${PEEK_MS}ms` }}
    >
      <button
        type="button"
        className="kitty-body"
        onAnimationEnd={handleDone}
        onClick={() => setHearts(h => h + 1)}
        aria-label={t('kitty.label')}
      >
        <KittySvg />
        {hearts > 0 && (
          <span className="kitty-bubble" key={hearts}>
            {t('kitty.hi')}
            {[0, 1, 2, 3, 4].map(i => (
              <span key={i} className="kitty-heart" style={{ '--i': i }} aria-hidden="true">♥</span>
            ))}
          </span>
        )}
      </button>
    </div>
  );
}

function KittySvg() {
  const ink = '#2b2024';
  return (
    <svg viewBox="0 0 200 190" width="100%" height="100%" aria-hidden="true">
      {/* paws resting on the edge */}
      <ellipse cx="62" cy="182" rx="22" ry="14" fill="#fff" stroke={ink} strokeWidth="4" />
      <ellipse cx="138" cy="182" rx="22" ry="14" fill="#fff" stroke={ink} strokeWidth="4" />
      {/* ears */}
      <path d="M30 78 Q22 22 40 14 Q58 10 86 46 Z" fill="#fff" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      <path d="M170 78 Q178 22 160 14 Q142 10 114 46 Z" fill="#fff" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      {/* head */}
      <ellipse cx="100" cy="104" rx="86" ry="66" fill="#fff" stroke={ink} strokeWidth="4" />
      {/* bow */}
      <g className="kitty-bow" transform="translate(146 40) rotate(18)">
        <path d="M0 0 C-30 -28 -46 4 -30 20 C-20 30 -6 14 0 0 Z" fill="#ff3f7f" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M0 0 C30 -28 46 4 30 20 C20 30 6 14 0 0 Z" fill="#ff3f7f" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
        <ellipse cx="0" cy="2" rx="11" ry="10" fill="#ff3f7f" stroke={ink} strokeWidth="3.5" />
      </g>
      {/* eyes */}
      <ellipse className="kitty-eye" cx="66" cy="108" rx="7" ry="10" fill={ink} />
      <ellipse className="kitty-eye" cx="134" cy="108" rx="7" ry="10" fill={ink} />
      {/* nose */}
      <ellipse cx="100" cy="124" rx="8" ry="5.5" fill="#ffd21f" stroke={ink} strokeWidth="3" />
      {/* whiskers */}
      <g stroke={ink} strokeWidth="4" strokeLinecap="round">
        <line x1="34" y1="112" x2="4" y2="104" />
        <line x1="34" y1="124" x2="2" y2="124" />
        <line x1="36" y1="136" x2="6" y2="146" />
        <line x1="166" y1="112" x2="196" y2="104" />
        <line x1="166" y1="124" x2="198" y2="124" />
        <line x1="164" y1="136" x2="194" y2="146" />
      </g>
    </svg>
  );
}
