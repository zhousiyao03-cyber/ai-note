import { ProtectedLayout } from '@/components/protected-layout'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
