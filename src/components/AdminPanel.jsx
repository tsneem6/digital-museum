import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMuseum, DEMO_EDITOR } from '../context/MuseumContext';
import { FIRST_NAME } from '../../site.config.js';
import ProjectsEditor from './admin/ProjectsEditor';
import { NowEditor, StoryEditor, VolunteeringEditor, KindWordsEditor } from './admin/SectionEditors';
import ProfileEditor from './admin/ProfileEditor';
import PublishingEditor from './admin/PublishingEditor';
import GuestbookEditor from './admin/GuestbookEditor';
import './AdminPanel.css';

const VIEWS = [
  { id: 'projects', emoji: '🖼️', label: 'Projects', Component: ProjectsEditor },
  { id: 'now', emoji: '📌', label: 'Working on', Component: NowEditor },
  { id: 'story', emoji: '⏳', label: 'My story', Component: StoryEditor },
  { id: 'volunteering', emoji: '🤝', label: 'Giving back', Component: VolunteeringEditor },
  { id: 'testimonials', emoji: '💬', label: 'Kind words', Component: KindWordsEditor },
  { id: 'guestbook', emoji: '📖', label: 'Guestbook', Component: GuestbookEditor },
  { id: 'profile', emoji: '🙋‍♀️', label: 'About me', Component: ProfileEditor },
  { id: 'publishing', emoji: '🚀', label: 'Publishing', Component: PublishingEditor },
];

const LOGIN_CONFIGURED = DEMO_EDITOR || Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function AdminPanel() {
  const { isAdmin, adminPanel, setAdminPanel, setEditingProject } = useMuseum();

  const close = () => { setAdminPanel(false); setEditingProject(null); };

  useEffect(() => {
    if (!adminPanel) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPanel]);

  return (
    <AnimatePresence>
      {adminPanel && (
        <motion.div
          className="ed-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          {isAdmin ? <EditorDrawer onClose={close} /> : <LoginCard onClose={close} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Login ─────────────────────────────── */
function LoginCard({ onClose }) {
  const { login } = useMuseum();
  const [password, setPassword] = useState('');
  const [state, setState] = useState('idle'); // idle | checking | wrong
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setState('checking');
    const ok = await login(password);
    setState(ok ? 'idle' : 'wrong');
  };

  return (
    <motion.div
      className="ed-login"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ed-login-title"
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={(e) => e.stopPropagation()}
    >
      <button type="button" className="ed-close" onClick={onClose} aria-label="Close">×</button>
      <span className="ed-login-icon" aria-hidden="true">🔑</span>
      <h2 id="ed-login-title" className="ed-login-title">Welcome back, {FIRST_NAME}!</h2>
      <p className="ed-login-sub">Type your password to edit your museum.</p>
      {DEMO_EDITOR && <p className="ed-notice ed-demo">Test copy: any password works.</p>}

      {LOGIN_CONFIGURED ? (
        <form onSubmit={submit} className="ed-login-form">
          <label htmlFor="ed-password" className="sr-only">Password</label>
          <input
            ref={inputRef}
            id="ed-password"
            type="password"
            className={`admin-input ${state === 'wrong' ? 'is-wrong' : ''}`}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setState('idle'); }}
            placeholder="Password"
            autoComplete="current-password"
            disabled={state === 'checking'}
          />
          {state === 'wrong' && (
            <p className="ed-error" role="alert">
              That didn't work. Check the password, and that your email in “About me” matches your login.
            </p>
          )}
          <button type="submit" className="ed-btn ed-btn--primary ed-btn--block" disabled={state === 'checking' || !password}>
            {state === 'checking' ? 'Checking…' : 'Open my editor →'}
          </button>
        </form>
      ) : (
        <p className="ed-notice">
          Login isn't switched on yet. Follow <strong>START-HERE.md → Part 2</strong> to connect Supabase, then come back.
        </p>
      )}
    </motion.div>
  );
}

/* ── Editor drawer ─────────────────────── */
function EditorDrawer({ onClose }) {
  const { adminView, setAdminView, setEditingProject, githubToken, syncState, logout } = useMuseum();
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const notify = (message) => {
    setToast(message || (githubToken
      ? 'Saved! ✨ It will be live on your site in about a minute.'
      : 'Saved in this browser. Turn on 🚀 Publishing to put it online.'));
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const view = VIEWS.find(v => v.id === adminView) || VIEWS[0];
  const { Component } = view;

  const go = (id) => {
    setAdminView(id);
    if (id === 'projects') setEditingProject(null);
  };

  const status = DEMO_EDITOR
    ? { cls: 'is-off', text: 'Test copy — not published' }
    : !githubToken
    ? { cls: 'is-off', text: 'Drafts only — turn on publishing' }
    : syncState === 'saving'
      ? { cls: 'is-busy', text: 'Publishing…' }
      : syncState === 'error'
        ? { cls: 'is-error', text: 'Last save didn’t publish' }
        : { cls: 'is-on', text: 'Publishing is on' };

  return (
    <motion.aside
      className="ed-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Edit your museum"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={(e) => e.stopPropagation()}
    >
      <header className="ed-top">
        <p className="ed-hello">✏️ Hi {FIRST_NAME}! What would you like to change?</p>
        <button type="button" className={`ed-pill ${status.cls}`} onClick={() => go('publishing')}>
          <span aria-hidden="true">●</span> {status.text}
        </button>
        <button type="button" className="ed-close" onClick={onClose} aria-label="Close the editor">×</button>
      </header>

      {DEMO_EDITOR && (
        <p className="ed-demo-bar">Test copy — changes stay in this browser and are never published.</p>
      )}

      <div className="ed-body">
        <nav className="ed-nav" aria-label="Editor sections">
          {VIEWS.map(v => (
            <button
              key={v.id}
              type="button"
              className={`ed-nav-item ${v.id === view.id ? 'is-active' : ''}`}
              aria-current={v.id === view.id ? 'page' : undefined}
              onClick={() => go(v.id)}
            >
              <span aria-hidden="true">{v.emoji}</span>
              <span>{v.label}</span>
            </button>
          ))}
          <button type="button" className="ed-nav-item ed-nav-logout" onClick={logout}>
            <span aria-hidden="true">👋</span><span>Log out</span>
          </button>
        </nav>

        <div className="ed-main">
          <Component notify={notify} />
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="ed-toast"
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
