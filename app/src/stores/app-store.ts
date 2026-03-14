import { create } from 'zustand'
import type { AskAIMessage } from '@/types'

interface AppState {
  // Left nav sidebar
  navSidebarCollapsed: boolean
  toggleNavSidebar: () => void

  // Ask AI panel
  askAiPanelOpen: boolean
  toggleAskAiPanel: () => void

  // Ask AI chat
  chatMessages: Record<string, AskAIMessage[]>
  addMessage: (fileId: string, message: AskAIMessage) => void
  clearMessages: (fileId: string) => void

  // Audio playback preferences
  playbackRate: number
  setPlaybackRate: (rate: number) => void
  volume: number
  setVolume: (v: number) => void

  // File list UI
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: string | null
  setStatusFilter: (s: string | null) => void
  sortBy: 'createdAt' | 'name' | 'duration' | 'size'
  sortOrder: 'asc' | 'desc'
  setSortBy: (by: 'createdAt' | 'name' | 'duration' | 'size') => void
  setSortOrder: (order: 'asc' | 'desc') => void

  // Tag filter
  tagFilter: string[]
  toggleTagFilter: (tagId: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  navSidebarCollapsed: false,
  toggleNavSidebar: () => set((s) => ({ navSidebarCollapsed: !s.navSidebarCollapsed })),

  askAiPanelOpen: true,
  toggleAskAiPanel: () => set((s) => ({ askAiPanelOpen: !s.askAiPanelOpen })),

  chatMessages: {},
  addMessage: (fileId, message) =>
    set((s) => ({
      chatMessages: {
        ...s.chatMessages,
        [fileId]: [...(s.chatMessages[fileId] ?? []), message],
      },
    })),
  clearMessages: (fileId) =>
    set((s) => ({
      chatMessages: { ...s.chatMessages, [fileId]: [] },
    })),

  playbackRate: 1,
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  volume: 1,
  setVolume: (v) => set({ volume: v }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  statusFilter: null,
  setStatusFilter: (s) => set({ statusFilter: s }),
  sortBy: 'createdAt',
  sortOrder: 'desc',
  setSortBy: (by) => set({ sortBy: by }),
  setSortOrder: (order) => set({ sortOrder: order }),

  tagFilter: [],
  toggleTagFilter: (tagId) =>
    set((s) => ({
      tagFilter: s.tagFilter.includes(tagId)
        ? s.tagFilter.filter((t) => t !== tagId)
        : [...s.tagFilter, tagId],
    })),
}))
