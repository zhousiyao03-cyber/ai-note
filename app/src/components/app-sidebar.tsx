import { FileAudio, Trash2 } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { UserMenu } from './user-menu'
import { ThemeToggle } from './theme-toggle'
import { LanguageSwitcher } from './language-switcher'

export function AppSidebar() {
  const location = useLocation()
  const { t } = useTranslation()

  const navItems = [
    { title: t('nav.files'), icon: FileAudio, href: '/' },
    { title: t('nav.trash'), icon: Trash2, href: '/trash' },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
            P
          </div>
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Plaud
          </span>
        </Link>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 space-y-2">
        <div className="flex justify-center gap-1 group-data-[collapsible=icon]:hidden">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
