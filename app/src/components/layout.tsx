import { Outlet } from 'react-router'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from './app-sidebar'
import { MobileNav } from './mobile-nav'
import { AskAIPanel } from '@/modules/ask-ai'

export function Layout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <div className="hidden md:flex">
            <AppSidebar />
          </div>
          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <Outlet />
            </div>
            <MobileNav />
          </SidebarInset>
          <AskAIPanel />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
