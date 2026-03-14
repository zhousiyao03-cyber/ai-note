import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSeedDb } from './seed.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../data');
const uploadsDir = path.join(dataDir, 'uploads');
const dbPath = path.join(dataDir, 'db.json');

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDataStore() {
  await mkdir(uploadsDir, { recursive: true });
  const hasDb = await exists(dbPath);
  if (!hasDb) {
    const seed = createSeedDb();
    await writeFile(dbPath, JSON.stringify(seed, null, 2), 'utf8');
  }
}

export async function readDb() {
  await ensureDataStore();
  const raw = await readFile(dbPath, 'utf8');
  return JSON.parse(raw);
}

export async function writeDb(db) {
  await writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

export async function updateDb(mutator) {
  const db = await readDb();
  const result = await mutator(db);
  await writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
  return result;
}

export function getUploadsDir() {
  return uploadsDir;
}
