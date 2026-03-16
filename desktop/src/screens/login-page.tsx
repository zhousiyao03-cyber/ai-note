import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ApiError } from '../lib/api/client'
import { useLogin, useSession } from '../features/auth/use-session'

export function LoginPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const sessionQuery = useSession()
  const login = useLogin()
  const [email, setEmail] = useState('demo@ai-note.app')
  const [password, setPassword] = useState('demo1234')

  const from = new URLSearchParams(location.search).get('from') || '/files'

  if (sessionQuery.data) {
    return <Navigate replace to={from} />
  }

  const errorMessage =
    login.error instanceof ApiError ? login.error.message : t('screens.login.fallbackError')

  return (
    <section className="screen">
      <article className="panel panel--feature auth-panel">
        <p className="eyebrow">Auth</p>
        <h3>{t('screens.login.title')}</h3>
        <p>{t('screens.login.description')}</p>

        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault()
            login.mutate({ email, password })
          }}
        >
          <label className="auth-field">
            <span>{t('screens.login.emailLabel')}</span>
            <input value={email} onChange={(event) => setEmail(event.currentTarget.value)} type="email" />
          </label>

          <label className="auth-field">
            <span>{t('screens.login.passwordLabel')}</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              type="password"
            />
          </label>

          {login.isError ? <p className="detail-error">{errorMessage}</p> : null}

          <button className="button-link" disabled={login.isPending} type="submit">
            {login.isPending ? t('screens.login.submitting') : t('screens.login.submit')}
          </button>
        </form>
      </article>
    </section>
  )
}
