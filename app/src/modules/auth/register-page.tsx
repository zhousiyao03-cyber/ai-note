import { useState } from 'react'
import { Link } from '@/lib/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useRegister } from '@/hooks/use-auth'

function getRegisterErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return 'Registration failed'
  }

  const authError = error as { message?: string }
  return authError.message ?? 'Registration failed'
}

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const register = useRegister()
  const needsEmailConfirmation = register.isSuccess && !register.data?.session

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate({ name, email, password })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {register.isError && (
            <p className="text-sm text-destructive">{getRegisterErrorMessage(register.error)}</p>
          )}
          {needsEmailConfirmation && (
            <p className="text-sm text-emerald-600">
              Account created. Please check your email and confirm your address before signing in.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              required
              minLength={6}
            />
          </div>
          <Button className="w-full" type="submit" disabled={register.isPending}>
            {register.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </CardContent>
        <CardFooter className="text-sm">
          <span className="text-muted-foreground">Already have an account?</span>
          <Link to="/login" className="ml-1 text-primary hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
