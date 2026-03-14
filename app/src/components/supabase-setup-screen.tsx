import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

export function SupabaseSetupScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Supabase setup required</CardTitle>
          <CardDescription>
            This app needs Supabase credentials before the auth and file flows can run.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create <code>.env.local</code> in the app root and copy these values from your Supabase
            project settings.
          </p>
          <div className="rounded-lg border bg-background p-4 font-mono text-sm">
            {requiredEnvVars.map((envVar) => (
              <div key={envVar}>{envVar}=</div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            You can start from <code>.env.local.example</code>, then restart <code>pnpm dev</code>.
          </p>
          <a
            className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
            href="https://supabase.com/dashboard/project/_/settings/api"
            rel="noreferrer"
            target="_blank"
          >
            Open Supabase API settings
          </a>
        </CardContent>
      </Card>
    </main>
  )
}
