import { FileAudio, Trash2, Settings } from 'lucide-react'
import { Link, useLocation } from '@/lib/navigation'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const location = useLocation()
  const { t } = useTranslation()

  const items = [
    { title: t('nav.files'), icon: FileAudio, href: '/' },
    { title: t('nav.trash'), icon: Trash2, href: '/trash' },
    { title: t('nav.settings'), icon: Settings, href: '/settings' },
  ]

  return (
    <nav className="flex border-t bg-background md:hidden">
      {items.map((item) => {
        const active = location.pathname === item.href
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
