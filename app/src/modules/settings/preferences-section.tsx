import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useUpdateUserPreferences, useUserPreferences } from '@/hooks/use-auth'
import type { UserPreferences } from '@/types'

export function PreferencesSection() {
  const { data: preferences } = useUserPreferences()
  const updatePreferences = useUpdateUserPreferences()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const handleToggle = async (
    key: keyof Pick<UserPreferences, 'emailNotifications' | 'autoTranscribe' | 'speakerDetection'>,
    value: boolean,
  ) => {
    if (!preferences) return

    const nextPreferences = { ...preferences, [key]: value }
    queryClient.setQueryData(['userPreferences'], nextPreferences)

    try {
      await updatePreferences.mutateAsync({ [key]: value })
    } catch {
      queryClient.setQueryData(['userPreferences'], preferences)
    }
  }

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.preferences')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('common.loading')}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.preferences')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>{t('settings.emailNotifications')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.emailNotificationsDescription')}
            </p>
          </div>
          <Switch
            checked={preferences.emailNotifications}
            onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
            disabled={updatePreferences.isPending}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>{t('settings.autoTranscribe')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.autoTranscribeDescription')}
            </p>
          </div>
          <Switch
            checked={preferences.autoTranscribe}
            onCheckedChange={(checked) => handleToggle('autoTranscribe', checked)}
            disabled={updatePreferences.isPending}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>{t('settings.speakerDetection')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.speakerDetectionDescription')}
            </p>
          </div>
          <Switch
            checked={preferences.speakerDetection}
            onCheckedChange={(checked) => handleToggle('speakerDetection', checked)}
            disabled={updatePreferences.isPending}
          />
        </div>
      </CardContent>
    </Card>
  )
}
