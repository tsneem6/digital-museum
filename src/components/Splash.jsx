import React, { useEffect } from 'react';
import { FIRST_NAME } from '../../site.config.js';
import './Splash.css';

const SEEN_KEY = 'museum_splash_seen';
const HOLD_MS = 1150; // heart draws + fills (matches Splash.css)
const EXIT_MS = 550;  // circle opens onto the page

/** Show the splash once per browser session, and never to visitors who
 * prefer reduced motion — a returning tab goes straight to the content. */
export function shouldShowSplash() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return !sessionStorage.getItem(SEEN_KEY); } catch { return true; }
}

export default function Splash({ onReveal, onDone }) {
  useEffect(() => {
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode */ }
    const root = document.getElementById('splash');
    const t1 = setTimeout(() => { root?.classList.add('is-leaving'); onReveal?.(); }, HOLD_MS);
    const t2 = setTimeout(() => onDone?.(), HOLD_MS + EXIT_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onReveal, onDone]);

  return (
    <div id="splash" className="splash" aria-hidden="true">
      <div className="splash-center">
        <svg className="splash-heart" viewBox="0 0 100 92" width="96" height="88">
          <defs>
            <clipPath id="splash-heart-clip">
              <path d="M50 88 C20 66 4 50 4 30 C4 15 15 4 29 4 C38 4 46 9 50 17 C54 9 62 4 71 4 C85 4 96 15 96 30 C96 50 80 66 50 88 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#splash-heart-clip)">
            <rect className="splash-fill" x="0" y="0" width="100" height="92" />
          </g>
          <path
            className="splash-outline"
            pathLength="1"
            d="M50 88 C20 66 4 50 4 30 C4 15 15 4 29 4 C38 4 46 9 50 17 C54 9 62 4 71 4 C85 4 96 15 96 30 C96 50 80 66 50 88 Z"
          />
        </svg>
        <p className="splash-name">{FIRST_NAME}</p>
      </div>
    </div>
  );
}
