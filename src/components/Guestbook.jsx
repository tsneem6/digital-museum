import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { getSupabaseClient } from '../utils/supabaseClient';
import ShimmeringText from './anim/ShimmeringText';
import LottieBadge from './anim/LottieBadge';
import goldSeal from '../assets/lottie/gold-seal.json';
import './Guestbook.css';

const TABLE = 'guestbook_entries';
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

function timeAgo(iso, t, lang) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t('time.justNow');
  if (mins < 60) return t('time.minsAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('time.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t('time.daysAgo', { count: days });
  return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar' : undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Renders the Cloudflare Turnstile widget into `containerRef` once the
// challenges.cloudflare.com script has loaded, and reports the resulting
// token back via onToken. A no-op (renders nothing, reports no token
// requirement) when no site key is configured -- moderation is still the
// real backstop against spam either way, this only cuts down its volume.
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

export default function Guestbook() {
  const supabase = getSupabaseClient();
  const { t, i18n } = useTranslation();

  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const turnstileRef = useRef(null);

  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useTurnstile(turnstileRef, setTurnstileToken);

  const loadEntries = useCallback(async () => {
    if (!supabase) return;
    // RLS restricts anonymous reads to approved=true rows already, but the
    // filter is kept explicit here for clarity.
    const { data, error: fetchError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(50);
    if (fetchError) { setError(fetchError.message); return; }
    setEntries(data || []);
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    loadEntries();

    // Live updates: an entry the owner approves appears here without a
    // refresh. Filtered server-side to approved rows only, so a pending
    // submission never briefly flashes for other visitors.
    const channel = supabase
      .channel('guestbook-entries-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE, filter: 'approved=eq.true' },
        (payload) => {
          // DELETE payloads carry `old`, not `new` — moderating an entry
          // away (delete, or un-approve) must remove it live rather than
          // crash trying to read `.id` off an undefined `new`.
          if (payload.eventType === 'DELETE') {
            const oldId = payload.old?.id;
            if (oldId == null) return;
            setEntries((prev) => prev.filter((e) => e.id !== oldId));
            return;
          }
          const row = payload.new;
          if (!row) return;
          setEntries((prev) => {
            if (prev.some((e) => e.id === row.id)) {
              return prev.map((e) => (e.id === row.id ? row : e));
            }
            return [row, ...prev];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, loadEntries]);

  const post = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) return;
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError(t('gb.verify'));
      return;
    }

    setPosting(true);
    setError('');
    const { error: insertError } = await supabase.from(TABLE).insert({
      display_name: trimmedName.slice(0, 80),
      message: trimmedMessage,
      // approved defaults to false at the database level; RLS also rejects
      // any insert attempt that tries to set it true directly.
    });
    setPosting(false);
    if (insertError) { setError(insertError.message); return; }

    setName('');
    setMessage('');
    setTurnstileToken('');
    setSubmitted(true);
    if (window.turnstile && turnstileRef.current) window.turnstile.reset();
  };

  return (
    <section id="guestbook" className="guestbook-section" ref={sectionRef}>
      <div className="container">
        <motion.div
          className="guestbook-header"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label"><ShimmeringText text={t('gb.eyebrow')} /></div>
          <h2 className="guestbook-title serif">{t('gb.title')}</h2>
          <p className="guestbook-subtitle mono">{t('gb.subtitle')}</p>
        </motion.div>

        <motion.div
          className="guestbook-widget"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {!supabase ? (
            <div className="guestbook-placeholder mono">
              Guestbook not configured yet.
            </div>
          ) : (
            <>
              <div className="guestbook-composer">
                {submitted ? (
                  <div className="guestbook-submitted mono">
                    <LottieBadge animationData={goldSeal} size={48} label={t('gb.received')} />
                    {t('gb.thanks')}
                    <button type="button" className="guestbook-signout" onClick={() => setSubmitted(false)}>
                      {t('gb.another')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={post}>
                    <label htmlFor="guestbook-name" className="sr-only">{t('gb.nameLabel')}</label>
                    <input
                      id="guestbook-name"
                      className="guestbook-name-input mono"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('gb.namePlaceholder')}
                      maxLength={80}
                    />
                    <label htmlFor="guestbook-message" className="sr-only">{t('gb.noteLabel')}</label>
                    <textarea
                      id="guestbook-message"
                      className="guestbook-input mono"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t('gb.notePlaceholder')}
                      maxLength={500}
                      rows={3}
                    />
                    {TURNSTILE_SITE_KEY && <div ref={turnstileRef} className="guestbook-turnstile" />}
                    <button
                      type="submit"
                      className="guestbook-submit mono"
                      disabled={posting || !name.trim() || !message.trim() || (Boolean(TURNSTILE_SITE_KEY) && !turnstileToken)}
                    >
                      {posting ? t('gb.posting') : t('gb.sign')}
                    </button>
                    <p className="guestbook-hint mono">
                      {t('gb.hint')}
                    </p>
                  </form>
                )}
                {error && <p className="guestbook-error mono">{error}</p>}
              </div>

              <div className="guestbook-entries">
                {loaded && entries.length === 0 && (
                  <p className="guestbook-empty mono">{t('gb.empty')}</p>
                )}
                {entries.map((entry) => (
                  <div className="guestbook-entry" key={entry.id}>
                    <div className="guestbook-entry-body">
                      <div className="guestbook-entry-meta">
                        <span className="guestbook-entry-name">{entry.display_name}</span>
                        <span className="mono guestbook-entry-time">{timeAgo(entry.created_at, t, i18n.language)}</span>
                      </div>
                      <p className="guestbook-entry-message">{entry.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
