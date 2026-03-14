import type { AudioFile, Transcription, User, Tag, Speaker, TranscriptionSegment } from '@/types'

export const mockCurrentUser: User = {
  id: 'u1',
  name: 'Demo User',
  email: 'demo@ai-note.app',
  avatar: '',
  plan: 'pro',
  createdAt: '2025-01-15T00:00:00Z',
}

export const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: 'u2',
    name: 'Test User',
    email: 'test@ai-note.app',
    avatar: '',
    plan: 'free',
    createdAt: '2025-06-01T00:00:00Z',
  },
]

export const mockTags: Tag[] = [
  { id: 'tag1', name: 'Meeting', color: '#3b82f6' },
  { id: 'tag2', name: 'Interview', color: '#10b981' },
  { id: 'tag3', name: 'Review', color: '#f59e0b' },
  { id: 'tag4', name: 'Planning', color: '#8b5cf6' },
]

const speakers: Speaker[] = [
  { id: 's1', name: 'Speaker 1', color: '#3b82f6' },
  { id: 's2', name: 'Speaker 2', color: '#10b981' },
  { id: 's3', name: 'Speaker 3', color: '#f59e0b' },
]

const pmSpeakers: Speaker[] = [
  { id: 'pm', name: 'PM', color: '#3b82f6' },
  { id: 'eng', name: 'Engineering', color: '#10b981' },
  { id: 'des', name: 'Design', color: '#f59e0b' },
]

const segments1: TranscriptionSegment[] = [
  { id: 'seg1', speakerId: 's1', startTime: 0, endTime: 5, text: "Good morning everyone. Let's go through our updates." },
  { id: 'seg2', speakerId: 's2', startTime: 5, endTime: 15, text: "I finished the API integration yesterday. The endpoints are working correctly with the new authentication flow." },
  { id: 'seg3', speakerId: 's3', startTime: 15, endTime: 22, text: "I'm still working on the UI components. Should be done by end of day." },
  { id: 'seg4', speakerId: 's1', startTime: 22, endTime: 25, text: "Great progress. Any blockers?" },
  { id: 'seg5', speakerId: 's2', startTime: 25, endTime: 28, text: "No blockers on my end." },
  { id: 'seg6', speakerId: 's3', startTime: 28, endTime: 35, text: "I need design feedback on the file upload component." },
]

const segments2: TranscriptionSegment[] = [
  { id: 'seg7', speakerId: 'pm', startTime: 0, endTime: 6, text: "Let's review the Q1 product roadmap progress." },
  { id: 'seg8', speakerId: 'eng', startTime: 6, endTime: 18, text: "We've shipped 3 of 5 planned features. The audio processing pipeline and real-time transcription are live." },
  { id: 'seg9', speakerId: 'des', startTime: 18, endTime: 24, text: "The new dashboard mockups are ready for review." },
  { id: 'seg10', speakerId: 'pm', startTime: 24, endTime: 28, text: "What about the Ask AI feature?" },
  { id: 'seg11', speakerId: 'eng', startTime: 28, endTime: 38, text: "It's in development. We expect to have a beta ready by end of March." },
]

export const mockAudioFiles: AudioFile[] = [
  {
    id: '1',
    name: 'Team Standup Meeting 2026-03-10.wav',
    duration: 1847,
    size: 32_400_000,
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-10T09:31:00Z',
    status: 'completed',
    url: '',
    tags: ['tag1'],
    deletedAt: null,
  },
  {
    id: '2',
    name: 'Product Review Session.wav',
    duration: 3612,
    size: 63_200_000,
    createdAt: '2026-03-11T14:00:00Z',
    updatedAt: '2026-03-11T15:01:00Z',
    status: 'completed',
    url: '',
    tags: ['tag1', 'tag3'],
    deletedAt: null,
  },
  {
    id: '3',
    name: 'Customer Interview - Alice.wav',
    duration: 2400,
    size: 42_000_000,
    createdAt: '2026-03-12T10:30:00Z',
    updatedAt: '2026-03-12T10:30:00Z',
    status: 'transcribing',
    url: '',
    tags: ['tag2'],
    deletedAt: null,
  },
  {
    id: '4',
    name: 'Weekly Planning.wav',
    duration: 900,
    size: 15_700_000,
    createdAt: '2026-03-13T08:00:00Z',
    updatedAt: '2026-03-13T08:00:00Z',
    status: 'pending',
    url: '',
    tags: ['tag4'],
    deletedAt: null,
  },
]

export const mockTranscriptions: Record<string, Transcription> = {
  '1': {
    id: 't1',
    fileId: '1',
    content:
      '<p><strong>Speaker 1:</strong> Good morning everyone. Let\'s go through our updates.</p><p><strong>Speaker 2:</strong> I finished the API integration yesterday. The endpoints are working correctly with the new authentication flow.</p><p><strong>Speaker 3:</strong> I\'m still working on the UI components. Should be done by end of day.</p><p><strong>Speaker 1:</strong> Great progress. Any blockers?</p><p><strong>Speaker 2:</strong> No blockers on my end.</p><p><strong>Speaker 3:</strong> I need design feedback on the file upload component.</p>',
    summary:
      'Team standup covering API integration completion, UI component progress, and a design feedback request for the file upload component.',
    language: 'en',
    createdAt: '2026-03-10T09:32:00Z',
    updatedAt: '2026-03-10T09:32:00Z',
    speakers,
    segments: segments1,
  },
  '2': {
    id: 't2',
    fileId: '2',
    content:
      '<p><strong>PM:</strong> Let\'s review the Q1 product roadmap progress.</p><p><strong>Engineering:</strong> We\'ve shipped 3 of 5 planned features. The audio processing pipeline and real-time transcription are live.</p><p><strong>Design:</strong> The new dashboard mockups are ready for review.</p><p><strong>PM:</strong> What about the Ask AI feature?</p><p><strong>Engineering:</strong> It\'s in development. We expect to have a beta ready by end of March.</p>',
    summary:
      'Product review covering Q1 roadmap: 3/5 features shipped, dashboard redesign ready, Ask AI feature targeting end-of-March beta.',
    language: 'en',
    createdAt: '2026-03-11T15:02:00Z',
    updatedAt: '2026-03-11T15:02:00Z',
    speakers: pmSpeakers,
    segments: segments2,
  },
}
