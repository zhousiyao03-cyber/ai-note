import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { transcribeFile } from '@/lib/inngest/functions/transcribe'

const handler = serve({
  client: inngest,
  functions: [transcribeFile],
})

export const { GET, POST, PUT } = handler
