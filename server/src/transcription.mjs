import { randomUUID } from 'node:crypto';
import { readDb, updateDb } from './db.mjs';
import { makeGeneratedTranscript, now } from './domain.mjs';

const transcriptionTimers = new Map();

export function enqueueTranscription(fileId) {
  if (transcriptionTimers.has(fileId)) return;

  const timer = setInterval(async () => {
    const shouldStop = await updateDb(async (db) => {
      const file = db.files.find((entry) => entry.id === fileId);
      if (!file || file.deletedAt) return true;
      if (file.status === 'pending') {
        file.status = 'transcribing';
        file.progress = 12;
        file.updatedAt = now();
        return false;
      }
      if (file.status !== 'transcribing') return true;

      file.progress = Math.min(100, file.progress + 22);
      file.updatedAt = now();

      if (file.progress < 100) return false;

      file.status = 'completed';
      file.progress = 100;
      file.language = file.language ?? 'en';
      file.updatedAt = now();

      if (!db.transcriptions.find((entry) => entry.fileId === file.id)) {
        const generated = makeGeneratedTranscript(file.name);
        db.transcriptions.push({
          id: generated.id,
          fileId: file.id,
          contentHtml: generated.contentHtml,
          summary: generated.summary,
          language: generated.language,
          createdAt: now(),
          updatedAt: now(),
          speakers: generated.speakers,
          segments: generated.segments,
        });
      }

      db.usageRecords.push({
        id: randomUUID(),
        userId: file.userId,
        fileId: file.id,
        type: 'transcription_seconds',
        amount: file.durationSec ?? 0,
        unit: 'seconds',
        createdAt: now(),
      });

      return true;
    });

    if (shouldStop) {
      clearInterval(timer);
      transcriptionTimers.delete(fileId);
    }
  }, 1200);

  transcriptionTimers.set(fileId, timer);
}

export async function bootstrapJobs() {
  const db = await readDb();
  db.files
    .filter((file) => !file.deletedAt && (file.status === 'pending' || file.status === 'transcribing'))
    .forEach((file) => enqueueTranscription(file.id));
}
