import type { AudioFile, Transcription, AskAIMessage, PaginatedResponse } from '@/types'
import { mockAudioFiles, mockTranscriptions, mockTags } from './mock-data'
import type { Tag } from '@/types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const api = {
  async getFiles(params?: {
    search?: string
    status?: string | null
    sortBy?: string
    sortOrder?: string
    skip?: number
    limit?: number
    tags?: string[]
  }): Promise<PaginatedResponse<AudioFile>> {
    await delay(500)
    let files = mockAudioFiles.filter((f) => !f.deletedAt)

    if (params?.search) {
      const q = params.search.toLowerCase()
      files = files.filter((f) => f.name.toLowerCase().includes(q))
    }
    if (params?.status) {
      files = files.filter((f) => f.status === params.status)
    }
    if (params?.tags && params.tags.length > 0) {
      files = files.filter((f) => params.tags!.some((t) => f.tags.includes(t)))
    }

    const sortBy = params?.sortBy ?? 'createdAt'
    const sortOrder = params?.sortOrder ?? 'desc'
    files.sort((a, b) => {
      const av = a[sortBy as keyof AudioFile]
      const bv = b[sortBy as keyof AudioFile]
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortOrder === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortOrder === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av)
    })

    const total = files.length
    const skip = params?.skip ?? 0
    const limit = params?.limit ?? 50
    const paged = files.slice(skip, skip + limit)

    return { data: paged, total, hasMore: skip + limit < total }
  },

  async getFile(id: string): Promise<AudioFile> {
    await delay(300)
    const file = mockAudioFiles.find((f) => f.id === id)
    if (!file) throw new Error('File not found')
    return { ...file }
  },

  async deleteFile(id: string): Promise<void> {
    await delay(300)
    const file = mockAudioFiles.find((f) => f.id === id)
    if (file) file.deletedAt = new Date().toISOString()
  },

  async getTranscription(fileId: string): Promise<Transcription | null> {
    await delay(400)
    return mockTranscriptions[fileId] ? { ...mockTranscriptions[fileId] } : null
  },

  async askAI(_fileId: string, question: string): Promise<AskAIMessage> {
    await delay(1000)
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Based on the transcription of this recording, here's my analysis:\n\n${question.length > 20 ? 'This is a detailed question. ' : ''}The key points from this recording include the discussion topics and action items mentioned by the speakers. Would you like me to elaborate on any specific aspect?`,
      createdAt: new Date().toISOString(),
    }
  },

  async uploadFile(file: File, onProgress?: (pct: number) => void): Promise<AudioFile> {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await delay(200)
      onProgress?.(i)
    }

    const newFile: AudioFile = {
      id: crypto.randomUUID(),
      name: file.name,
      duration: Math.floor(Math.random() * 3600) + 60,
      size: file.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      url: '',
      tags: [],
      deletedAt: null,
    }
    mockAudioFiles.unshift(newFile)
    return newFile
  },

  async updateTranscription(fileId: string, content: string): Promise<Transcription> {
    await delay(300)
    const t = mockTranscriptions[fileId]
    if (!t) throw new Error('Transcription not found')
    t.content = content
    t.updatedAt = new Date().toISOString()
    return { ...t }
  },

  async renameFile(id: string, name: string): Promise<AudioFile> {
    await delay(300)
    const file = mockAudioFiles.find((f) => f.id === id)
    if (!file) throw new Error('File not found')
    file.name = name
    file.updatedAt = new Date().toISOString()
    return { ...file }
  },

  // Trash
  async getTrashFiles(): Promise<AudioFile[]> {
    await delay(500)
    return mockAudioFiles.filter((f) => f.deletedAt !== null)
  },

  async restoreFile(id: string): Promise<void> {
    await delay(300)
    const file = mockAudioFiles.find((f) => f.id === id)
    if (file) file.deletedAt = null
  },

  async permanentDeleteFile(id: string): Promise<void> {
    await delay(300)
    const idx = mockAudioFiles.findIndex((f) => f.id === id)
    if (idx !== -1) mockAudioFiles.splice(idx, 1)
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    await delay(200)
    return [...mockTags]
  },

  async createTag(name: string, color: string): Promise<Tag> {
    await delay(200)
    const tag: Tag = { id: crypto.randomUUID(), name, color }
    mockTags.push(tag)
    return tag
  },

  async deleteTag(id: string): Promise<void> {
    await delay(200)
    const idx = mockTags.findIndex((t) => t.id === id)
    if (idx !== -1) mockTags.splice(idx, 1)
  },

  async addTagToFile(fileId: string, tagId: string): Promise<void> {
    await delay(200)
    const file = mockAudioFiles.find((f) => f.id === fileId)
    if (file && !file.tags.includes(tagId)) file.tags.push(tagId)
  },

  async removeTagFromFile(fileId: string, tagId: string): Promise<void> {
    await delay(200)
    const file = mockAudioFiles.find((f) => f.id === fileId)
    if (file) file.tags = file.tags.filter((t) => t !== tagId)
  },

  // Auth (mock)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(email: string, _password: string): Promise<{ token: string; user: typeof import('./mock-data').mockCurrentUser }> {
    await delay(500)
    const { mockUsers } = await import('./mock-data')
    const user = mockUsers.find((u) => u.email === email)
    if (!user) throw new Error('Invalid credentials')
    return { token: 'mock-jwt-token', user }
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async register(name: string, email: string, _password: string): Promise<{ token: string; user: typeof import('./mock-data').mockCurrentUser }> {
    await delay(500)
    const { mockCurrentUser } = await import('./mock-data')
    return { token: 'mock-jwt-token', user: { ...mockCurrentUser, name, email } }
  },

  async getCurrentUser(): Promise<typeof import('./mock-data').mockCurrentUser> {
    await delay(200)
    const { mockCurrentUser } = await import('./mock-data')
    return { ...mockCurrentUser }
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<void> {
    await delay(300)
    const { mockCurrentUser } = await import('./mock-data')
    if (data.name) mockCurrentUser.name = data.name
    if (data.email) mockCurrentUser.email = data.email
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async changePassword(_oldPassword: string, _newPassword: string): Promise<void> {
    await delay(300)
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTranscriptionProgress(_fileId: string): Promise<number> {
    await delay(200)
    return Math.min(100, Math.floor(Math.random() * 30) + 40)
  },
}
