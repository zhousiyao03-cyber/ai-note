'use client'

import { Layout } from '@/components/layout'
import { RouteGuard } from '@/components/route-guard'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <RouteGuard>
      <Layout>{children}</Layout>
    </RouteGuard>
  )
}
