import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import type { AudioFile } from '@plaud/shared-types'

import { formatDate, formatDuration, formatFileSize } from '../features/files/formatters'
import { isValidAudioFile } from '../features/files/upload-helpers'
import { pickNativeAudioFiles } from '../features/files/native-file-picker'
import { useFileUpload } from '../features/files/use-file-upload'
import { useFilesQuery } from '../features/files/use-files-query'
import { desktopApi } from '../lib/api/client'

const statusClassName: Record<AudioFile['status'], string> = {
  pending: 'status-pill status-pill--pending',
  transcribing: 'status-pill status-pill--transcribing',
  completed: 'status-pill status-pill--completed',
  failed: 'status-pill status-pill--failed',
}

export function FilesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const sessionQuery = useQuery({
    queryKey: ['me'],
    queryFn: desktopApi.getCurrentUser,
  })
  const filesQuery = useFilesQuery()
  const { uploads, uploadFile, clearFinishedUploads } = useFileUpload()

  async function handleFiles(files: File[]) {
    if (!files.length) return
    setUploadError(null)

    for (const file of files) {
      if (!isValidAudioFile(file)) {
        setUploadError(t('screens.files.invalidUpload', { name: file.name }))
        continue
      }

      try {
        const createdFile = await uploadFile(file)
        navigate(`/files/${createdFile.id}`)
      } catch {
        setUploadError(t('screens.files.uploadFailed'))
      }
    }
  }

  async function handleUploadClick() {
    const nativeFiles = await pickNativeAudioFiles()
    if (nativeFiles === null) {
      inputRef.current?.click()
      return
    }

    await handleFiles(nativeFiles)
  }

  const hasActiveUploads = uploads.some(
    (upload) => upload.status === 'uploading' || upload.status === 'processing',
  )

  return (
    <section className="screen">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Workspace</p>
          <h3>{t('screens.files.title')}</h3>
          <p className="hero-card__copy">{t('screens.files.description')}</p>
        </div>

        <div className="hero-card__aside">
          <span className="pill pill--accent">{t('common.nextStep')}</span>
          <p>{t('common.nextStepValue')}</p>
          <button className="button-link" onClick={() => void handleUploadClick()} type="button">
            {t('screens.files.uploadButton')}
          </button>
          <input
            ref={inputRef}
            accept=".wav,.mp3,.m4a,.ogg,.flac,.webm,audio/*"
            className="sr-only"
            multiple
            type="file"
            onChange={(event) => void handleFiles(Array.from(event.currentTarget.files ?? []))}
          />
        </div>
      </div>

      <div className="grid">
        <article className="panel">
          <p className="eyebrow">{t('screens.files.cardTitle')}</p>
          {sessionQuery.isLoading && <p>{t('screens.files.loading')}</p>}
          {sessionQuery.isError && <p>{t('screens.files.error')}</p>}
          {!sessionQuery.isLoading && !sessionQuery.data && !sessionQuery.isError && (
            <p>{t('screens.files.signedOut')}</p>
          )}
          {sessionQuery.data && (
            <p>{t('screens.files.signedIn', { email: sessionQuery.data.email ?? sessionQuery.data.id })}</p>
          )}
        </article>

        <article className="panel panel--muted">
          <p className="eyebrow">{t('screens.files.uploadsTitle')}</p>
          <h3>{t('screens.files.uploadsDescription')}</h3>
          {uploadError ? <p className="detail-error panel__spaced">{uploadError}</p> : null}
          {!uploads.length ? <p className="panel__spaced">{t('screens.files.uploadsEmpty')}</p> : null}
          {uploads.length ? (
            <div className="upload-list">
              {uploads.map((upload) => (
                <article className="upload-card" key={upload.fileId}>
                  <div className="upload-card__row">
                    <strong>{upload.fileName}</strong>
                    <span
                      className={
                        statusClassName[
                          upload.status === 'processing'
                            ? 'transcribing'
                            : upload.status === 'uploading'
                              ? 'pending'
                              : upload.status === 'completed'
                                ? 'completed'
                                : 'failed'
                        ]
                      }
                    >
                      {upload.status === 'processing'
                        ? t('common.statuses.transcribing')
                        : upload.status === 'uploading'
                          ? t('common.statuses.pending')
                          : upload.status === 'completed'
                            ? t('common.statuses.completed')
                            : t('common.statuses.failed')}
                    </span>
                  </div>
                  <div className="progress-bar progress-bar--compact">
                    <div className="progress-bar__fill" style={{ width: `${upload.progress}%` }} />
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          {!hasActiveUploads && uploads.length ? (
            <button
              className="button-link button-link--ghost panel__spaced"
              onClick={clearFinishedUploads}
              type="button"
            >
              {t('screens.files.clearUploads')}
            </button>
          ) : null}
        </article>

        <article className="panel panel--muted">
          <p className="eyebrow">{t('screens.files.listTitle')}</p>
          <h3>{t('screens.files.total', { count: filesQuery.data?.total ?? 0 })}</h3>
          <p>{t('screens.files.listDescription')}</p>

          {filesQuery.isLoading && <p className="panel__spaced">{t('screens.files.listLoading')}</p>}
          {filesQuery.isError && <p className="panel__spaced">{t('screens.files.listError')}</p>}
          {!filesQuery.isLoading && !filesQuery.isError && !filesQuery.data?.data.length && (
            <p className="panel__spaced">{t('screens.files.empty')}</p>
          )}
          {filesQuery.data?.data.length ? (
            <div className="file-list">
              {filesQuery.data.data.map((file) => (
                <Link className="file-card file-card--link" key={file.id} to={`/files/${file.id}`}>
                  <div className="file-card__row">
                    <div>
                      <h4>{file.name}</h4>
                      <p>{t('screens.files.updated', { value: formatDate(file.updatedAt) })}</p>
                    </div>
                    <span className={statusClassName[file.status]}>
                      {t(`common.statuses.${file.status}`)}
                    </span>
                  </div>

                  <div className="file-card__meta">
                    <span>{t('screens.files.duration', { value: formatDuration(file.duration) })}</span>
                    <span>{t('screens.files.size', { value: formatFileSize(file.size) })}</span>
                    {typeof file.progress === 'number' && file.status !== 'completed' ? (
                      <span>{t('screens.files.progress', { value: file.progress })}</span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </article>

        <article className="panel panel--muted">
          <p className="eyebrow">Module scope</p>
          <ul className="checklist">
            <li>Desktop shell scaffolded</li>
            <li>Shared types extracted</li>
            <li>Files list wired to real backend</li>
            <li>Detail route and upload flow connected</li>
          </ul>
        </article>
      </div>
    </section>
  )
}
