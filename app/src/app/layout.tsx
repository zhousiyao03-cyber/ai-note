import type { Metadata } from 'next'
import '@/index.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'Plaud',
  description: 'Plaud transcription workspace',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
