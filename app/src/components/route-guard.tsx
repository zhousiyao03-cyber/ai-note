import { useSyncExternalStore } from 'react'
import { Navigate, useLocation } from '@/lib/navigation'
import { isAuthenticated } from '@/lib/auth'

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const location = useLocation()
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!ready) {
    return null
  }

  if (!isAuthenticated()) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <>{children}</>
}
