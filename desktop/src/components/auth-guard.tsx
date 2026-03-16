import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useSession } from '../features/auth/use-session'

export function AuthGuard() {
  const location = useLocation()
  const sessionQuery = useSession()

  if (sessionQuery.isLoading) {
    return null
  }

  if (!sessionQuery.data) {
    return <Navigate replace to={`/login?from=${encodeURIComponent(location.pathname)}`} />
  }

  return <Outlet />
}
