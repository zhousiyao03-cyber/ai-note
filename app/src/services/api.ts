import type { AudioFile, Transcription, AskAIMessage, PaginatedResponse, Tag, User } from '@/types'

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error?.message ?? `Request failed: ${res.status}`)
  }
  return json.data as T
}

export const api = {
  // --- Files ---

  async getFiles(params?: {
    search?: string
    status?: string | null
    sortBy?: string
    sortOrder?: string
    skip?: number
    limit?: number
    tags?: string[]
  }): Promise<PaginatedResponse<AudioFile>> {
    const sp = new URLSearchParams()
    if (params?.search) sp.set('search', params.search)
    if (params?.status) sp.set('status', params.status)
    if (params?.sortBy) sp.set('sortBy', params.sortBy)
    if (params?.sortOrder) sp.set('sortOrder', params.sortOrder)
    if (params?.skip) sp.set('skip', String(params.skip))
    if (params?.limit) sp.set('limit', String(params.limit))
    if (params?.tags?.length) sp.set('tags', params.tags.join(','))

    const qs = sp.toString()
    const res = await fetch(`/api/v1/files${qs ? `?${qs}` : ''}`)
    const json = await res.json()
    if (!res.ok) throw new Error(json.error?.message ?? 'Failed to fetch files')
    return { data: json.data, total: json.meta.total, hasMore: json.meta.hasMore }
  },

  async getFile(id: string): Promise<AudioFile> {
    return fetchJSON<AudioFile>(`/api/v1/files/${id}`)
  },

  async deleteFile(id: string): Promise<void> {
    await fetchJSON(`/api/v1/files/${id}`, { method: 'DELETE' })
  },

  async renameFile(id: string, name: string): Promise<AudioFile> {
    return fetchJSON<AudioFile>(`/api/v1/files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    })
  },

  // --- Trash ---

  async getTrashFiles(): Promise<AudioFile[]> {
    return fetchJSON<AudioFile[]>('/api/v1/trash/files')
  },

  async restoreFile(id: string): Promise<void> {
    await fetchJSON(`/api/v1/files/${id}/restore`, { method: 'POST' })
  },

  async permanentDeleteFile(id: string): Promise<void> {
    await fetchJSON(`/api/v1/files/${id}/permanent`, { method: 'DELETE' })
  },

  // --- Tags ---

  async getTags(): Promise<Tag[]> {
    return fetchJSON<Tag[]>('/api/v1/tags')
  },

  async createTag(name: string, color: string): Promise<Tag> {
    return fetchJSON<Tag>('/api/v1/tags', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    })
  },

  async deleteTag(id: string): Promise<void> {
    await fetchJSON(`/api/v1/tags/${id}`, { method: 'DELETE' })
  },

  async addTagToFile(fileId: string, tagId: string): Promise<void> {
    await fetchJSON(`/api/v1/files/${fileId}/tags/${tagId}`, { method: 'POST' })
  },

  async removeTagFromFile(fileId: string, tagId: string): Promise<void> {
    await fetchJSON(`/api/v1/files/${fileId}/tags/${tagId}`, { method: 'DELETE' })
  },

  // --- Transcription ---

  async getTranscription(fileId: string): Promise<Transcription | null> {
    try {
      return await fetchJSON<Transcription>(`/api/v1/files/${fileId}/transcription`)
    } catch {
      return null
    }
  },

  async updateTranscription(fileId: string, content: string): Promise<Transcription> {
    return fetchJSON<Transcription>(`/api/v1/files/${fileId}/transcription`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    })
  },

  // --- Ask AI ---

  async askAI(fileId: string, question: string): Promise<AskAIMessage> {
    return fetchJSON<AskAIMessage>(`/api/v1/files/${fileId}/ask-ai/messages`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    })
  },

  // --- Upload ---

  async uploadFile(file: File, onProgress?: (pct: number) => void): Promise<AudioFile> {
    // Phase 2: will use upload-init → direct PUT → upload-complete
    // For now, stub that returns after "uploading"
    onProgress?.(0)

    const initRes = await fetchJSON<{ fileId: string; url: string }>('/api/v1/files/upload-init', {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      }),
    })

    // Direct upload to Supabase Storage
    onProgress?.(10)
    const uploadRes = await fetch(initRes.url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!uploadRes.ok) {
      throw new Error('Failed to upload file to storage')
    }
    onProgress?.(80)

    // Complete upload
    const audioFile = await fetchJSON<AudioFile>('/api/v1/files/upload-complete', {
      method: 'POST',
      body: JSON.stringify({ fileId: initRes.fileId }),
    })
    onProgress?.(100)

    return audioFile
  },

  // --- Auth (called via Supabase client directly in use-auth.ts, these are for profile) ---

  async getCurrentUser(): Promise<User> {
    return fetchJSON<User>('/api/v1/me')
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<void> {
    await fetchJSON('/api/v1/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await fetchJSON('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    })
  },

  async getTranscriptionProgress(fileId: string): Promise<number> {
    const data = await fetchJSON<{ status: string; progress: number }>(`/api/v1/files/${fileId}/status`)
    return data.progress
  },

  // Auth API passthrough (used by login/register forms if they call api.login/api.register)
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error?.message ?? 'Login failed')
    return { token: '', user: json.data }
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error?.message ?? 'Registration failed')
    return { token: '', user: json.data }
  },
}
