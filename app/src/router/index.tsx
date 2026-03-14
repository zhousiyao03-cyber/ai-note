import { BrowserRouter, Routes, Route } from 'react-router'
import { Layout } from '@/components/layout'
import { RouteGuard } from '@/components/route-guard'
import { FilesPage } from '@/modules/files'
import { DetailPage } from '@/modules/detail'
import { TrashPage } from '@/modules/trash'
import { SettingsPage } from '@/modules/settings'
import { AuthLayout } from '@/modules/auth/auth-layout'
import { LoginPage } from '@/modules/auth/login-page'
import { RegisterPage } from '@/modules/auth/register-page'
import { ForgotPasswordPage } from '@/modules/auth/forgot-password-page'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected app routes */}
        <Route
          element={
            <RouteGuard>
              <Layout />
            </RouteGuard>
          }
        >
          <Route index element={<FilesPage />} />
          <Route path="detail/:id" element={<DetailPage />} />
          <Route path="trash" element={<TrashPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
