import { createSignedAudioDownloadUrl } from '@/lib/audio-storage'
import { inngest } from '@/lib/inngest'
import { createAdminClient } from '@/lib/supabase/admin'

type FileRow = {
  id: string
  user_id: string
  name: string
  storage_key: string
  mime_type: string | null
  language: string | null
  duration_sec: number | null
  size_bytes: number
}

type TranscriptSegment = {
  startTime: number
  endTime: number
  text: string
}

type TranscriptResult = {
  contentHtml: string
  summary: string
  language: string
  duration: number
  segments: TranscriptSegment[]
}

type OpenAITranscriptionResponse = {
  text?: string
  language?: string
  duration?: number
  segments?: Array<{
    start?: number
    end?: number
    text?: string
  }>
}

const DEFAULT_SPEAKER_COLOR = '#3b82f6'

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function toHtmlParagraphs(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) return '<p></p>'

  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('')
}

function summarizeTranscript(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return 'Transcript generated successfully.'
  if (clean.length <= 220) return clean
  return `${clean.slice(0, 217).trimEnd()}...`
}

function buildMockTranscript(fileName: string, requestedLanguage: string | null): TranscriptResult {
  const text = [
    `Placeholder transcript for ${fileName}.`,
    'Set OPENAI_API_KEY to enable real speech-to-text in the Inngest worker.',
    'This keeps the upload and background job flow testable during local development.',
  ].join(' ')

  return {
    contentHtml: toHtmlParagraphs(text),
    summary: summarizeTranscript(text),
    language: requestedLanguage && requestedLanguage !== 'auto' ? requestedLanguage : 'en',
    duration: 30,
    segments: [
      {
        startTime: 0,
        endTime: 30,
        text,
      },
    ],
  }
}

async function transcribeWithOpenAI(file: FileRow, audioUrl: string, requestedLanguage: string | null) {
  const audioResponse = await fetch(audioUrl, { cache: 'no-store' })
  if (!audioResponse.ok) {
    throw new Error(`Failed to download audio file (${audioResponse.status})`)
  }

  const audioBuffer = await audioResponse.arrayBuffer()
  const formData = new FormData()
  formData.append(
    'file',
    new Blob([audioBuffer], {
      type: file.mime_type ?? 'application/octet-stream',
    }),
    file.name,
  )
  formData.append('model', 'whisper-1')
  formData.append('response_format', 'verbose_json')

  if (requestedLanguage && requestedLanguage !== 'auto') {
    formData.append('language', requestedLanguage)
  }

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `OpenAI transcription failed (${response.status})`)
  }

  const payload = await response.json() as OpenAITranscriptionResponse
  const transcriptText = payload.text?.trim()

  if (!transcriptText) {
    throw new Error('OpenAI returned an empty transcript')
  }

  const rawSegments = Array.isArray(payload.segments) && payload.segments.length > 0
    ? payload.segments
    : [{ start: 0, end: payload.duration ?? file.duration_sec ?? 0, text: transcriptText }]

  const segments = rawSegments.map((segment, index) => {
    const startTime = typeof segment.start === 'number' ? segment.start : index * 30
    const fallbackEnd = typeof payload.duration === 'number' ? payload.duration : startTime + 30
    const endTime = typeof segment.end === 'number' ? segment.end : fallbackEnd

    return {
      startTime,
      endTime: endTime >= startTime ? endTime : startTime,
      text: segment.text?.trim() || transcriptText,
    }
  })

  const duration = typeof payload.duration === 'number'
    ? payload.duration
    : segments.at(-1)?.endTime ?? file.duration_sec ?? 0

  return {
    contentHtml: toHtmlParagraphs(transcriptText),
    summary: summarizeTranscript(transcriptText),
    language: payload.language || requestedLanguage || file.language || 'en',
    duration,
    segments,
  }
}

async function generateTranscript(file: FileRow, audioUrl: string, requestedLanguage: string | null) {
  if (!process.env.OPENAI_API_KEY) {
    return buildMockTranscript(file.name, requestedLanguage)
  }

  return transcribeWithOpenAI(file, audioUrl, requestedLanguage)
}

