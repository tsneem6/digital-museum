import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { useMuseum } from '../context/MuseumContext';
import { resolveAsset, isRealLink } from '../lib/assets';
import ExhibitReel from './ExhibitReel';
import { Lightbox } from './Lightbox';
import './ProjectModal.css';
import './CuratorChat.css'; // the FAB renders before the lazy chat chunk loads

// Loaded on first open — it pulls in supabase-js, which ordinary visitors
// browsing exhibits never need.
const CuratorChat = lazy(() => import('./CuratorChat'));

// "Ask the Curator" is opt-in: it needs the ask-curator Supabase function
// deployed (see README → Optional: Ask the Curator).
const CURATOR_ENABLED =
  import.meta.env.VITE_CURATOR_ENABLED === 'true' && Boolean(import.meta.env.VITE_SUPABASE_URL);

// Collapsed write-ups clip with CSS line-clamp, which doesn't clip
// predictably across mixed block elements (headings, lists) — so the
// clamped preview shows plain stripped text instead of rendered Markdown.
// Past write-ups were typed by hand with ad-hoc conventions CommonMark
// doesn't recognize: a leading tab before a list number reads as an
// indented code block (4-space/1-tab rule), and "•" isn't a bullet marker
// remark understands. Normalize both to real Markdown before parsing.
function normalizeMarkdown(text) {
  return text
    .replace(/\n[ \t]*(\d+)\.\t+/g, '\n$1. ')
    .replace(/(^|\n)[ \t]*•[ \t]*/g, '$1- ');
}

