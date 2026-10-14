import React, { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '../../utils/supabaseClient';
import { ViewHeader } from './ui';

const TABLE = 'guestbook_entries';

// Visitors' notes arrive unapproved. Approve to show one on the site, or
// remove it. Row-level security only lets the owner's own login do this.
export default function GuestbookEditor() {
  const supabase = getSupabaseClient();
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setStatus('loading');
    const { data, error: err } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
    if (err) { setError(err.message); setStatus('error'); return; }
    setEntries(data || []);
    setStatus('ready');
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setBusyId(id);
    const { error: err } = await supabase.from(TABLE).update({ approved: true }).eq('id', id);
    setBusyId(null);
    if (err) { setError(err.message); return; }
    setEntries(list => list.map(e => (e.id === id ? { ...e, approved: true } : e)));
  };

  const remove = async (entry) => {
    if (entry.approved && !confirm(`Remove the note from ${entry.display_name}?`)) return;
    setBusyId(entry.id);
    const { error: err } = await supabase.from(TABLE).delete().eq('id', entry.id);
    setBusyId(null);
    if (err) { setError(err.message); return; }
    setEntries(list => list.filter(e => e.id !== entry.id));
  };

  const pending = entries.filter(e => !e.approved);
  const published = entries.filter(e => e.approved);

  const card = (e, actions) => (
    <li key={e.id} className="ed-note">
      <div className="ed-note-head">
        <strong>{e.display_name}</strong>
        <span>{new Date(e.created_at).toLocaleString()}</span>
      </div>
      <p>{e.message}</p>
      <div className="ed-row">{actions}</div>
    </li>
  );

  return (
    <div className="ed-view">
      <ViewHeader emoji="📖" title="Guestbook" intro="New notes wait here until you approve them.">
        {supabase && <button type="button" className="ed-btn ed-btn--ghost" onClick={load}>↻ Refresh</button>}
      </ViewHeader>

      {!supabase && <p className="ed-empty">The guestbook isn't connected yet — see START-HERE.md, Part 2.</p>}
      {error && <p className="ed-error" role="alert">{error}</p>}
      {supabase && status === 'loading' && <p className="ed-empty">Loading notes…</p>}

      {supabase && status === 'ready' && (
        <>
          <h3 className="ed-subhead">Waiting for you ({pending.length})</h3>
          {pending.length === 0 && <p className="ed-empty">No new notes. 💌</p>}
          <ul className="ed-notes">
            {pending.map(e => card(e, (
              <>
                <button type="button" className="ed-btn ed-btn--primary" disabled={busyId === e.id} onClick={() => approve(e.id)}>✓ Approve</button>
                <button type="button" className="ed-btn ed-btn--ghost" disabled={busyId === e.id} onClick={() => remove(e)}>Remove</button>
              </>
            )))}
          </ul>

          <h3 className="ed-subhead">On your site ({published.length})</h3>
          {published.length === 0 && <p className="ed-empty">Nothing published yet.</p>}
          <ul className="ed-notes">
            {published.map(e => card(e, (
              <button type="button" className="ed-btn ed-btn--ghost" disabled={busyId === e.id} onClick={() => remove(e)}>Remove</button>
            )))}
          </ul>
        </>
      )}
    </div>
  );
}
