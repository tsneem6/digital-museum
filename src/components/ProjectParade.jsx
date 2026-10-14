import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMuseum } from '../context/MuseumContext';
import { resolveAsset } from '../lib/assets';
import { categoryIcon } from '../../site.config.js';
import './ProjectParade.css';

const MIN_ITEMS = 8; // enough cards to fill a wide screen before the loop repeats

/** A conveyor belt of mini polaroids that glides past on its own (pure CSS,
 * no scroll tracking). Hover or focus pauses it; click opens the project. */
export default function ProjectParade() {
  const { projects, setViewingProject } = useMuseum();
  const { t } = useTranslation();
  if (projects.length < 2) return null;

  // Repeat the list until it is long enough, then render it twice so the
  // belt can loop seamlessly by sliding exactly one copy's width.
  const reps = Math.ceil(MIN_ITEMS / projects.length);
  const run = Array.from({ length: reps }, () => projects).flat();
  const seconds = run.length * 4.5;

  const card = (p, i, copy) => (
    <li key={`${copy}-${i}`} className="parade-item" aria-hidden={copy === 1 || undefined}>
      <button
        type="button"
        className="parade-card"
        style={{ '--tilt': `${(i % 2 ? 1 : -1) * (1 + (i % 3) * 0.6)}deg` }}
        onClick={() => setViewingProject(p)}
        tabIndex={copy === 1 ? -1 : undefined}
      >
        <span
          className={`parade-photo ${p.coverImage ? '' : 'is-plain'}`}
          style={p.coverImage ? { backgroundImage: `url(${resolveAsset(p.coverImage)})` } : undefined}
        >
          {!p.coverImage && <span aria-hidden="true">{categoryIcon(p.category)}</span>}
        </span>
        <span className="parade-title">{p.title}</span>
        <span className="parade-cat">{categoryIcon(p.category)} {p.category}</span>
      </button>
    </li>
  );

  return (
    <section className="parade" aria-label={t('parade.label')}>
      <div className="container parade-head">
        <h2 className="parade-heading">{t('parade.title')}</h2>
        <p className="parade-hint">{t('parade.hint')}</p>
      </div>
      <div className="parade-viewport">
        <ul className="parade-belt" style={{ '--duration': `${seconds}s` }}>
          {run.map((p, i) => card(p, i, 0))}
          {run.map((p, i) => card(p, i, 1))}
        </ul>
      </div>
    </section>
  );
}
