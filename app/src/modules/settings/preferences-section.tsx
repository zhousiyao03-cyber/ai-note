import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function PreferencesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email when transcription is complete
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Auto-transcribe</Label>
            <p className="text-sm text-muted-foreground">
              Automatically start transcription after upload
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Speaker Detection</Label>
            <p className="text-sm text-muted-foreground">
              Enable speaker identification in transcriptions
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  )
}
