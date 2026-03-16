import { useTranslation } from 'react-i18next'

import { useSession } from '../features/auth/use-session'

export function SettingsPage() {
  const { t } = useTranslation()
  const sessionQuery = useSession()

  return (
    <section className="screen">
      <article className="panel panel--feature">
        <p className="eyebrow">Settings</p>
        <h3>{t('screens.settings.title')}</h3>
        <p>{t('screens.settings.description')}</p>
        <div className="detail-meta">
          <div>
            <span>{t('screens.settings.sessionLabel')}</span>
            <strong>
              {sessionQuery.data ? t('screens.settings.sessionActive') : t('screens.settings.sessionMissing')}
            </strong>
          </div>
          <div>
            <span>{t('screens.settings.sessionUser')}</span>
            <strong>{sessionQuery.data?.email ?? t('screens.settings.unknownUser')}</strong>
          </div>
        </div>
      </article>
    </section>
  )
}
