import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useMuseum } from '../context/MuseumContext';
import { categoryIcon } from '../../site.config.js';
import ProjectCard from './ProjectCard';
import './Gallery.css';

const ALL = 'All';

// Everything a visitor might type to find a project.
const haystack = (p) =>
  [p.title, p.subtitle, p.description, p.category, p.year, ...(p.tech || [])]
    .filter(Boolean).join(' ').toLowerCase();

export default function Gallery() {
  const { projects, isAdmin, openEditor } = useMuseum();
  const { t } = useTranslation();
  const [filter, setFilter] = useState(ALL);
  const [query, setQuery] = useState('');

  // Only categories that at least one project actually uses become chips —
  // a chip that always shows an empty grid is a dead end.
  const cats = useMemo(() => {
    const counts = new Map();
    projects.forEach(p => p.category && counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return [...counts.entries()];
  }, [projects]);

  const q = query.trim().toLowerCase();
  const filtered = projects.filter(p =>
    (filter === ALL || p.category === filter) && (!q || haystack(p).includes(q))
  );
  const isFiltered = filter !== ALL || q;

  const handleEdit = (project) => openEditor('projects', project);

  const clear = () => { setFilter(ALL); setQuery(''); };

  return (
    <section id="gallery" className="gallery-section">
      <div className="container">

        <div className="gallery-header">
          <h2 className="gallery-title serif">
            {t('gallery.title1')} <em className="gallery-title-script">{t('gallery.title2')}</em>
          </h2>
          <p className="gallery-desc">{t('gallery.desc')}</p>
          {isAdmin && (
            <button
              className="gallery-add-btn"
              onClick={() => openEditor('projects', 'new')}
            >
              + {t('gallery.add')}
            </button>
          )}
        </div>

        {/* Filter bar: search + category chips */}
        <div className="gallery-toolbar" role="search">
          <label className="gallery-search">
            <span className="gallery-search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.5" y2="16.5" />
              </svg>
            </span>
            <span className="sr-only">{t('gallery.searchLabel')}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('gallery.searchPlaceholder')}
            />
          </label>

          <div className="gallery-chips" role="group" aria-label={t('gallery.filterLabel')}>
            {[[ALL, projects.length], ...cats].map(([cat, count]) => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`gallery-chip ${active ? 'is-active' : ''}`}
                  onClick={() => setFilter(cat)}
                  aria-pressed={active}
                >
                  {active && (
                    <motion.span
                      layoutId="gallery-chip-bg"
                      className="gallery-chip-bg"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="gallery-chip-icon" aria-hidden="true">{cat === ALL ? '✨' : categoryIcon(cat)}</span>
                  <span className="gallery-chip-label">{cat === ALL ? t('gallery.all') : cat}</span>
                  <span className="gallery-chip-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="gallery-status" aria-live="polite">
            <span>{t('gallery.showing', { shown: filtered.length, total: projects.length })}</span>
            {isFiltered && (
              <button type="button" className="gallery-clear" onClick={clear}>
                {t('gallery.clear')} ✕
              </button>
            )}
          </div>
        </div>

        <motion.div layout className="gallery-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((proj, i) => (
              <ProjectCard key={proj.id} project={proj} index={i} onEdit={handleEdit} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="gallery-empty"
          >
            <span className="gallery-empty-icon" aria-hidden="true">🎀</span>
            <p>{t('gallery.empty')}</p>
            <button type="button" className="gallery-clear" onClick={clear}>{t('gallery.showAll')}</button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
