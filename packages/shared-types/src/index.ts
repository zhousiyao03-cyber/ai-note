export type FileStatus = 'pending' | 'transcribing' | 'completed' | 'failed'

export interface AudioFile {
  id: string
  name: string
  duration: number
  size: number
  createdAt: string
  updatedAt: string
  status: FileStatus
  url: string
  tags: string[]
  deletedAt: string | null
  progress?: number
  mimeType?: string
  language?: string
  errorMessage?: string | null
  storageKey?: string
}

export interface Transcription {
  id: string
  fileId: string
  content: string
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
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
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
    storage: number
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
  startTime: number
  endTime: number
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
