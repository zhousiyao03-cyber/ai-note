import { useState } from 'react'
import { Link } from '@/lib/navigation'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useForgotPassword } from '@/hooks/use-auth'

function getForgotPasswordErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return 'Unable to send reset email right now.'
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const forgotPassword = useForgotPassword()
  const { t } = useTranslation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    forgotPassword.mutate(email)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('auth.resetPassword')}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {forgotPassword.isError && (
            <p className="text-sm text-destructive">
              {getForgotPasswordErrorMessage(forgotPassword.error)}
            </p>
          )}
          {forgotPassword.isSuccess ? (
            <p className="text-sm text-muted-foreground">
              {t('auth.resetPasswordSent', { email })}
            </p>
          ) : (
            <>
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
              <Button className="w-full" type="submit" disabled={forgotPassword.isPending}>
                {forgotPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('auth.sendResetLink')}
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter className="text-sm">
          <Link to="/login" className="text-primary hover:underline">
            {t('auth.backToSignIn')}
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
