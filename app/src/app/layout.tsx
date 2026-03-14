import type { Metadata } from 'next'
import '@/index.css'
import { Providers } from '@/components/providers'
import { SupabaseSetupScreen } from '@/components/supabase-setup-screen'
import { hasSupabaseEnv } from '@/lib/supabase/env'

export const metadata: Metadata = {
  title: 'ai-note',
  description: 'ai-note transcription workspace',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const content = hasSupabaseEnv() ? children : <SupabaseSetupScreen />

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{content}</Providers>
      </body>
    </html>
  )
}
