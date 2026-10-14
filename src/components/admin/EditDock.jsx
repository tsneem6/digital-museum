import React from 'react';
import { useMuseum } from '../../context/MuseumContext';
import './EditDock.css';

/** Floating bar shown while she's logged in and browsing her own site:
 * jump into the editor, add a project, or log out — from anywhere. */
export default function EditDock() {
  const { openEditor, logout, githubToken } = useMuseum();
  return (
    <div className="dock" role="toolbar" aria-label="Editing tools">
      <span className="dock-label">{githubToken ? '✏️ Editing mode' : '✏️ Editing (drafts only)'}</span>
      <button type="button" className="dock-btn dock-btn--main" onClick={() => openEditor()}>Open editor</button>
      <button type="button" className="dock-btn" onClick={() => openEditor('projects', 'new')}>＋ Project</button>
      <button type="button" className="dock-btn" onClick={logout} aria-label="Log out">👋</button>
    </div>
  );
}
