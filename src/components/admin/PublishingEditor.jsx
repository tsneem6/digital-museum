import React, { useState } from 'react';
import { useMuseum } from '../../context/MuseumContext';
import { SITE } from '../../../site.config.js';
import { buildDataFile } from '../../lib/dataFile';
import { ViewHeader } from './ui';

const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new';

/** Publishing — connect the editor to GitHub so saves go live, plus backup. */
export default function PublishingEditor() {
  const {
    githubToken, setGithubToken, syncState, syncError,
    projects, settings, timeline, testimonials, volunteering, resetToDefaults,
  } = useMuseum();
  const [check, setCheck] = useState(null); // null | 'checking' | { ok, message }

  const testConnection = async () => {
    setCheck('checking');
    try {
      const res = await fetch(`https://api.github.com/repos/${SITE.githubOwner}/${SITE.githubRepo}`, {
        headers: { Authorization: `Bearer ${githubToken}` },
      });
      if (res.status === 401) throw new Error('GitHub didn’t accept this key. Copy it again, or make a new one.');
      if (res.status === 404) throw new Error(`Can't find ${SITE.githubOwner}/${SITE.githubRepo}. Check the key has access to this repository, and that githubOwner in site.config.js is your username.`);
      if (!res.ok) throw new Error(`GitHub answered with an error (${res.status}). Try again in a minute.`);
      const repo = await res.json();
      if (!repo.permissions?.push) throw new Error('This key can read your site but not save to it. Give it “Contents: Read and write”.');
      setCheck({ ok: true, message: 'Connected! Every save now goes live in about a minute.' });
    } catch (e) {
      setCheck({ ok: false, message: e.message || 'Could not reach GitHub. Check your internet and try again.' });
    }
  };

  const downloadBackup = () => {
    const blob = new Blob([buildDataFile({ projects, settings, timeline, testimonials, volunteering })], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ed-view">
      <ViewHeader
        emoji="🚀"
        title="Publishing"
        intro="Connect your editor to GitHub once, and every save goes live on your site by itself."
      />

      <div className={`ed-status-card ${githubToken ? 'is-on' : 'is-off'}`}>
        <strong>{githubToken ? '● Publishing is on' : '● Publishing is off'}</strong>
        <p>
          {githubToken
            ? syncState === 'error'
              ? `Your last save didn't go live: ${syncError}`
              : 'Saves are sent to GitHub and appear on your site about a minute later.'
            : 'Right now your edits are only saved in this browser, and nobody else can see them yet.'}
        </p>
      </div>

      <ol className="ed-steps">
        <li>
          <strong>Make a key on GitHub.</strong> Open{' '}
          <a href={TOKEN_URL} target="_blank" rel="noopener noreferrer">GitHub → new fine-grained token ↗</a>.
          Name it <em>museum editor</em>, choose <em>Only select repositories → {SITE.githubRepo}</em>, and under
          <em> Repository permissions</em> set <em>Contents</em> to <em>Read and write</em>. Click <em>Generate token</em> and copy it.
        </li>
        <li>
          <strong>Paste it here.</strong> It's kept only in this browser tab, so you'll paste it again next time you open the editor in a new tab.
          <div className="ed-token-row">
            <label htmlFor="ed-token" className="sr-only">GitHub key</label>
            <input
              id="ed-token"
              type="password"
              className="admin-input"
              value={githubToken}
              onChange={e => { setGithubToken(e.target.value.trim()); setCheck(null); }}
              placeholder="github_pat_…"
              autoComplete="off"
            />
            <button type="button" className="ed-btn ed-btn--primary" onClick={testConnection} disabled={!githubToken || check === 'checking'}>
              {check === 'checking' ? 'Checking…' : 'Test connection'}
            </button>
          </div>
          {check && check !== 'checking' && (
            <p className={check.ok ? 'ed-ok' : 'ed-error'} role="status">{check.ok ? '✓ ' : '✗ '}{check.message}</p>
          )}
        </li>
        <li><strong>That's it!</strong> Keep this key private, like a password.</li>
      </ol>

      <h3 className="ed-subhead">Backup</h3>
      <p className="ed-view-intro">Download everything on your site as one file — handy before big changes.</p>
      <div className="ed-row">
        <button type="button" className="ed-btn ed-btn--soft" onClick={downloadBackup}>⬇ Download backup</button>
        <button type="button" className="ed-btn ed-btn--danger" onClick={resetToDefaults}>Undo all edits since the last publish</button>
      </div>
    </div>
  );
}
