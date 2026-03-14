import { randomUUID } from 'node:crypto';

export const API_PREFIX = '/api/v1';

export const billingPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: ['5 hours/month', '10 AI questions/month', '1 GB storage'],
    limits: { uploadMinutes: 300, aiQuestions: 10, storage: 1 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    interval: 'month',
    features: ['50 hours/month', 'Unlimited AI questions', '50 GB storage', 'Priority processing'],
    limits: { uploadMinutes: 3000, aiQuestions: -1, storage: 50 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    interval: 'month',
    features: ['Unlimited hours', 'Unlimited AI questions', '500 GB storage', 'Priority processing', 'Team management', 'API access'],
    limits: { uploadMinutes: -1, aiQuestions: -1, storage: 500 },
  },
];

export function now() {
  return new Date().toISOString();
}

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    plan: user.plan,
    createdAt: user.createdAt,
  };
}

export function toPreferencesDto(preferences) {
  return {
    email_notifications: preferences.emailNotifications,
    auto_transcribe: preferences.autoTranscribe,
    speaker_detection: preferences.speakerDetection,
    language: preferences.language,
    theme: preferences.theme,
  };
}

export function toFileDto(file, db) {
  const tags = db.tags.filter((tag) => file.tagIds.includes(tag.id));
  return {
    id: file.id,
    name: file.name,
    duration_sec: file.durationSec,
    size_bytes: file.sizeBytes,
    mime_type: file.mimeType,
    language: file.language,
    status: file.status,
    progress: file.progress,
    audio_url: file.audioPath ? `${API_PREFIX}/files/${file.id}/audio` : null,
    error_message: file.errorMessage,
    created_at: file.createdAt,
    updated_at: file.updatedAt,
    deleted_at: file.deletedAt,
    tags: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
    })),
  };
}

export function toTranscriptionDto(transcription) {
  return {
    id: transcription.id,
    file_id: transcription.fileId,
    content_html: transcription.contentHtml,
    summary: transcription.summary,
    language: transcription.language,
    created_at: transcription.createdAt,
    updated_at: transcription.updatedAt,
    speakers: transcription.speakers,
    segments: transcription.segments.map((segment, index) => ({
      id: segment.id,
      speaker_id: segment.speakerId,
      start_time: segment.startTime,
      end_time: segment.endTime,
      text: segment.text,
      sequence: index + 1,
    })),
  };
}

export function sortFiles(files, sortBy, sortOrder) {
  const direction = sortOrder === 'asc' ? 1 : -1;
  const readValue = {
    createdAt: (file) => file.createdAt,
    name: (file) => file.name.toLowerCase(),
    duration: (file) => file.durationSec ?? 0,
    size: (file) => file.sizeBytes ?? 0,
  }[sortBy] ?? ((file) => file.createdAt);

  return [...files].sort((left, right) => {
    const a = readValue(left);
    const b = readValue(right);
    if (a < b) return -1 * direction;
    if (a > b) return 1 * direction;
    return 0;
  });
}

export function getUsageSummary(db, userId) {
  const today = new Date();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)).toISOString();
  const records = db.usageRecords.filter((entry) => entry.userId === userId && entry.createdAt >= monthStart);
  const user = db.users.find((entry) => entry.id === userId);
  const plan = billingPlans.find((entry) => entry.id === (user?.plan ?? 'free')) ?? billingPlans[0];
  const transcriptionSeconds = records
    .filter((entry) => entry.type === 'transcription_seconds')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const aiQuestions = records
    .filter((entry) => entry.type === 'ask_ai_question')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const storageBytes = db.files
    .filter((entry) => entry.userId === userId && !entry.deletedAt)
    .reduce((sum, entry) => sum + entry.sizeBytes, 0);

  return {
    transcription_hours_used: Number((transcriptionSeconds / 3600).toFixed(1)),
    transcription_hours_limit: plan.limits.uploadMinutes < 0 ? -1 : Number((plan.limits.uploadMinutes / 60).toFixed(1)),
    storage_used_gb: Number((storageBytes / (1024 * 1024 * 1024)).toFixed(1)),
    storage_limit_gb: plan.limits.storage,
    ai_questions_used: aiQuestions,
    ai_questions_limit: plan.limits.aiQuestions,
  };
}

export function makeGeneratedTranscript(fileName) {
  const title = fileName.replace(/\.[^.]+$/, '');
  const speaker1 = randomUUID();
  const speaker2 = randomUUID();
  return {
    id: randomUUID(),
    summary: `${title} was processed successfully. This is a development transcript generated from the uploaded file.`,
    contentHtml:
      `<p><strong>Speaker 1:</strong> We processed the recording "${title}".</p>` +
      '<p><strong>Speaker 2:</strong> The transcript, summary, and Ask AI features are ready for review.</p>' +
      '<p><strong>Speaker 1:</strong> You can now edit the transcript and export it.</p>',
    language: 'en',
    speakers: [
      { id: speaker1, name: 'Speaker 1', color: '#3b82f6' },
      { id: speaker2, name: 'Speaker 2', color: '#10b981' },
    ],
    segments: [
      { id: randomUUID(), speakerId: speaker1, startTime: 0, endTime: 4, text: `We processed the recording "${title}".` },
      { id: randomUUID(), speakerId: speaker2, startTime: 4, endTime: 9, text: 'The transcript, summary, and Ask AI features are ready for review.' },
      { id: randomUUID(), speakerId: speaker1, startTime: 9, endTime: 13, text: 'You can now edit the transcript and export it.' },
    ],
  };
}

export function makeAskAiReply(question, file, transcription) {
  const summary = transcription?.summary ?? 'Transcript summary is not available yet.';
  return `Based on ${file.name}, here is a development answer.\n\nSummary: ${summary}\n\nQuestion: ${question}\n\nNext step: replace this placeholder with a real server-side LLM workflow.`;
}
