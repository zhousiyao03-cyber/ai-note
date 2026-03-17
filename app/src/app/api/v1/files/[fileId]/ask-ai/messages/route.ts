import { NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth } from '@/lib/api-helpers'
import type { AskAIMessage } from '@/types'

type Params = { params: Promise<{ fileId: string }> }

type TranscriptionRow = {
  file_id: string
  content_html: string
  summary: string
  language: string | null
}

const EN_STOP_WORDS = new Set([
  'about',
  'after',
  'again',
  'also',
  'because',
  'could',
  'from',
  'have',
  'into',
  'just',
  'that',
  'them',
  'they',
  'this',
  'what',
  'when',
  'where',
  'which',
  'while',
  'with',
  'would',
  'your',
])

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function splitIntoSentences(text: string) {
  return text
    .split(/(?<=[.!?。！？])\s+|\n+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function tokenizeQuestion(question: string) {
  const tokens = question.toLowerCase().match(/[\p{L}\p{N}\u4e00-\u9fff]{2,}/gu) ?? []

  return [...new Set(tokens.filter((token) => !EN_STOP_WORDS.has(token)))]
}

function findRelevantExcerpt(question: string, transcript: string) {
  const sentences = splitIntoSentences(transcript)
  const tokens = tokenizeQuestion(question)

  if (sentences.length === 0) return ''
  if (tokens.length === 0) return sentences[0]

  let bestSentence = ''
  let bestScore = 0

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()
    const score = tokens.reduce(
      (total, token) => total + (lowerSentence.includes(token) ? 1 : 0),
      0,
    )

    if (score > bestScore) {
      bestSentence = sentence
      bestScore = score
    }
  }

  return bestScore > 0 ? bestSentence : sentences[0]
}

function isChineseText(text: string) {
  return /[\u4e00-\u9fff]/u.test(text)
}

function buildFallbackAnswer(question: string, summary: string, transcript: string) {
  const excerpt = findRelevantExcerpt(question, transcript)
  const cleanSummary = summary.trim()
  const cleanExcerpt = excerpt.trim()

  if (isChineseText(question)) {
    const parts = [
      cleanSummary ? `根据当前转写内容，先给你一个简要结论：${cleanSummary}` : '',
      cleanExcerpt ? `相关原文片段：${cleanExcerpt}` : '',
      '如果你愿意，我还可以继续帮你整理行动项、会议决定或待办。',
    ]

    return parts.filter(Boolean).join('\n\n')
  }

  const parts = [
    cleanSummary ? `Based on the current transcript, here is the short answer: ${cleanSummary}` : '',
    cleanExcerpt ? `Relevant excerpt: ${cleanExcerpt}` : '',
    'I can also help turn this into action items, decisions, or a tighter summary.',
  ]

  return parts.filter(Boolean).join('\n\n')
}

async function loadOwnedTranscript(
  fileId: string,
  userId: string,
  supabase: Awaited<ReturnType<typeof requireAuth>>['supabase'],
) {
  const { data: file, error: fileError } = await supabase
    .from('files')
    .select('id, status')
    .eq('id', fileId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single<{ id: string; status: string }>()

  if (fileError || !file) {
    return { file: null, transcription: null }
  }

  const { data: transcription } = await supabase
    .from('transcriptions')
    .select('file_id, content_html, summary, language')
    .eq('file_id', file.id)
    .single<TranscriptionRow>()

  return { file, transcription }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { fileId } = await params
    const { user, supabase } = await requireAuth()
    if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

    const body = await request.json()
    const question = typeof body.question === 'string' ? body.question.trim() : ''

    if (!question) {
      return errorResponse('BAD_REQUEST', 'Question is required', 400)
    }

    const { file, transcription } = await loadOwnedTranscript(fileId, user.id, supabase)

    if (!file) {
      return errorResponse('NOT_FOUND', 'File not found', 404)
    }

    if (!transcription) {
      return errorResponse(
        'TRANSCRIPTION_REQUIRED',
        file.status === 'completed'
          ? 'No transcript is available for this file yet'
          : 'Ask AI becomes available after transcription completes',
        400,
      )
    }

    const transcriptText = stripHtml(transcription.content_html)
    const answer = buildFallbackAnswer(question, transcription.summary, transcriptText)

    const createdAt = new Date().toISOString()
    const userMessageId = crypto.randomUUID()
    const assistantMessageId = crypto.randomUUID()

    const { error: insertError } = await supabase
      .from('ask_ai_messages')
      .insert([
        {
          id: userMessageId,
          file_id: fileId,
          user_id: user.id,
          role: 'user',
          content: question,
          created_at: createdAt,
        },
        {
          id: assistantMessageId,
          file_id: fileId,
          user_id: user.id,
          role: 'assistant',
          content: answer,
          created_at: createdAt,
        },
      ])

    if (insertError) {
      return errorResponse('SAVE_FAILED', insertError.message, 500)
    }

    const assistantMessage: AskAIMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: answer,
      createdAt,
    }

    return envelope(assistantMessage)
  } catch (error) {
    return errorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500,
    )
  }
}
