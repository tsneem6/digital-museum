import React from 'react';
import { useMuseum } from '../context/MuseumContext';
import './EditHere.css';

/** A small "✎ Edit" pill that only the logged-in owner sees. It opens the
 * editor straight at the matching section, so she edits what she's looking at. */
export default function EditHere({ view, project = null, label = 'Edit', className = '' }) {
  const { isAdmin, openEditor } = useMuseum();
  if (!isAdmin) return null;
  return (
    <button
      type="button"
      className={`edit-here ${className}`}
      onClick={(e) => { e.stopPropagation(); openEditor(view, project); }}
    >
      ✎ {label}
    </button>
  );
}
