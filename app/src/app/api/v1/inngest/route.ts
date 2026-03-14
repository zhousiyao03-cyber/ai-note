import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'

const handler = serve({
  client: inngest,
  functions: [],
})

export const { GET, POST, PUT } = handler
