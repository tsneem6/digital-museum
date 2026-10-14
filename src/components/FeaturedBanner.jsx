import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useMuseum } from '../context/MuseumContext';
import { resolveAsset, isRealLink } from '../lib/assets';
import { categoryIcon } from '../../site.config.js';
import EditHere from './EditHere';
import './FeaturedBanner.css';

/** My favourite — the project marked Featured, shown as a fanned pile of
 * photos with a rosette, next to the story of why she loves it. */
export default function FeaturedBanner() {
  const { projects, setViewingProject } = useMuseum();
  const { t } = useTranslation();
  const featured = projects.find(p => p.featured);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  if (!featured) return null;

  // Up to three photos for the pile: cover on top, then the gallery.
  const photos = [featured.coverImage, ...(featured.screenshots || [])]
    .filter(Boolean)
    .filter((src, i, all) => all.indexOf(src) === i)
    .slice(0, 3);
  const tech = featured.tech || [];
  const open = () => setViewingProject(featured);

  return (
    <section id="featured" className="fav" ref={ref} style={{ '--proj': featured.color || 'var(--blush)' }}>
      <div className="container fav-grid">
        <motion.button
          type="button"
          className="fav-pile"
          onClick={open}
          aria-label={t('featured.openLabel', { title: featured.title })}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {photos.length > 0 ? (
            // Drawn back-to-front so the cover (position 0) ends up on top.
            [...photos].reverse().map((src, i, arr) => (
              <span
                key={src}
                className={`fav-photo fav-photo--${arr.length - 1 - i}`}
                style={{ backgroundImage: `url(${resolveAsset(src)})` }}
              />
            ))
          ) : (
            <span className="fav-photo fav-photo--0 fav-photo--plain">
              <span aria-hidden="true">{categoryIcon(featured.category)}</span>
            </span>
          )}
          <span className="fav-rosette" aria-hidden="true">
            <span>♡</span>
            <small>{t('featured.badge')}</small>
          </span>
        </motion.button>

        <motion.div
          className="fav-text"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="fav-kicker">{t('featured.eyebrow')}</p>
          <h2 className="fav-title">{featured.title}</h2>

          {featured.subtitle && (
            <blockquote className="fav-why">
              <span className="fav-why-label">{t('featured.why')}</span>
              {featured.subtitle}
            </blockquote>
          )}

          {featured.description && <p className="fav-desc">{featured.description}</p>}

          <ul className="fav-facts">
            {featured.category && <li><span aria-hidden="true">{categoryIcon(featured.category)}</span> {featured.category}</li>}
            {featured.year && <li>📅 {featured.year}</li>}
            {featured.status && <li>⭐ {featured.status}</li>}
            {tech.slice(0, 3).map(tag => <li key={tag} className="fav-tool">{tag}</li>)}
          </ul>

          <div className="fav-actions">
            <button type="button" className="fav-btn" onClick={open}>{t('featured.explore')}</button>
            {isRealLink(featured.link) && (
              <a className="fav-btn fav-btn--soft" href={featured.link} target="_blank" rel="noopener noreferrer">
                {t('modal.visitLive')} ↗
              </a>
            )}
            <EditHere view="projects" project={featured} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
