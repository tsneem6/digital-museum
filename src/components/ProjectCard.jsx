import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useMuseum } from '../context/MuseumContext';
import { resolveAsset, isRealLink } from '../lib/assets';
import { getCount, incrementCount } from '../utils/counterApi';
import { categoryIcon } from '../../site.config.js';
import SlidingNumber from './anim/SlidingNumber';
import './ProjectCard.css';

// Polaroids pinned slightly askew — indexed, not random, so the wall looks
// the same on every visit. Each card straightens up when hovered.
const TILTS = [-1.1, 0.8, -0.6, 1.2, -0.9, 0.7];
const TAPES = ['var(--blush)', 'var(--lilac)', 'var(--mint)', 'var(--butter)'];

export default function ProjectCard({ project, index, onEdit }) {
  const { isAdmin, deleteProject, setViewingProject } = useMuseum();
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const open = () => setViewingProject(project);
  const tech = project.tech || [];

  // ♡ counter — shared across visitors via counterapi.dev
  const [likes, setLikes] = useState(project.likes || 0);
  const [hasLiked, setHasLiked] = useState(() => {
    try { return localStorage.getItem(`hasLiked_${project.id}`) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    getCount(project.id).then(count => {
      if (count !== null) setLikes(count);
    });
  }, [project.id]);

  const handleLike = (e) => {
    e.stopPropagation();
    const isLiking = !hasLiked;
    setLikes(prev => isLiking ? prev + 1 : Math.max(0, prev - 1));
    setHasLiked(isLiking);
    try {
      if (isLiking) localStorage.setItem(`hasLiked_${project.id}`, 'true');
      else localStorage.removeItem(`hasLiked_${project.id}`);
    } catch { /* private mode */ }
    incrementCount(project.id, isLiking ? 'up' : 'down').then(count => {
      if (count !== null) setLikes(count);
    });
  };

  return (
    <motion.article
      ref={ref}
      layout
      className="pc"
      style={{
        '--tilt': `${TILTS[index % TILTS.length]}deg`,
        '--tape': TAPES[index % TAPES.length],
        '--proj': project.color || 'var(--blush)',
        '--proj-accent': project.accentColor || 'var(--gold)',
      }}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onClick={open}
      data-cursor
    >
      <span className="pc-tape" aria-hidden="true" />

      {/* Photo — shares a layoutId with the modal so it morphs open */}
      <motion.div
        layoutId={`cover-${project.id}`}
        className={`pc-photo ${project.coverImage ? 'has-cover' : 'is-plain'}`}
        style={project.coverImage ? { backgroundImage: `url(${resolveAsset(project.coverImage)})` } : undefined}
        role={project.coverImage ? 'img' : undefined}
        aria-label={project.coverImage ? `Cover image for ${project.title}` : undefined}
      >
        {!project.coverImage && (
          <span className="pc-photo-emoji" aria-hidden="true">{categoryIcon(project.category)}</span>
        )}
        <div className="pc-photo-chips">
          {project.year && <span className="pc-chip">{project.year}</span>}
          {project.status && <span className="pc-chip pc-chip--status">{project.status}</span>}
        </div>
        {project.screenshots?.length > 0 && (
          <span className="pc-chip pc-chip--photos" title={t('card.photos', { count: project.screenshots.length })}>
            📷 {project.screenshots.length}
          </span>
        )}
      </motion.div>

      <div className="pc-body">
        <span className="pc-sticker">
          <span aria-hidden="true">{categoryIcon(project.category)}</span> {project.category}
        </span>

        <h3 className="pc-title">
          <button type="button" className="pc-title-btn" onClick={(e) => { e.stopPropagation(); open(); }}>
            {project.title}
          </button>
        </h3>

        {(project.subtitle || project.description) && (
          <p className="pc-desc">{project.subtitle || project.description}</p>
        )}

        {tech.length > 0 && (
          <ul className="pc-tags" aria-label={t('modal.stack')}>
            {tech.slice(0, 3).map((tag, i) => <li key={i} className="pc-tag">{tag}</li>)}
            {tech.length > 3 && <li className="pc-tag pc-tag--more">+{tech.length - 3}</li>}
          </ul>
        )}

        <div className="pc-footer">
          <button
            type="button"
            className={`pc-heart ${hasLiked ? 'is-liked' : ''}`}
            onClick={handleLike}
            aria-pressed={hasLiked}
            aria-label={t('card.like')}
            title={t('card.like')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <SlidingNumber value={likes} />
          </button>

          {isRealLink(project.link) && (
            <a href={project.link} className="pc-icon" aria-label={t('modal.visitLive')} title={t('modal.visitLive')} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>↗</a>
          )}

          <span className="pc-open" aria-hidden="true">{t('card.open')} {t('nav.arrow')}</span>

          {isAdmin && (
            <span className="pc-admin">
              <button type="button" className="pc-admin-btn" onClick={(e) => { e.stopPropagation(); onEdit(project); }} title="Edit">✎</button>
              <button type="button" className="pc-admin-btn pc-admin-btn--delete" onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${project.title}"?`)) deleteProject(project.id); }} title="Delete">🗑</button>
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
