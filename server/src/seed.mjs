import { createHash, randomUUID } from 'node:crypto';

function now() {
  return new Date().toISOString();
}

export function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

function usageRecord(userId, type, amount, unit, fileId = null) {
  return {
    id: randomUUID(),
    userId,
    fileId,
    type,
    amount,
    unit,
    createdAt: now(),
  };
}

export function createSeedDb() {
  const createdAt = now();
  const userId = randomUUID();
  const meetingTagId = randomUUID();
  const interviewTagId = randomUUID();
  const reviewTagId = randomUUID();
  const planningTagId = randomUUID();

  const file1Id = randomUUID();
  const file2Id = randomUUID();
  const file3Id = randomUUID();
  const file4Id = randomUUID();

  const transcription1Id = randomUUID();
  const transcription2Id = randomUUID();
  const s1 = randomUUID();
  const s2 = randomUUID();
  const s3 = randomUUID();
  const pm = randomUUID();
  const eng = randomUUID();
  const des = randomUUID();

  return {
    users: [
      {
        id: userId,
        name: 'Demo User',
        email: 'demo@plaud.ai',
        passwordHash: hashPassword('demo1234'),
        avatarUrl: null,
        plan: 'pro',
        emailVerified: true,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    sessions: [],
    passwordResetTokens: [],
    preferences: [
      {
        userId,
        emailNotifications: true,
        autoTranscribe: true,
        speakerDetection: true,
        language: 'en',
        theme: 'system',
        createdAt,
        updatedAt: createdAt,
      },
    ],
    tags: [
      { id: meetingTagId, userId, name: 'Meeting', color: '#3b82f6', createdAt },
      { id: interviewTagId, userId, name: 'Interview', color: '#10b981', createdAt },
      { id: reviewTagId, userId, name: 'Review', color: '#f59e0b', createdAt },
      { id: planningTagId, userId, name: 'Planning', color: '#8b5cf6', createdAt },
    ],
    files: [
      {
        id: file1Id,
        userId,
        name: 'Team Standup Meeting 2026-03-10.wav',
        storageKey: null,
        audioPath: null,
        mimeType: 'audio/wav',
        language: 'en',
        durationSec: 1847,
        sizeBytes: 32400000,
        status: 'completed',
        progress: 100,
        errorMessage: null,
        deletedAt: null,
        createdAt: '2026-03-10T09:00:00.000Z',
        updatedAt: '2026-03-10T09:31:00.000Z',
        tagIds: [meetingTagId],
      },
      {
        id: file2Id,
        userId,
        name: 'Product Review Session.wav',
        storageKey: null,
        audioPath: null,
        mimeType: 'audio/wav',
        language: 'en',
        durationSec: 3612,
        sizeBytes: 63200000,
        status: 'completed',
        progress: 100,
        errorMessage: null,
        deletedAt: null,
        createdAt: '2026-03-11T14:00:00.000Z',
        updatedAt: '2026-03-11T15:01:00.000Z',
        tagIds: [meetingTagId, reviewTagId],
      },
      {
        id: file3Id,
        userId,
        name: 'Customer Interview - Alice.wav',
        storageKey: null,
        audioPath: null,
        mimeType: 'audio/wav',
        language: null,
        durationSec: 2400,
        sizeBytes: 42000000,
        status: 'transcribing',
        progress: 52,
        errorMessage: null,
        deletedAt: null,
        createdAt: '2026-03-12T10:30:00.000Z',
        updatedAt: '2026-03-12T10:30:00.000Z',
        tagIds: [interviewTagId],
      },
      {
        id: file4Id,
        userId,
        name: 'Weekly Planning.wav',
        storageKey: null,
        audioPath: null,
        mimeType: 'audio/wav',
        language: null,
        durationSec: 900,
        sizeBytes: 15700000,
        status: 'pending',
        progress: 0,
        errorMessage: null,
        deletedAt: null,
        createdAt: '2026-03-13T08:00:00.000Z',
        updatedAt: '2026-03-13T08:00:00.000Z',
        tagIds: [planningTagId],
      },
    ],
    transcriptions: [
      {
        id: transcription1Id,
        fileId: file1Id,
        contentHtml:
          "<p><strong>Speaker 1:</strong> Good morning everyone. Let's go through our updates.</p><p><strong>Speaker 2:</strong> I finished the API integration yesterday. The endpoints are working correctly with the new authentication flow.</p><p><strong>Speaker 3:</strong> I'm still working on the UI components. Should be done by end of day.</p><p><strong>Speaker 1:</strong> Great progress. Any blockers?</p><p><strong>Speaker 2:</strong> No blockers on my end.</p><p><strong>Speaker 3:</strong> I need design feedback on the file upload component.</p>",
        summary:
          'Team standup covering API integration completion, UI component progress, and a design feedback request for the file upload component.',
        language: 'en',
        createdAt: '2026-03-10T09:32:00.000Z',
        updatedAt: '2026-03-10T09:32:00.000Z',
        speakers: [
          { id: s1, name: 'Speaker 1', color: '#3b82f6' },
          { id: s2, name: 'Speaker 2', color: '#10b981' },
          { id: s3, name: 'Speaker 3', color: '#f59e0b' },
        ],
        segments: [
          { id: randomUUID(), speakerId: s1, startTime: 0, endTime: 5, text: "Good morning everyone. Let's go through our updates." },
          { id: randomUUID(), speakerId: s2, startTime: 5, endTime: 15, text: 'I finished the API integration yesterday. The endpoints are working correctly with the new authentication flow.' },
          { id: randomUUID(), speakerId: s3, startTime: 15, endTime: 22, text: "I'm still working on the UI components. Should be done by end of day." },
          { id: randomUUID(), speakerId: s1, startTime: 22, endTime: 25, text: 'Great progress. Any blockers?' },
          { id: randomUUID(), speakerId: s2, startTime: 25, endTime: 28, text: 'No blockers on my end.' },
          { id: randomUUID(), speakerId: s3, startTime: 28, endTime: 35, text: 'I need design feedback on the file upload component.' },
        ],
      },
      {
        id: transcription2Id,
        fileId: file2Id,
        contentHtml:
          "<p><strong>PM:</strong> Let's review the Q1 product roadmap progress.</p><p><strong>Engineering:</strong> We've shipped 3 of 5 planned features. The audio processing pipeline and real-time transcription are live.</p><p><strong>Design:</strong> The new dashboard mockups are ready for review.</p><p><strong>PM:</strong> What about the Ask AI feature?</p><p><strong>Engineering:</strong> It's in development. We expect to have a beta ready by end of March.</p>",
        summary:
          'Product review covering Q1 roadmap: 3/5 features shipped, dashboard redesign ready, Ask AI feature targeting end-of-March beta.',
        language: 'en',
        createdAt: '2026-03-11T15:02:00.000Z',
        updatedAt: '2026-03-11T15:02:00.000Z',
        speakers: [
          { id: pm, name: 'PM', color: '#3b82f6' },
          { id: eng, name: 'Engineering', color: '#10b981' },
          { id: des, name: 'Design', color: '#f59e0b' },
        ],
        segments: [
          { id: randomUUID(), speakerId: pm, startTime: 0, endTime: 6, text: "Let's review the Q1 product roadmap progress." },
          { id: randomUUID(), speakerId: eng, startTime: 6, endTime: 18, text: "We've shipped 3 of 5 planned features. The audio processing pipeline and real-time transcription are live." },
          { id: randomUUID(), speakerId: des, startTime: 18, endTime: 24, text: 'The new dashboard mockups are ready for review.' },
          { id: randomUUID(), speakerId: pm, startTime: 24, endTime: 28, text: 'What about the Ask AI feature?' },
          { id: randomUUID(), speakerId: eng, startTime: 28, endTime: 38, text: "It's in development. We expect to have a beta ready by end of March." },
        ],
      },
    ],
    askAiMessages: [],
    subscriptions: [
      {
        id: randomUUID(),
        userId,
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: '2026-04-01T00:00:00.000Z',
        cancelAtPeriodEnd: false,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    usageRecords: [
      usageRecord(userId, 'transcription_seconds', 1847, 'seconds', file1Id),
      usageRecord(userId, 'transcription_seconds', 3612, 'seconds', file2Id),
      usageRecord(userId, 'storage_bytes', 32400000 + 63200000 + 42000000 + 15700000, 'bytes', null),
      usageRecord(userId, 'ask_ai_question', 45, 'count', null),
    ],
  };
}
