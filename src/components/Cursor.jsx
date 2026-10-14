import { useEffect } from 'react';
import './Cursor.css';

const MAX_SPARKS = 14;
const GAP_PX = 26;   // distance the pointer must travel between sparkles
const SHAPES = ['♥', '✦', '♡', '✧'];

/** The cursor itself is pure CSS (see index.css). This only adds a light
 * sparkle trail: a few tiny elements dropped behind the pointer as it moves,
 * each removed when its fade ends. Mouse/trackpad only, never under
 * reduced motion, and no work at all while the pointer is still. */
export default function Cursor() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let lastX = 0;
    let lastY = 0;
    let live = 0;

    const onMove = (e) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (dx * dx + dy * dy < GAP_PX * GAP_PX || live >= MAX_SPARKS) return;
      lastX = e.clientX;
      lastY = e.clientY;

      const spark = document.createElement('span');
      spark.className = 'cursor-spark';
      spark.textContent = SHAPES[(Math.random() * SHAPES.length) | 0];
      spark.style.left = `${e.clientX}px`;
      spark.style.top = `${e.clientY}px`;
      spark.style.setProperty('--drift', `${(Math.random() - 0.5) * 30}px`);
      spark.addEventListener('animationend', () => { spark.remove(); live--; }, { once: true });
      document.body.appendChild(spark);
      live++;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return null;
}
