import React, { useEffect, useRef } from 'react';

// Thin wrapper around lottie-web's light (SVG-only) player. The player
// (~40KB gz) is its own lazy chunk, loaded on first badge mount — pages
// that never show a badge never fetch it. Reduced motion renders the
// final frame as a static seal instead of animating the draw.

const REDUCED = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function LottieBadge({ animationData, size = 44, label, className = '' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    let anim;
    let cancelled = false;
    import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (cancelled || !hostRef.current) return;
      anim = lottie.loadAnimation({
        container: hostRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: !REDUCED(),
        animationData,
      });
      if (REDUCED()) anim.goToAndStop(anim.totalFrames - 1, true);
    });
    return () => { cancelled = true; anim?.destroy(); };
  }, [animationData]);

  return (
    <span
      ref={hostRef}
      className={className}
      style={{ display: 'inline-block', width: size, height: size, flexShrink: 0 }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
