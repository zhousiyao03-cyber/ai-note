import { AuthLayout } from '@/modules/auth/auth-layout'

interface AuthGroupLayoutProps {
  children: React.ReactNode
}

export default function AuthGroupLayout({ children }: AuthGroupLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>
}
