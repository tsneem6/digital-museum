import React from 'react';
import { useMuseum } from '../../context/MuseumContext';
import { MultiImageUploader } from '../ImageUploader';
import { Field, ViewHeader, SaveBar, ListEditor, useDraft } from './ui';

const EMOJIS = ['🎀', '🤖', '⚙️', '🔌', '📐', '💻', '🔬', '📚', '✨', '🛠️'];

/** Currently working on — the sticky note under the hero. */
export function NowEditor({ notify }) {
  const { settings, updateSettings } = useMuseum();
  const [now, setNow, dirty, reset] = useDraft(settings.nowBuilding || {});
  const set = (k, v) => setNow(n => ({ ...n, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    updateSettings({ ...settings, nowBuilding: { ...now, updatedAt: new Date().toISOString() } });
    notify();
  };

  return (
    <form className="ed-form ed-view" onSubmit={submit}>
      <ViewHeader
        emoji="📌"
        title="Currently working on"
        intro="The sticky note under your intro. Leave the title empty to hide it."
      />
      <div className="ed-grid">
        <Field label="What are you working on?" wide>
          {(id) => <input id={id} className="admin-input" value={now.title || ''} onChange={e => set('title', e.target.value)} placeholder="Building a robotic arm for my grad project" />}
        </Field>
        <Field label="A little more detail" wide>
          {(id) => <textarea id={id} className="admin-input" rows={3} value={now.description || ''} onChange={e => set('description', e.target.value)} placeholder="Wiring the servos this week!" />}
        </Field>
        <div className="ed-field ed-field--wide">
          <span className="ed-label">Pick an emoji</span>
          <div className="ed-emoji-row" role="radiogroup" aria-label="Emoji">
            {EMOJIS.map(e => (
              <button
                key={e}
                type="button"
                role="radio"
                aria-checked={now.emoji === e}
                className={`ed-emoji ${now.emoji === e ? 'is-on' : ''}`}
                onClick={() => set('emoji', now.emoji === e ? '' : e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <Field label={`How far along? ${now.progress === '' || now.progress == null ? '(hidden)' : `${now.progress}%`}`} hint="Slide to 0 and press “Hide bar” if you don't want a progress bar." wide>
          {(id) => (
            <div className="ed-range-row">
              <input
                id={id}
                type="range"
                min="0"
                max="100"
                step="5"
                value={Number(now.progress) || 0}
                onChange={e => set('progress', Number(e.target.value))}
              />
              <button type="button" className="ed-btn ed-btn--ghost" onClick={() => set('progress', '')}>Hide bar</button>
            </div>
          )}
        </Field>
      </div>
      <SaveBar dirty={dirty} onCancel={reset} />
    </form>
  );
}

/** My story so far — timeline milestones. */
export function StoryEditor({ notify }) {
  const { timeline, updateTimeline } = useMuseum();
  return (
    <div className="ed-view">
      <ViewHeader
        emoji="⏳"
        title="My story so far"
        intro="Put your newest milestone at the top — the site shows them left to right, oldest first, and marks the top one “I'm here now”."
      />
      <ListEditor
        items={timeline}
        onSave={updateTimeline}
        onSaved={() => notify()}
        addLabel="Add a milestone"
        emptyText="No milestones yet."
        makeEmpty={() => ({ id: `t${Date.now()}`, year: '', title: '', organization: '', description: '' })}
        itemTitle={(it) => [it.year, it.title].filter(Boolean).join(' · ')}
        renderFields={(it, update) => (
          <div className="ed-grid">
            <Field label="When">{(id) => <input id={id} className="admin-input" value={it.year} onChange={e => update({ year: e.target.value })} placeholder="2025 – Now" />}</Field>
            <Field label="Role or achievement">{(id) => <input id={id} className="admin-input" value={it.title} onChange={e => update({ title: e.target.value })} placeholder="Robotics Team Member" />}</Field>
            <Field label="Where" wide>{(id) => <input id={id} className="admin-input" value={it.organization} onChange={e => update({ organization: e.target.value })} placeholder="The Hashemite University" />}</Field>
            <Field label="A sentence about it" wide>{(id) => <textarea id={id} className="admin-input" rows={2} value={it.description} onChange={e => update({ description: e.target.value })} />}</Field>
          </div>
        )}
      />
    </div>
  );
}

/** Giving back — volunteering entries with photos. */
export function VolunteeringEditor({ notify }) {
  const { volunteering, updateVolunteering } = useMuseum();
  return (
    <div className="ed-view">
      <ViewHeader emoji="🤝" title="Giving back" intro="Volunteering, events and community things you've done. Newest first." />
      <ListEditor
        items={volunteering}
        onSave={updateVolunteering}
        onSaved={() => notify()}
        addLabel="Add volunteering"
        emptyText="Nothing here yet — this section stays hidden on your site until you add one."
        makeEmpty={() => ({ id: `v${Date.now()}`, year: '', eventTitle: '', title: '', organization: '', description: '', photos: [] })}
        itemTitle={(it) => [it.year, it.eventTitle || it.title].filter(Boolean).join(' · ')}
        renderFields={(it, update) => (
          <div className="ed-grid">
            <Field label="Event or cause">{(id) => <input id={id} className="admin-input" value={it.eventTitle || ''} onChange={e => update({ eventTitle: e.target.value })} placeholder="STEM Day for Kids" />}</Field>
            <Field label="When">{(id) => <input id={id} className="admin-input" value={it.year} onChange={e => update({ year: e.target.value })} placeholder="2025" />}</Field>
            <Field label="Your role">{(id) => <input id={id} className="admin-input" value={it.title} onChange={e => update({ title: e.target.value })} placeholder="Volunteer" />}</Field>
            <Field label="Organisation">{(id) => <input id={id} className="admin-input" value={it.organization} onChange={e => update({ organization: e.target.value })} placeholder="IEEE HU" />}</Field>
            <Field label="What you did" wide>{(id) => <textarea id={id} className="admin-input" rows={2} value={it.description} onChange={e => update({ description: e.target.value })} />}</Field>
            <div className="ed-field ed-field--wide">
              <MultiImageUploader label="Photos" values={it.photos || []} onChange={v => update({ photos: v })} maxImages={6} />
            </div>
          </div>
        )}
      />
    </div>
  );
}

/** Kind words — testimonials. */
export function KindWordsEditor({ notify }) {
  const { testimonials, updateTestimonials } = useMuseum();
  return (
    <div className="ed-view">
      <ViewHeader emoji="💬" title="Kind words" intro="Nice things teachers, teammates or friends have said about you." />
      <ListEditor
        items={testimonials}
        onSave={updateTestimonials}
        onSaved={() => notify()}
        addLabel="Add kind words"
        emptyText="None yet — this section stays hidden until you add one."
        makeEmpty={() => ({ id: `ts${Date.now()}`, quote: '', name: '', role: '', avatarUrl: '' })}
        itemTitle={(it) => it.name ? `${it.name}${it.quote ? ` — “${it.quote.slice(0, 40)}${it.quote.length > 40 ? '…' : ''}”` : ''}` : ''}
        renderFields={(it, update) => (
          <div className="ed-grid">
            <Field label="What they said" wide>{(id) => <textarea id={id} className="admin-input" rows={3} value={it.quote} onChange={e => update({ quote: e.target.value })} />}</Field>
            <Field label="Their name">{(id) => <input id={id} className="admin-input" value={it.name} onChange={e => update({ name: e.target.value })} />}</Field>
            <Field label="Who they are">{(id) => <input id={id} className="admin-input" value={it.role} onChange={e => update({ role: e.target.value })} placeholder="Professor, teammate…" />}</Field>
            <Field label="Photo link (optional)" wide>{(id) => <input id={id} className="admin-input" value={it.avatarUrl} onChange={e => update({ avatarUrl: e.target.value })} placeholder="https://..." />}</Field>
          </div>
        )}
      />
    </div>
  );
}

