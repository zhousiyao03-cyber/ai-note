import { useState } from 'react'
import { Loader2, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName: string
  price: number
}

export function CheckoutDialog({ open, onOpenChange, planName, price }: CheckoutDialogProps) {
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 1000))
    setProcessing(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onOpenChange(false)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('settings.billingComingSoon')}</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <p className="font-medium">{t('settings.billingRequestSaved')}</p>
            <p className="text-sm text-muted-foreground">
              {t('settings.billingRequestSavedDescription', { planName })}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-md border p-3 text-sm">
              <div className="flex justify-between">
                <span>{planName}</span>
                <span className="font-medium">${price}/mo</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {t('settings.billingComingSoonDescription')}
            </p>

            <Button className="w-full" type="submit" disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('settings.notifyMe')}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
