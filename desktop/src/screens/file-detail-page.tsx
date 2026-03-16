import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { formatDate, formatDuration, formatFileSize } from '../features/files/formatters'
import { useFileDetailQuery, useTranscriptionQuery } from '../features/files/use-file-detail-query'

export function FileDetailPage() {
  const { fileId = '' } = useParams()
  const { t } = useTranslation()
  const fileQuery = useFileDetailQuery(fileId)
  const transcriptionQuery = useTranscriptionQuery(fileId, fileQuery.data?.status === 'completed')

  if (fileQuery.isLoading) {
    return (
      <section className="screen">
        <article className="panel panel--feature">
          <p className="eyebrow">{t('detail.loadingLabel')}</p>
          <h3>{t('detail.loadingTitle')}</h3>
          <p>{t('detail.loadingBody')}</p>
        </article>
      </section>
    )
  }

  if (fileQuery.isError || !fileQuery.data) {
    return (
      <section className="screen">
        <article className="panel panel--feature">
          <p className="eyebrow">{t('detail.errorLabel')}</p>
          <h3>{t('detail.errorTitle')}</h3>
          <p>{t('detail.errorBody')}</p>
          <div className="panel__actions">
            <Link className="button-link" to="/files">
              {t('detail.backToFiles')}
            </Link>
          </div>
        </article>
      </section>
    )
  }

  const file = fileQuery.data
  const transcription = transcriptionQuery.data

  return (
    <section className="screen">
      <div className="hero-card">
        <div>
          <p className="eyebrow">{t('detail.headerLabel')}</p>
          <h3>{file.name}</h3>
          <p className="hero-card__copy">{t(`common.statuses.${file.status}`)}</p>
        </div>

        <div className="hero-card__aside">
          <span className="pill pill--accent">{t('detail.backLabel')}</span>
          <Link className="button-link button-link--ghost" to="/files">
            {t('detail.backToFiles')}
          </Link>
        </div>
      </div>

      <div className="grid detail-grid">
        <article className="panel">
          <p className="eyebrow">{t('detail.metaLabel')}</p>
          <div className="detail-meta">
            <div>
              <span>{t('detail.updatedAt')}</span>
              <strong>{formatDate(file.updatedAt)}</strong>
            </div>
            <div>
              <span>{t('detail.duration')}</span>
              <strong>{formatDuration(file.duration)}</strong>
            </div>
            <div>
              <span>{t('detail.fileSize')}</span>
              <strong>{formatFileSize(file.size)}</strong>
            </div>
            <div>
              <span>{t('detail.language')}</span>
              <strong>{file.language || t('detail.unknown')}</strong>
            </div>
          </div>

          {file.url ? (
            <div className="audio-block">
              <audio controls className="audio-player" src={file.url} />
            </div>
          ) : null}

          {typeof file.progress === 'number' && file.status !== 'completed' ? (
            <div className="progress-block">
              <div className="progress-block__row">
                <span>{t('detail.progress')}</span>
                <strong>{file.progress}%</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${file.progress}%` }} />
              </div>
            </div>
          ) : null}

          {file.errorMessage ? <p className="detail-error">{file.errorMessage}</p> : null}
        </article>

        <article className="panel panel--muted">
          <p className="eyebrow">{t('detail.transcriptionLabel')}</p>
          {file.status !== 'completed' ? (
            <p>{t('detail.pendingBody')}</p>
          ) : transcriptionQuery.isLoading ? (
            <p>{t('detail.transcriptionLoading')}</p>
          ) : transcription ? (
            <div className="transcription-block">
              <section>
                <h4>{t('detail.summary')}</h4>
                <p>{transcription.summary || t('detail.emptySummary')}</p>
              </section>

              <section>
                <h4>{t('detail.transcript')}</h4>
                {transcription.content ? (
                  <div
                    className="transcript-html"
                    dangerouslySetInnerHTML={{ __html: transcription.content }}
                  />
                ) : (
                  <p>{t('detail.emptyTranscript')}</p>
                )}
              </section>
            </div>
          ) : (
            <p>{t('detail.noTranscription')}</p>
          )}
        </article>
      </div>
    </section>
  )
}
