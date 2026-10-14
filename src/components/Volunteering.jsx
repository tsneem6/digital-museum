import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useMuseum } from '../context/MuseumContext';
import { resolveAsset } from '../lib/assets';
import { Lightbox } from './Lightbox';
import EditHere from './EditHere';
import './Volunteering.css';

const VISIBLE_DEFAULT = 6;
const BANNERS = ['var(--blush)', 'var(--lilac)', 'var(--mint)', 'var(--butter)'];

/** Giving back — a grid of cards, each with a photo strip (or a colourful
 * banner when there are no photos), a year badge, the role and the story. */
export default function Volunteering() {
  const { volunteering } = useMuseum();
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [lightbox, setLightbox] = useState(null); // { photos, idx }
  const [showAll, setShowAll] = useState(false);

  if (!volunteering || volunteering.length === 0) return null;

  const visible = showAll ? volunteering : volunteering.slice(0, VISIBLE_DEFAULT);
  const hidden = volunteering.length - VISIBLE_DEFAULT;

  return (
    <section id="volunteering" className="give" ref={ref}>
      <div className="container">
        <div className="give-head">
          <div>
            <h2 className="give-title">{t('vol.title')} <span aria-hidden="true">🤝</span></h2>
            <p className="give-subtitle">{t('vol.subtitle')}</p>
          </div>
          <div className="give-head-side">
            <span className="give-count">{t('vol.count', { count: volunteering.length })}</span>
            <EditHere view="volunteering" />
          </div>
        </div>

        <ul className="give-grid">
          {visible.map((item, i) => {
            const photos = item.photos || [];
            const name = item.eventTitle || item.title;
            return (
              <motion.li
                key={item.id}
                className="give-card"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: (i % VISIBLE_DEFAULT) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                {photos.length > 0 ? (
                  <div className={`give-photos give-photos--${Math.min(photos.length, 3)}`}>
                    {photos.slice(0, 3).map((src, pi) => (
                      <button
                        key={pi}
                        type="button"
                        className="give-photo"
                        onClick={() => setLightbox({ photos, idx: pi })}
                        aria-label={t('vol.photoLabel', { name, n: pi + 1, total: photos.length })}
                      >
                        <img src={resolveAsset(src)} alt="" loading="lazy" decoding="async" />
                        {pi === 2 && photos.length > 3 && <span className="give-more-photos">+{photos.length - 3}</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="give-banner" style={{ '--banner': BANNERS[i % BANNERS.length] }} aria-hidden="true">
                    <span>🤝</span><span>💖</span><span>✨</span>
                  </div>
                )}

                <div className="give-body">
                  {item.year && <span className="give-year">{item.year}</span>}
                  <h3 className="give-name">{name}</h3>
                  <div className="give-meta">
                    {item.eventTitle && item.title && item.title !== item.eventTitle && (
                      <span className="give-role">{item.title}</span>
                    )}
                    {item.organization && item.organization !== item.eventTitle && (
                      <span className="give-org">{item.organization}</span>
                    )}
                  </div>
                  {item.description && <p className="give-desc">{item.description}</p>}
                </div>
              </motion.li>
            );
          })}
        </ul>

        {hidden > 0 && (
          <div className="give-more-wrap">
            <button type="button" className="give-more" onClick={() => setShowAll(s => !s)} aria-expanded={showAll}>
              {showAll ? t('vol.showFewer') : t('vol.showMore', { count: hidden })}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <Lightbox images={lightbox.photos} startIndex={lightbox.idx} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
