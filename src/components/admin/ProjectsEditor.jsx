import React, { useState } from 'react';
import { useMuseum } from '../../context/MuseumContext';
import { resolveAsset } from '../../lib/assets';
import { SITE, categoryIcon } from '../../../site.config.js';
import ImageUploader, { MultiImageUploader } from '../ImageUploader';
import CollaboratorsField from './CollaboratorsField';
import { Field, ViewHeader, SaveBar, useDraft } from './ui';

const EMPTY = {
  title: '', subtitle: '', category: SITE.categories[0],
  year: String(new Date().getFullYear()),
  description: '', longDescription: '',
  tech: [], color: '#ffd9e8', accentColor: '#c7356f',
  link: '#', repo: '#', featured: false, status: SITE.statuses[0],
  coverImage: '', screenshots: [], collaborators: [], instructor: null,
};

/** Projects: a grid of tiles → click one to edit it on a single page. */
export default function ProjectsEditor({ notify }) {
  const { projects, editingProject, setEditingProject, addProject, updateProject, deleteProject, moveProject } = useMuseum();

  // editingProject: null = the grid, 'new' = blank form, object = that project
  if (editingProject) {
    const isNew = editingProject === 'new';
    const current = isNew ? null : projects.find(p => p.id === editingProject.id) || editingProject;
    return (
      <ProjectForm
        key={isNew ? 'new' : current.id}
        project={current}
        onBack={() => setEditingProject(null)}
        onDelete={isNew ? null : () => {
          if (!confirm(`Delete "${current.title}"? This can't be undone.`)) return;
          deleteProject(current.id);
          setEditingProject(null);
          notify('Project deleted');
        }}
        onSave={(form) => {
          if (isNew) setEditingProject(addProject(form));
          else updateProject(current.id, form);
          notify();
        }}
      />
    );
  }

  return (
    <div className="ed-view">
      <ViewHeader
        emoji="🖼️"
        title="My projects"
        intro="Click a project to edit it. The order here is the order on your site — use the arrows to move one."
      />
      <ul className="ed-tiles">
        <li>
          <button type="button" className="ed-tile ed-tile--new" onClick={() => setEditingProject('new')}>
            <span className="ed-tile-plus" aria-hidden="true">＋</span>
            Add a project
          </button>
        </li>
        {projects.map((p, i) => (
          <li key={p.id} className="ed-tile-wrap">
            <button type="button" className="ed-tile" onClick={() => setEditingProject(p)}>
              <span
                className="ed-tile-photo"
                style={p.coverImage
                  ? { backgroundImage: `url(${resolveAsset(p.coverImage)})` }
                  : { background: p.color }}
              >
                {!p.coverImage && <span aria-hidden="true">{categoryIcon(p.category)}</span>}
                {p.featured && <span className="ed-tile-fav">♡ Favourite</span>}
              </span>
              <span className="ed-tile-title">{p.title || 'Untitled'}</span>
              <span className="ed-tile-meta">{p.category} · {p.year}</span>
            </button>
            <div className="ed-tile-order">
              <button type="button" className="ed-icon" onClick={() => moveProject(i, i - 1)} disabled={i === 0} aria-label={`Move ${p.title} earlier`}>←</button>
              <span>#{i + 1}</span>
              <button type="button" className="ed-icon" onClick={() => moveProject(i, i + 1)} disabled={i === projects.length - 1} aria-label={`Move ${p.title} later`}>→</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({ emoji, title, hint, open = false, children }) {
  return (
    <details className="ed-section" open={open}>
      <summary>
        <span className="ed-section-title"><span aria-hidden="true">{emoji}</span> {title}</span>
        {hint && <span className="ed-section-hint">{hint}</span>}
      </summary>
      <div className="ed-section-body">{children}</div>
    </details>
  );
}

function ProjectForm({ project, onBack, onSave, onDelete }) {
  const [form, setForm, dirty, reset] = useDraft(project || EMPTY);
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const tech = form.tech || [];

  const addTag = () => {
    const v = tag.trim();
    if (v && !tech.includes(v)) set('tech', [...tech, v]);
    setTag('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Give your project a name first.'); return; }
    setError('');
    onSave(form);
  };

  const back = () => {
    if (dirty && !confirm('Leave without saving your changes?')) return;
    onBack();
  };

  return (
    <form className="ed-form ed-view" onSubmit={submit}>
      <div className="ed-crumbs">
        <button type="button" className="ed-btn ed-btn--ghost" onClick={back}>← All projects</button>
        {onDelete && <button type="button" className="ed-btn ed-btn--danger" onClick={onDelete}>Delete project</button>}
      </div>

      <div className="ed-project-top">
        {/* Live preview of the card */}
        <div className="ed-preview" aria-hidden="true">
          <span
            className="ed-preview-photo"
            style={form.coverImage ? { backgroundImage: `url(${resolveAsset(form.coverImage)})` } : { background: form.color }}
          >
            {!form.coverImage && categoryIcon(form.category)}
          </span>
          <span className="ed-preview-cat">{categoryIcon(form.category)} {form.category}</span>
          <strong>{form.title || 'Project name'}</strong>
          <small>{form.subtitle || 'Your one-liner shows here'}</small>
        </div>

        <div className="ed-grid">
          <Field label="Project name *" wide>
            {(id) => <input id={id} className="admin-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Line-Following Robot" />}
          </Field>
          <Field label="One-liner" hint="A short sentence. On your favourite project this shows as “Why I love it”." wide>
            {(id) => <input id={id} className="admin-input" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="A little robot that follows a line using IR sensors" />}
          </Field>
          <Field label="Category">
            {(id) => (
              <select id={id} className="admin-input" value={form.category} onChange={e => set('category', e.target.value)}>
                {[...new Set([...SITE.categories, form.category].filter(Boolean))].map(c => <option key={c} value={c}>{categoryIcon(c)} {c}</option>)}
              </select>
            )}
          </Field>
          <Field label="Status">
            {(id) => (
              <select id={id} className="admin-input" value={form.status} onChange={e => set('status', e.target.value)}>
                {[...new Set([...SITE.statuses, form.status].filter(Boolean))].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </Field>
          <Field label="Year">
            {(id) => <input id={id} className="admin-input" value={form.year} onChange={e => set('year', e.target.value)} placeholder="2026" />}
          </Field>
          <label className="ed-toggle">
            <input type="checkbox" checked={!!form.featured} onChange={e => set('featured', e.target.checked)} />
            <span className="ed-toggle-track" aria-hidden="true" />
            Make this my favourite ♡
          </label>
        </div>
      </div>

      {error && <p className="ed-error" role="alert">{error}</p>}

      <Section emoji="📝" title="The story" hint="what it is & how you made it" open>
        <Field label="Short description" hint="Shown on the project card. Two or three sentences." wide>
          {(id) => <textarea id={id} className="admin-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />}
        </Field>
        <Field
          label="Full story"
          hint="Shown when someone opens the project. Tips: start a line with ## for a heading, - for a bullet point, and wrap words in **stars** for bold."
          wide
        >
          {(id) => <textarea id={id} className="admin-input ed-textarea-tall" rows={9} value={form.longDescription} onChange={e => set('longDescription', e.target.value)} placeholder={'## The idea\nWhat was the goal?\n\n## How I built it\n- Step one\n- Step two'} />}
        </Field>
        <div className="ed-field ed-field--wide">
          <span className="ed-label">Tools & parts</span>
          <div className="ed-tags">
            {tech.map(t => (
              <span key={t} className="ed-tag">
                {t}
                <button type="button" onClick={() => set('tech', tech.filter(x => x !== t))} aria-label={`Remove ${t}`}>×</button>
              </span>
            ))}
            <input
              className="admin-input ed-tag-input"
              value={tag}
              onChange={e => setTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
              onBlur={addTag}
              placeholder="Type one and press Enter (e.g. Arduino)"
              aria-label="Add a tool or part"
            />
          </div>
        </div>
      </Section>

      <Section emoji="📷" title="Photos" hint="a cover + up to 6 more">
        <ImageUploader label="Cover photo" value={form.coverImage} onChange={v => set('coverImage', v)} aspectHint="landscape" />
        <MultiImageUploader label="More photos" values={form.screenshots || []} onChange={v => set('screenshots', v)} maxImages={6} />
      </Section>

      <Section emoji="🔗" title="Links & colours" hint="optional">
        <div className="ed-grid">
          <Field label="See it live" hint="A video, demo or website. Leave as # if none.">
            {(id) => <input id={id} className="admin-input" value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://..." />}
          </Field>
          <Field label="Code & files" hint="GitHub, Google Drive, a report… Leave as # if none.">
            {(id) => <input id={id} className="admin-input" value={form.repo} onChange={e => set('repo', e.target.value)} placeholder="https://..." />}
          </Field>
          <Field label="Card colour" hint="Used when there's no cover photo.">
            {(id) => <input id={id} type="color" className="ed-color" value={form.color} onChange={e => set('color', e.target.value)} />}
          </Field>
          <Field label="Accent colour">
            {(id) => <input id={id} type="color" className="ed-color" value={form.accentColor} onChange={e => set('accentColor', e.target.value)} />}
          </Field>
        </div>
      </Section>

      <Section emoji="👯" title="People" hint="teammates & supervisor">
        <CollaboratorsField value={form.collaborators} onChange={v => set('collaborators', v)} />
        {form.instructor ? (
          <div className="ed-grid ed-supervisor">
            <Field label="Supervisor name">
              {(id) => <input id={id} className="admin-input" value={form.instructor.name || ''} onChange={e => set('instructor', { ...form.instructor, name: e.target.value })} placeholder="Dr. …" />}
            </Field>
            <Field label="Their title">
              {(id) => <input id={id} className="admin-input" value={form.instructor.title || ''} onChange={e => set('instructor', { ...form.instructor, title: e.target.value })} placeholder="Course Instructor" />}
            </Field>
            <Field label="Organisation">
              {(id) => <input id={id} className="admin-input" value={form.instructor.organization || ''} onChange={e => set('instructor', { ...form.instructor, organization: e.target.value })} placeholder="The Hashemite University" />}
            </Field>
            <Field label="Link (optional)">
              {(id) => <input id={id} className="admin-input" value={form.instructor.url || ''} onChange={e => set('instructor', { ...form.instructor, url: e.target.value })} placeholder="https://..." />}
            </Field>
            <button type="button" className="ed-btn ed-btn--ghost" onClick={() => set('instructor', null)}>Remove supervisor</button>
          </div>
        ) : (
          <button type="button" className="ed-btn ed-btn--soft" onClick={() => set('instructor', { name: '', title: '', organization: '', url: '' })}>
            ＋ Add a supervisor
          </button>
        )}
      </Section>

      <SaveBar dirty={dirty || !project} onCancel={project ? reset : null} saveLabel={project ? 'Save changes' : 'Add this project'} />
    </form>
  );
}