export const transcribeFile = inngest.createFunction(
  { id: 'transcribe-file' },
  { event: 'files/transcription.requested' },
  async ({ event, step }) => {
    const admin = createAdminClient()
    const fileId = event.data.fileId as string
    const userId = event.data.userId as string
    const requestedLanguage = typeof event.data.language === 'string' ? event.data.language : null

    try {
      const file = await step.run('load-file', async () => {
        const { data, error } = await admin
          .from('files')
          .select('id, user_id, name, storage_key, mime_type, language, duration_sec, size_bytes')
          .eq('id', fileId)
          .eq('user_id', userId)
          .single<FileRow>()

        if (error || !data) {
          throw new Error('File not found')
        }

        return data
      })

      await step.run('update-status', async () => {
        const timestamp = new Date().toISOString()

        await admin
          .from('files')
          .update({
            status: 'transcribing',
            progress: 10,
            error_message: null,
          })
          .eq('id', file.id)

        await admin
          .from('transcription_jobs')
          .upsert({
            file_id: file.id,
            provider: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
            status: 'running',
            progress: 10,
            attempts: 1,
            last_error: null,
            started_at: timestamp,
          }, { onConflict: 'file_id' })
      })

      const audioUrl = await step.run('get-audio-url', async () => {
        const signedUrl = await createSignedAudioDownloadUrl(file.storage_key)

        await admin
          .from('files')
          .update({ progress: 35 })
          .eq('id', file.id)

        await admin
          .from('transcription_jobs')
          .update({ progress: 35 })
          .eq('file_id', file.id)

        return signedUrl
      })

      const transcript = await step.run('call-stt-provider', async () => {
        const result = await generateTranscript(file, audioUrl, requestedLanguage)

        await admin
          .from('files')
          .update({ progress: 80 })
          .eq('id', file.id)

        await admin
          .from('transcription_jobs')
          .update({ progress: 80 })
          .eq('file_id', file.id)

        return result
      })

      await step.run('store-transcript', async () => {
        const timestamp = new Date().toISOString()
        const finalAudioUrl = await createSignedAudioDownloadUrl(file.storage_key)

        const { data: transcription, error: transcriptionError } = await admin
          .from('transcriptions')
          .upsert({
            file_id: file.id,
            content_html: transcript.contentHtml,
            summary: transcript.summary,
            language: transcript.language,
            updated_at: timestamp,
          }, { onConflict: 'file_id' })
          .select('id')
          .single<{ id: string }>()

        if (transcriptionError || !transcription) {
          throw new Error(transcriptionError?.message ?? 'Failed to save transcription')
        }

        await admin
          .from('transcription_segments')
          .delete()
          .eq('transcription_id', transcription.id)

        await admin
          .from('speakers')
          .delete()
          .eq('transcription_id', transcription.id)

        const { data: speaker, error: speakerError } = await admin
          .from('speakers')
          .insert({
            transcription_id: transcription.id,
            name: 'Speaker 1',
            color: DEFAULT_SPEAKER_COLOR,
          })
          .select('id')
          .single<{ id: string }>()

        if (speakerError || !speaker) {
          throw new Error(speakerError?.message ?? 'Failed to save speaker data')
        }

        if (transcript.segments.length > 0) {
          const { error: segmentsError } = await admin
            .from('transcription_segments')
            .insert(
              transcript.segments.map((segment, index) => ({
                transcription_id: transcription.id,
                speaker_id: speaker.id,
                start_time: segment.startTime,
                end_time: segment.endTime,
                text: segment.text,
                sequence: index,
              })),
            )

          if (segmentsError) {
            throw new Error(segmentsError.message)
          }
        }

        await admin
          .from('files')
          .update({
            audio_url: finalAudioUrl,
            duration_sec: Math.round(transcript.duration || file.duration_sec || 0),
            language: transcript.language,
            status: 'completed',
            progress: 100,
            error_message: null,
          })
          .eq('id', file.id)

        await admin
          .from('transcription_jobs')
          .update({
            status: 'completed',
            progress: 100,
            last_error: null,
            finished_at: timestamp,
          })
          .eq('file_id', file.id)

        const usageAmount = Math.max(1, Math.round(transcript.duration || file.duration_sec || 0))
        await admin
          .from('usage_records')
          .insert({
            user_id: file.user_id,
            file_id: file.id,
            type: 'transcription_seconds',
            amount: usageAmount,
            unit: 'seconds',
          })
      })

      return { fileId, status: 'completed' }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transcription failed'

      await step.run('mark-failed', async () => {
        const timestamp = new Date().toISOString()

        await admin
          .from('files')
          .update({
            status: 'failed',
            error_message: message,
          })
          .eq('id', fileId)

        await admin
          .from('transcription_jobs')
          .upsert({
            file_id: fileId,
            provider: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
            status: 'failed',
            last_error: message,
            finished_at: timestamp,
          }, { onConflict: 'file_id' })
      })

      throw error
    }
  },
)
