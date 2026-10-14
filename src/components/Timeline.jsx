import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMuseum } from '../context/MuseumContext';
import EditHere from './EditHere';
import './Timeline.css';

/** My story so far — a horizontal road of milestones, oldest on the left
 * and the latest marked "you are here". Swipe, drag, or use the arrows. */
export default function Timeline() {
  const { t, i18n } = useTranslation();
  const { timeline } = useMuseum();
  const trackRef = useRef(null);
  const drag = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const rtl = i18n.dir() === 'rtl';

  // The editor keeps the newest entry first; a road reads oldest → newest.
  const stops = [...(timeline || [])].reverse();

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // RTL scrollLeft runs negative
    setEdges({ start: pos < 8, end: pos > max - 8 });
  };

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [stops.length]);

  if (stops.length === 0) return null;

  const step = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('.road-stop');
    const amount = (card?.offsetWidth || 300) + 24;
    el.scrollBy({ left: dir * amount * (rtl ? -1 : 1), behavior: 'smooth' });
  };

  // Mouse drag-to-scroll (touch already swipes natively).
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return;
    drag.current = { x: e.clientX, left: trackRef.current.scrollLeft, moved: false };
    trackRef.current.classList.add('is-dragging');
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    trackRef.current.scrollLeft = drag.current.left - dx;
  };
  const endDrag = () => {
    drag.current = null;
    trackRef.current?.classList.remove('is-dragging');
  };

  return (
    <section id="career" className="road-section">
      <div className="container">
        <div className="road-head">
          <div>
            <h2 className="road-title">{t('timeline.title')}</h2>
            <p className="road-subtitle">{t('timeline.subtitle')}</p>
          </div>
          <div className="road-controls">
            <EditHere view="story" />
            <button type="button" className="road-arrow" onClick={() => step(-1)} disabled={edges.start} aria-label={t('timeline.prev')}>
              {rtl ? '→' : '←'}
            </button>
            <button type="button" className="road-arrow" onClick={() => step(1)} disabled={edges.end} aria-label={t('timeline.next')}>
              {rtl ? '←' : '→'}
            </button>
          </div>
        </div>
      </div>

      <ol
        className="road-track"
        ref={trackRef}
        onScroll={updateEdges}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        tabIndex={0}
        aria-label={t('timeline.title')}
      >
        {stops.map((item, i) => {
          const latest = i === stops.length - 1;
          return (
            <li key={item.id} className={`road-stop ${latest ? 'is-latest' : ''}`}>
              <div className="road-marker">
                <span className="road-year">{item.year}</span>
                <span className="road-dot" aria-hidden="true">{latest ? '📍' : ''}</span>
              </div>
              <article className="road-card">
                {latest && <span className="road-here">{t('timeline.here')}</span>}
                <h3 className="road-role">{item.title}</h3>
                {item.organization && <p className="road-org">{item.organization}</p>}
                {item.description && <p className="road-desc">{item.description}</p>}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
