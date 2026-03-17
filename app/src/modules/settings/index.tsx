import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSection } from './profile-section'
import { PreferencesSection } from './preferences-section'
import { AccountSection } from './account-section'
import { BillingSection } from './billing-section'

export function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-6 py-4">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{t('settings.title')}</h1>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
              <TabsTrigger value="preferences">{t('settings.preferences')}</TabsTrigger>
              <TabsTrigger value="billing">{t('settings.billing')}</TabsTrigger>
              <TabsTrigger value="account">{t('settings.account')}</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <ProfileSection />
            </TabsContent>
            <TabsContent value="preferences">
              <PreferencesSection />
            </TabsContent>
            <TabsContent value="billing">
              <BillingSection />
            </TabsContent>
            <TabsContent value="account">
              <AccountSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
