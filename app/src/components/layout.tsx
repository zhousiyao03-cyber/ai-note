import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from './app-sidebar'
import { MobileNav } from './mobile-nav'
import { AskAIPanel } from '@/modules/ask-ai'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <div className="hidden md:flex">
            <AppSidebar />
          </div>
          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
            <MobileNav />
          </SidebarInset>
          <AskAIPanel />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
