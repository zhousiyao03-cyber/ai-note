import { Navigate, NavLink, Outlet, RouterProvider, createHashRouter } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { AuthGuard } from './components/auth-guard'
import { useLogout, useSession } from './features/auth/use-session'
import { FileDetailPage } from './screens/file-detail-page'
import { FilesPage } from './screens/files-page'
import { LoginPage } from './screens/login-page'
import { SettingsPage } from './screens/settings-page'
import { useShellStore } from './stores/shell-store'

function ShellLayout() {
  const language = useShellStore((state) => state.language)
  const setLanguage = useShellStore((state) => state.setLanguage)
  const { t } = useTranslation()
  const sessionQuery = useSession()
  const logout = useLogout()

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <p className="eyebrow">Plaud Desktop</p>
          <h1>{t('shell.title')}</h1>
          <p className="sidebar__copy">{t('shell.subtitle')}</p>
        </div>

        {sessionQuery.data ? (
          <div className="session-card">
            <p className="eyebrow">{t('shell.accountLabel')}</p>
            <strong>{sessionQuery.data.name || sessionQuery.data.email}</strong>
            <p>{sessionQuery.data.email}</p>
            <button className="button-link button-link--ghost" onClick={() => logout.mutate()} type="button">
              {t('shell.signOut')}
            </button>
          </div>
        ) : null}

        <nav className="nav">
          <NavLink className={({ isActive }) => `nav__link${isActive ? ' active' : ''}`} to="/files">
            {t('nav.files')}
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav__link${isActive ? ' active' : ''}`}
            to="/settings"
          >
            {t('nav.settings')}
          </NavLink>
          <NavLink className={({ isActive }) => `nav__link${isActive ? ' active' : ''}`} to="/login">
            {t('nav.login')}
          </NavLink>
        </nav>

        <label className="language-switcher" htmlFor="language">
          <span>{t('shell.language')}</span>
          <select
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.currentTarget.value as 'en' | 'zh')}
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </label>
      </aside>

      <main className="workspace">
        <header className="workspace__header">
          <div>
            <p className="eyebrow">{t('shell.phase')}</p>
            <h2>{t('shell.milestone')}</h2>
          </div>
          <p className="workspace__status">{t('shell.status')}</p>
        </header>
        <Outlet />
      </main>
    </div>
  )
}

const router = createHashRouter([
  {
    path: '/',
    element: <ShellLayout />,
    children: [
      { index: true, element: <Navigate replace to="/files" /> },
      {
        element: <AuthGuard />,
        children: [
          { path: '/files', element: <FilesPage /> },
          { path: '/files/:fileId', element: <FileDetailPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
      { path: '/login', element: <LoginPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
