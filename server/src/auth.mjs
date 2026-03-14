import { createHash, randomUUID } from 'node:crypto';
import { readDb } from './db.mjs';
import { fail, writeJson } from './http.mjs';

export function getBearerToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice('Bearer '.length);
}

export async function getAuthenticatedUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  const db = await readDb();
  const session = db.sessions.find((entry) => entry.token === token);
  if (!session) return null;
  return db.users.find((entry) => entry.id === session.userId) ?? null;
}

export async function requireUser(req, res, origin) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    writeJson(res, 401, fail('unauthorized', 'Authentication required'), origin);
    return null;
  }
  return user;
}

export function createSessionToken() {
  return createHash('sha256').update(randomUUID()).digest('hex');
}
