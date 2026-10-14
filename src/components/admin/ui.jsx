import React, { useEffect, useId, useState } from 'react';

/** A labelled form control. `children` receives the generated id so the
 * label and input stay linked for screen readers. */
export function Field({ label, hint, children, wide = false }) {
  const id = useId();
  return (
    <div className={`ed-field ${wide ? 'ed-field--wide' : ''}`}>
      <label className="ed-label" htmlFor={id}>{label}</label>
      {children(id)}
      {hint && <p className="ed-hint">{hint}</p>}
    </div>
  );
}

/** Section heading at the top of each editor view. */
export function ViewHeader({ emoji, title, intro, children }) {
  return (
    <header className="ed-view-head">
      <div>
        <h2 className="ed-view-title"><span aria-hidden="true">{emoji}</span> {title}</h2>
        {intro && <p className="ed-view-intro">{intro}</p>}
      </div>
      {children && <div className="ed-view-actions">{children}</div>}
    </header>
  );
}

/** Sticky bar at the bottom of a form: shows whether there are unsaved
 * changes and holds the Save button. */
export function SaveBar({ dirty, onCancel, saveLabel = 'Save changes', cancelLabel = 'Undo changes' }) {
  return (
    <div className={`ed-savebar ${dirty ? 'is-dirty' : ''}`}>
      <span className="ed-savebar-status">
        {dirty ? '● You have unsaved changes' : '✓ Everything is saved'}
      </span>
      {dirty && onCancel && (
        <button type="button" className="ed-btn ed-btn--ghost" onClick={onCancel}>{cancelLabel}</button>
      )}
      <button type="submit" className="ed-btn ed-btn--primary" disabled={!dirty}>{saveLabel}</button>
    </div>
  );
}

/** Keeps a local, editable copy of `value` and knows when it differs. */
export function useDraft(value) {
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(value);
  return [draft, setDraft, dirty, () => setDraft(value)];
}

/**
 * Edits a list of items (timeline, volunteering, kind words). Each item is a
 * card that opens to show its fields, with ↑ ↓ to reorder and 🗑 to remove.
 * Changes are kept locally until Save, then handed to `onSave` in one go.
 */
export function ListEditor({ items, onSave, makeEmpty, itemTitle, renderFields, addLabel, emptyText, onSaved }) {
  const [draft, setDraft, dirty, reset] = useDraft(items || []);
  const [openId, setOpenId] = useState(null);

  const update = (i, patch) => setDraft(d => d.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const move = (i, dir) => setDraft(d => {
    const j = i + dir;
    if (j < 0 || j >= d.length) return d;
    const next = [...d];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  const remove = (i) => {
    if (!confirm('Remove this entry?')) return;
    setDraft(d => d.filter((_, idx) => idx !== i));
  };
  const add = () => {
    const item = makeEmpty();
    setDraft(d => [item, ...d]);
    setOpenId(item.id);
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(draft);
    onSaved?.();
  };

  return (
    <form className="ed-form" onSubmit={submit}>
      <button type="button" className="ed-add" onClick={add}>＋ {addLabel}</button>

      {draft.length === 0 && <p className="ed-empty">{emptyText}</p>}

      <ol className="ed-list">
        {draft.map((item, i) => {
          const open = openId === item.id;
          return (
            <li key={item.id} className={`ed-item ${open ? 'is-open' : ''}`}>
              <div className="ed-item-bar">
                <button
                  type="button"
                  className="ed-item-toggle"
                  onClick={() => setOpenId(open ? null : item.id)}
                  aria-expanded={open}
                >
                  <span className="ed-item-caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
                  <span className="ed-item-title">{itemTitle(item) || 'Untitled'}</span>
                </button>
                <div className="ed-item-tools">
                  <button type="button" className="ed-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                  <button type="button" className="ed-icon" onClick={() => move(i, 1)} disabled={i === draft.length - 1} aria-label="Move down">↓</button>
                  <button type="button" className="ed-icon ed-icon--danger" onClick={() => remove(i)} aria-label="Remove">🗑</button>
                </div>
              </div>
              {open && <div className="ed-item-body">{renderFields(item, (patch) => update(i, patch))}</div>}
            </li>
          );
        })}
      </ol>

      <SaveBar dirty={dirty} onCancel={reset} />
    </form>
  );
}
