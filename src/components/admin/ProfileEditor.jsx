import React from 'react';
import { useMuseum } from '../../context/MuseumContext';
import { SOCIALS } from '../../lib/socials';
import ImageUploader from '../ImageUploader';
import { Field, ViewHeader, SaveBar, useDraft } from './ui';

/** About me — photo, contact email, CV and social links. */
export default function ProfileEditor({ notify }) {
  const { settings, updateSettings } = useMuseum();
  const [form, setForm, dirty, reset] = useDraft(settings);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSocial = (k, v) => setForm(f => ({ ...f, social: { ...f.social, [k]: v } }));

  const submit = (e) => {
    e.preventDefault();
    updateSettings(form);
    notify();
  };

  return (
    <form className="ed-form ed-view" onSubmit={submit}>
      <ViewHeader emoji="🙋‍♀️" title="About me" intro="Your photo, how people reach you, and your links." />

      <div className="ed-profile-photo">
        <ImageUploader label="Profile photo (shown on your museum pass)" value={form.photo || ''} onChange={v => set('photo', v)} aspectHint="square" />
      </div>

      <div className="ed-grid">
        <Field label="Email" hint="Visitors use this to contact you. It must also be the email you log in with." wide>
          {(id) => <input id={id} type="email" className="admin-input" value={form.email || ''} onChange={e => set('email', e.target.value)} />}
        </Field>
        <Field label="CV link" hint="A link to your CV PDF (e.g. Google Drive, set to “anyone with the link”). Leave as # to hide the button." wide>
          {(id) => <input id={id} className="admin-input" value={form.cvLink || ''} onChange={e => set('cvLink', e.target.value)} placeholder="https://..." />}
        </Field>
      </div>

      <h3 className="ed-subhead">Social links <small>— only the ones you fill in appear</small></h3>
      <div className="ed-grid">
        {SOCIALS.map(({ key, label }) => (
          <Field key={key} label={label}>
            {(id) => <input id={id} className="admin-input" value={form.social?.[key] || ''} onChange={e => setSocial(key, e.target.value)} placeholder="https://..." />}
          </Field>
        ))}
      </div>

      <SaveBar dirty={dirty} onCancel={reset} />
    </form>
  );
}
