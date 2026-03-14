import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useCurrentUser } from '@/hooks/use-auth'
import { CheckoutDialog } from './checkout-dialog'

const plans = [
  {
    name: 'Free',
    price: 0,
    features: ['5 hours/month', '10 AI questions/month', '1 GB storage'],
  },
  {
    name: 'Pro',
    price: 9.99,
    features: ['50 hours/month', 'Unlimited AI questions', '50 GB storage', 'Priority processing'],
  },
  {
    name: 'Enterprise',
    price: 29.99,
    features: ['Unlimited hours', 'Unlimited AI questions', '500 GB storage', 'Priority processing', 'Team management', 'API access'],
  },
]

export function BillingSection() {
  const { data: user } = useCurrentUser()
  const currentPlan = user?.plan ?? 'free'
  const [checkoutPlan, setCheckoutPlan] = useState<{ name: string; price: number } | null>(null)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Transcription Hours</span>
              <span className="text-muted-foreground">12.5 / 50 hrs</span>
            </div>
            <Progress value={25} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Storage</span>
              <span className="text-muted-foreground">3.2 / 50 GB</span>
            </div>
            <Progress value={6.4} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>AI Questions</span>
              <span className="text-muted-foreground">45 / Unlimited</span>
            </div>
            <Progress value={0} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === currentPlan
          return (
            <Card key={plan.name} className={isCurrent ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {isCurrent && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </CardTitle>
                <p className="text-2xl font-bold">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? 'outline' : 'default'}
                  className="w-full"
                  disabled={isCurrent}
                  onClick={() => !isCurrent && setCheckoutPlan(plan)}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {checkoutPlan && (
        <CheckoutDialog
          open={!!checkoutPlan}
          onOpenChange={(open) => !open && setCheckoutPlan(null)}
          planName={checkoutPlan.name}
          price={checkoutPlan.price}
        />
      )}
    </div>
  )
}
