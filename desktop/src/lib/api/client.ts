import type { AudioFile, PaginatedResponse, Transcription, User } from '@plaud/shared-types'

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type ApiEnvelope<T> = {
  data: T
  error: { code?: string; message?: string } | null
}

function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  return configured ? configured.replace(/\/$/, '') : ''
}

function getRequestUrl(path: string) {
  const baseUrl = getApiBaseUrl()
  return baseUrl ? `${baseUrl}${path}` : path
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getRequestUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  const payload = (await response.json()) as ApiEnvelope<T>

  if (!response.ok) {
    throw new ApiError(
      payload.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload.error?.code,
    )
  }

  return payload.data
}

export const desktopApi = {
  async getCurrentUser() {
    try {
      return await fetchJson<User>('/api/v1/me')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return null
      }
      throw error
    }
  },

  login(input: { email: string; password: string }) {
    return fetchJson<User>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  logout() {
    return fetchJson<null>('/api/v1/auth/logout', {
      method: 'POST',
    })
  },

  getFile(fileId: string) {
    return fetchJson<AudioFile>(`/api/v1/files/${fileId}`)
  },

  async getTranscription(fileId: string) {
    try {
      return await fetchJson<Transcription>(`/api/v1/files/${fileId}/transcription`)
    } catch {
      return null
    }
  },

  async uploadFile(file: File, onProgress?: (pct: number) => void) {
    onProgress?.(0)

    const initRes = await fetchJson<{ fileId: string; url: string }>('/api/v1/files/upload-init', {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      }),
    })

    onProgress?.(10)

    const uploadRes = await fetch(initRes.url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })

    if (!uploadRes.ok) {
      throw new Error('Failed to upload file to storage')
    }

    onProgress?.(80)

    const createdFile = await fetchJson<AudioFile>('/api/v1/files/upload-complete', {
      method: 'POST',
      body: JSON.stringify({ fileId: initRes.fileId }),
    })

    onProgress?.(100)

    return createdFile
  },

  getFiles(params?: {
    search?: string
    status?: string | null
    sortBy?: string
    sortOrder?: string
    skip?: number
    limit?: number
    tags?: string[]
  }) {
    const searchParams = new URLSearchParams()

    if (params?.search) searchParams.set('search', params.search)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder)
    if (typeof params?.skip === 'number') searchParams.set('skip', String(params.skip))
    if (typeof params?.limit === 'number') searchParams.set('limit', String(params.limit))
    if (params?.tags?.length) searchParams.set('tags', params.tags.join(','))

    const query = searchParams.toString()
    return fetchJson<PaginatedResponse<AudioFile>>(`/api/v1/files${query ? `?${query}` : ''}`)
  },
}
