import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ImageZoom.css';

/** Conservation-desk magnify for lightbox images — click to zoom to 2.4×
 * anchored where you clicked, move the pointer to pan across the piece,
 * click again (or Esc) to step back. Ported from Animate UI's Image Zoom,
 * driven by transform-origin + scale so the layout never shifts. */
export default function ImageZoom({ src, alt = '', scale = 2.4, className = '' }) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const frameRef = useRef(null);

  // A new image (slide change) always starts un-zoomed.
  useEffect(() => { setZoomed(false); }, [src]);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e) => { if (e.key === 'Escape') setZoomed(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomed]);

  const pointToOrigin = useCallback((e) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return '50% 50%';
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    return `${Math.max(0, Math.min(100, px))}% ${Math.max(0, Math.min(100, py))}%`;
  }, []);

  const onClick = (e) => {
    e.stopPropagation(); // lightbox overlay click = close; this click = zoom
    if (!zoomed) setOrigin(pointToOrigin(e));
    setZoomed(z => !z);
  };

  const onMove = (e) => {
    if (zoomed) setOrigin(pointToOrigin(e));
  };

  return (
    <span
      ref={frameRef}
      className={`image-zoom ${zoomed ? 'zoomed' : ''} ${className}`}
      onClick={onClick}
      onMouseMove={onMove}
      role="button"
      aria-label={zoomed ? 'Step back from the image' : 'Magnify the image'}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{ transformOrigin: origin, transform: zoomed ? `scale(${scale})` : 'scale(1)' }}
      />
    </span>
  );
}
