import { useState } from 'react'
import { Link } from '@/lib/navigation'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/hooks/use-auth'

function getLoginErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return 'Invalid email or password'
  }

  const authError = error as { code?: string; message?: string }

  if (authError.code === 'email_not_confirmed') {
    return 'Please confirm your email before signing in.'
  }

  return authError.message ?? 'Invalid email or password'
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()
  const { t } = useTranslation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('auth.signIn')}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {login.isError && (
            <p className="text-sm text-destructive">{getLoginErrorMessage(login.error)}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={login.isPending}
          >
            {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.signIn')}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between text-sm">
          <Link to="/forgot-password" className="text-muted-foreground hover:underline">
            {t('auth.forgotPassword')}
          </Link>
          <Link to="/register" className="text-primary hover:underline">
            {t('auth.createAccount')}
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
