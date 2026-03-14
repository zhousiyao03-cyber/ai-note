export interface AudioFile {
  id: string
  name: string
  duration: number // seconds (DB: duration_sec)
  size: number // bytes (DB: size_bytes)
  createdAt: string
  updatedAt: string
  status: 'pending' | 'transcribing' | 'completed' | 'failed'
  url: string // (DB: audio_url)
  tags: string[] // tag IDs from file_tags join
  deletedAt: string | null
  progress?: number // 0-100, transcription progress
  mimeType?: string
  language?: string
  errorMessage?: string | null
  storageKey?: string
}

export interface Transcription {
  id: string
  fileId: string
  content: string // HTML content from Tiptap (DB: content_html)
  summary: string
  language: string
  createdAt: string
  updatedAt: string
  speakers: Speaker[]
  segments: TranscriptionSegment[]
}

export interface AskAIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string // (DB: avatar_url)
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'failed'
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Subscription {
  id: string
  plan: Plan
  status: 'active' | 'cancelled' | 'past_due'
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

export interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  limits: {
    uploadMinutes: number
    aiQuestions: number
    storage: number // GB
  }
}

export interface Speaker {
  id: string
  name: string
  color: string
}

export interface TranscriptionSegment {
  id: string
  speakerId: string
  startTime: number // seconds
  endTime: number // seconds
  text: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  hasMore: boolean
}

export interface UserPreferences {
  emailNotifications: boolean
  autoTranscribe: boolean
  speakerDetection: boolean
  language: string
  theme: string
}
