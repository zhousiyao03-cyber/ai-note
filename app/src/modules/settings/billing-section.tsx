import { useState } from 'react'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.billingOverview')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('settings.billingReadOnly')}
          </p>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">
              {t('settings.currentPlanLabel')} {currentPlan}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('settings.usageTrackingSoon')}
            </p>
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
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {t('settings.currentPlan')}
                    </span>
                  )}
                </CardTitle>
                <p className="text-2xl font-bold">
                  {plan.price === 0 ? t('settings.freePlan') : `$${plan.price}`}
                  {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="mb-4 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? 'outline' : 'default'}
                  className="w-full"
                  disabled={isCurrent}
                  onClick={() => !isCurrent && setCheckoutPlan(plan)}
                >
                  {isCurrent ? t('settings.currentPlan') : t('settings.billingComingSoon')}
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
