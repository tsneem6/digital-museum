import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabaseClient } from '../utils/supabaseClient';
import './CuratorChat.css';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const MAX_QUESTION_CHARS = 500;

// Renders the Turnstile widget once, when the panel first opens — reused
// verbatim from Guestbook.jsx's useTurnstile pattern (same script-load/
// render/cleanup logic), scoped to this component since the two never
// mount at the same time.
function useTurnstile(containerRef, onToken) {
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !containerRef.current) return;

    let widgetId = null;
    let cancelled = false;

    const render = () => {
      if (cancelled || !window.turnstile || !containerRef.current) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        callback: (token) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetId !== null && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [containerRef, onToken]);
}

function sessionKey() {
  const existing = sessionStorage.getItem('curator_session_key');
  if (existing) return existing;
  const key = crypto.randomUUID();
  sessionStorage.setItem('curator_session_key', key);
  return key;
}

export default function CuratorChat({ project, onClose }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const threadRef = useRef(null);

  useTurnstile(turnstileRef, setTurnstileToken);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const ask = async (e) => {
    e.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setMessages(m => [...m, { role: 'system', text: 'Verify you\'re human first, then ask again.' }]);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessages(m => [...m, { role: 'system', text: 'The curator is unavailable right now.' }]);
      return;
    }

    setMessages(m => [...m, { role: 'visitor', text }]);
    setQuestion('');
    setBusy(true);
    try {
      const base = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${base}/functions/v1/ask-curator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          question: text,
          sessionKey: sessionKey(),
          turnstileToken,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not reach the curator right now.');
      setMessages(m => [...m, { role: 'curator', text: json.answer }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'system', text: err.message || 'Could not reach the curator right now.' }]);
    } finally {
      setBusy(false);
      if (window.turnstile && turnstileRef.current) window.turnstile.reset();
      setTurnstileToken('');
    }
  };

  return (
    <motion.div
      className="curator-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3 }}
    >
      <div className="curator-header">
        <span className="mono">💬 Ask the Curator — {project.title}</span>
        <button type="button" className="curator-close" onClick={onClose} aria-label="Close">×</button>
      </div>

      <div className="curator-thread" ref={threadRef}>
        {messages.length === 0 && (
          <p className="curator-empty mono">Ask anything about this exhibit — how it was built, what it does, the tech behind it.</p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`curator-bubble curator-bubble--${m.role}`}
            >
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {busy && <div className="curator-bubble curator-bubble--curator curator-typing">···</div>}
      </div>

      <form onSubmit={ask} className="curator-form">
        {TURNSTILE_SITE_KEY && <div ref={turnstileRef} className="curator-turnstile" />}
        <div className="curator-input-row">
          <input
            className="curator-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question…"
            maxLength={MAX_QUESTION_CHARS}
            disabled={busy}
          />
          <button type="submit" className="curator-send" disabled={busy || !question.trim()}>
            {busy ? '…' : '→'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
