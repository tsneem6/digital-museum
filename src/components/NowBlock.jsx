import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMuseum } from '../context/MuseumContext';
import EditHere from './EditHere';
import './NowBlock.css';

/** "3 days ago"-style label for when the note was last updated. */
function useUpdatedLabel(iso) {
  const { t, i18n } = useTranslation();
  if (!iso) return '';
  const then = new Date(iso);
  if (isNaN(then.getTime())) return '';
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  if (days <= 0) return t('now.today');
  if (days === 1) return t('now.yesterday');
  if (days < 30) return t('now.daysAgo', { count: days });
  return then.toLocaleDateString(i18n.language === 'ar' ? 'ar' : 'en-GB', { day: 'numeric', month: 'short' });
}

/** Currently working on — a sticky note pinned under the hero, with an
 * optional progress bar. Hidden when there's no title. */
export default function NowBlock() {
  const { settings, isAdmin } = useMuseum();
  const { t } = useTranslation();
  const now = settings?.nowBuilding;
  const updated = useUpdatedLabel(now?.updatedAt);

  if (!now?.title && !isAdmin) return null;

  const progress = Number.isFinite(Number(now?.progress)) && now?.progress !== ''
    ? Math.max(0, Math.min(100, Number(now.progress)))
    : null;

  return (
    <section className="now" aria-label={t('now.eyebrow')}>
      <div className="container now-inner">
        <article className="now-note">
          <span className="now-pin" aria-hidden="true" />
          <header className="now-head">
            <span className="now-eyebrow">
              <span className="now-dot" aria-hidden="true" /> {t('now.eyebrow')}
            </span>
            {updated && <span className="now-updated">{updated}</span>}
          </header>

          {now?.title ? (
            <>
              <h2 className="now-title">
                {now.emoji && <span className="now-emoji" aria-hidden="true">{now.emoji}</span>} {now.title}
              </h2>
              {now.description && <p className="now-desc">{now.description}</p>}
              {progress !== null && (
                <div className="now-progress">
                  <div
                    className="now-bar"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t('now.progress')}
                  >
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <span className="now-percent">{t('now.done', { percent: progress })}</span>
                </div>
              )}
            </>
          ) : (
            <p className="now-desc">{t('now.emptyOwner')}</p>
          )}
          <EditHere view="now" className="now-edit" />
        </article>
      </div>
    </section>
  );
}
