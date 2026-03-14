import { loadStripe } from '@stripe/stripe-js'

// Mock Stripe public key - replace with real key in production
const STRIPE_PUBLIC_KEY = 'pk_test_mock_key'

let stripePromise: ReturnType<typeof loadStripe> | null = null

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY)
  }
  return stripePromise
}