function stripMarkdown(text) {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    .replace(/^[-•]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
}

/* Write-ups longer than this start collapsed behind a "Continue reading" toggle. */
const WRITEUP_CLAMP_CHARS = 420;

export default function ProjectModal() {
  const { viewingProject, setViewingProject } = useMuseum();
  const { t } = useTranslation();
  const proj = viewingProject;
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [writeupOpen, setWriteupOpen] = useState(false);
  const [reelOpen, setReelOpen] = useState(false);
  const [curatorOpen, setCuratorOpen] = useState(false);
  const panelRef = useRef(null);

  // A reel needs at least two frames to be worth playing.
  const reelFrames = proj ? [proj.coverImage, ...(proj.screenshots || [])].filter(Boolean).length : 0;

  const writeup = normalizeMarkdown(proj?.longDescription || proj?.description || '');
  const writeupIsLong = writeup.length > WRITEUP_CLAMP_CHARS;

  // Every project opens with its write-up collapsed again.
  useEffect(() => { setWriteupOpen(false); setCuratorOpen(false); }, [proj?.id]);

  useEffect(() => {
    document.body.style.overflow = proj ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [proj]);

  // Move focus into the dialog on open; give it back on close.
  useEffect(() => {
    if (!proj) return;
    const opener = document.activeElement;
    panelRef.current?.focus();
    return () => { if (opener instanceof HTMLElement) opener.focus(); };
  }, [proj]);

  const trapFocus = (e) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (reelOpen) { setReelOpen(false); return; }
      if (lightboxIdx === null) setViewingProject(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setViewingProject, lightboxIdx, reelOpen]);

  const allScreenshots = proj?.screenshots || [];

  return (
    <>
      <AnimatePresence>
        {proj && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setViewingProject(null)}
          >
            <motion.div
              className="modal-panel"
              role="dialog"
              aria-modal="true"
              aria-label={proj.title}
              tabIndex={-1}
              ref={panelRef}
              onKeyDown={trapFocus}
             
              /* Opacity-only: a scale/translate here would distort the cover's
                 layout morph. The morphing hero carries the motion instead. */
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Hero image / swatch — morphs from the gallery card via layoutId */}
              <motion.div
                layoutId={`cover-${proj.id}`}
                className={`modal-swatch ${proj.coverImage ? '' : 'proj-bg'}`}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={proj.coverImage
                  ? { backgroundImage: `url(${resolveAsset(proj.coverImage)})` }
                  : { '--proj': proj.color || 'var(--blush)' }
                }
                onClick={() => proj.coverImage && setLightboxIdx(-1)}
                role={proj.coverImage ? 'img' : undefined}
                aria-label={proj.coverImage ? `Cover image for ${proj.title}` : undefined}
              >
                <div
                  className="modal-swatch-glow"
                  style={{ background: proj.accentColor }}
                ></div>
                {proj.coverImage && <div className="modal-cover-overlay"></div>}

                <div className="modal-swatch-info">
                  <span className="mono modal-cat">{proj.category} · {proj.year}</span>
                  {proj.status && <span className="mono modal-status">{proj.status}</span>}
                  {reelFrames >= 2 && (
                    <button
                      type="button"
                      className="modal-reel-btn mono"
                      onClick={(e) => { e.stopPropagation(); setReelOpen(true); }}
                    >
                      ▶ {t('modal.playReel')}
                    </button>
                  )}
                </div>

                <button className="modal-close" onClick={() => setViewingProject(null)} aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </motion.div>

              <div className="modal-body">
                {/* Header */}
                <div className="modal-header">
                  <motion.h2
                    className="modal-title serif"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                  >
                    {proj.title}
                  </motion.h2>
                  {proj.subtitle && (
                    <motion.p
                      className="modal-subtitle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {proj.subtitle}
                    </motion.p>
                  )}
                </div>

                {/* Long description — long write-ups start clamped */}
                <motion.div
                  className="modal-long-desc-wrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                >
                  {writeupIsLong && !writeupOpen ? (
                    <p className="modal-long-desc clamped">{stripMarkdown(writeup)}</p>
                  ) : (
                    <div className="modal-long-desc modal-long-desc-md">
                      <ReactMarkdown>{writeup}</ReactMarkdown>
                    </div>
                  )}
                  {writeupIsLong && (
                    <button
                      type="button"
                      className="modal-readmore mono"
                      onClick={() => setWriteupOpen(o => !o)}
                      aria-expanded={writeupOpen}
                    >
                      {writeupOpen ? t('modal.showLess') : t('modal.readMore')}
                    </button>
                  )}
                </motion.div>

                {/* Screenshots gallery */}
                {allScreenshots.length > 0 && (
                  <motion.div
                    className="modal-gallery"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <h3 className="modal-heading serif">{t('modal.screenshots')}</h3>
                    <div className="modal-gallery-grid">
                      {allScreenshots.map((src, i) => (
                        <button
                          key={i}
                          className="modal-thumb"
                          onClick={() => setLightboxIdx(i)}
                          data-cursor
                        >
                          <img src={resolveAsset(src)} alt={`${proj.title} — screenshot ${i + 1} of ${allScreenshots.length}`} loading="lazy" decoding="async" />
                          <div className="modal-thumb-hover mono">View</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Tools & materials — only when the project lists any */}
                {proj.tech?.length > 0 && (
                  <motion.div
                    className="modal-tech-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                  >
                    <h3 className="modal-heading serif">{t('modal.stack')}</h3>
                    <div className="modal-tech-list">
                      {proj.tech.map((t, i) => (
                        <span key={i} className="modal-tech-tag mono">{t}</span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Instructor — only when the project credits one */}
                {proj.instructor?.name && (
                  <motion.div
                    className="modal-collab-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.37, duration: 0.6 }}
                  >
                    <h3 className="modal-heading serif">{t('modal.instructor')}</h3>
                    <ul className="modal-collab-list">
                      <li className="modal-collab-item">
                        {isRealLink(proj.instructor.url) ? (
                          <a href={proj.instructor.url} className="modal-collab-name" target="_blank" rel="noreferrer">{proj.instructor.name}</a>
                        ) : (
                          <span className="modal-collab-name">{proj.instructor.name}</span>
                        )}
                        {(proj.instructor.title || proj.instructor.organization) && (
                          <span className="modal-collab-role mono">
                            {[proj.instructor.title, proj.instructor.organization].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </li>
                    </ul>
                  </motion.div>
                )}

                {/* Collaborators */}
                {proj.collaborators && proj.collaborators.length > 0 && (
                  <motion.div
                    className="modal-collab-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.38, duration: 0.6 }}
                  >
                    <h3 className="modal-heading serif">{t('modal.collaborators')}</h3>
                    <ul className="modal-collab-list">
                      {proj.collaborators.map((c, i) => (
                        <li key={i} className="modal-collab-item">
                          {isRealLink(c.url) ? (
                            <a href={c.url} className="modal-collab-name" target="_blank" rel="noreferrer">{c.name}</a>
                          ) : (
                            <span className="modal-collab-name">{c.name}</span>
                          )}
                          {c.role && <span className="modal-collab-role mono">{c.role}</span>}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* CTA */}
                {(isRealLink(proj.repo) || isRealLink(proj.link)) && (
                  <motion.div
                    className="modal-actions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {isRealLink(proj.repo) && (
                      <a href={proj.repo} className="modal-btn modal-btn-outline mono" target="_blank" rel="noreferrer">
                        {t('modal.repository')}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    )}
                    {isRealLink(proj.link) && (
                      <a href={proj.link} className="modal-btn modal-btn-gold mono" target="_blank" rel="noreferrer">
                        {t('modal.visitLive')}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </a>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exhibit reel */}
      <AnimatePresence>
        {reelOpen && proj && (
          <ExhibitReel project={proj} onClose={() => setReelOpen(false)} />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && proj && (
          <Lightbox
            images={lightboxIdx === -1 ? [proj.coverImage] : allScreenshots}
            startIndex={lightboxIdx === -1 ? 0 : lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>

      {/* Ask the Curator — a fixed FAB rather than squeezed into the swatch
          header, so it never fights the reel button/close button for space
          at small widths. Hidden while its own panel is open. */}
      <AnimatePresence>
        {CURATOR_ENABLED && proj && !curatorOpen && (
          <motion.button
            type="button"
            className="curator-fab"
            onClick={() => setCuratorOpen(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
            aria-label="Ask the Curator"
          >
            💬
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {curatorOpen && proj && (
          <Suspense fallback={null}>
            <CuratorChat project={proj} onClose={() => setCuratorOpen(false)} />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}
