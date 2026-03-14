import { useState } from 'react'
import { Loader2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName: string
  price: number
}

export function CheckoutDialog({ open, onOpenChange, planName, price }: CheckoutDialogProps) {
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    // Mock payment processing
    await new Promise((r) => setTimeout(r, 2000))
    setProcessing(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onOpenChange(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Upgrade to {planName}</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <p className="font-medium">Payment Successful!</p>
            <p className="text-sm text-muted-foreground">You are now on the {planName} plan.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-md border p-3 text-sm">
              <div className="flex justify-between">
                <span>{planName} Plan</span>
                <span className="font-medium">${price}/mo</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card">Card Number</Label>
              <input
                id="card"
                placeholder="4242 4242 4242 4242"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <input
                  id="expiry"
                  placeholder="MM/YY"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <input
                  id="cvc"
                  placeholder="123"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>
            </div>

            <Button className="w-full" type="submit" disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay ${price}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This is a mock checkout. No real payment will be processed.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
