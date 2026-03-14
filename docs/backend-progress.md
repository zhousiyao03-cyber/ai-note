# Backend Implementation Progress

> Auto-updated as implementation proceeds. Other agents: read this before continuing work.

## Current Status

- Phase 1: Complete
- Phase 2: Implemented in code and build-verified
- Phase 3: Not started
- Phase 4: Not started

---

## Phase 1: Foundation (Auth + DB + File/Tag CRUD)

### Supabase Infrastructure

- [x] Install deps: `@supabase/supabase-js`, `@supabase/ssr`, `inngest`
- [x] `app/src/lib/supabase/client.ts`
- [x] `app/src/lib/supabase/server.ts`
- [x] `app/src/lib/supabase/admin.ts`
- [x] `app/src/lib/supabase/middleware.ts`
- [x] `app/src/middleware.ts`

### API Tools

- [x] `app/src/lib/api-helpers.ts`
- [x] `app/src/lib/inngest.ts`
- [x] `app/src/app/api/v1/inngest/route.ts`

### Auth API Routes

- [x] `POST /api/v1/auth/register`
- [x] `POST /api/v1/auth/login`
- [x] `POST /api/v1/auth/logout`
- [x] `POST /api/v1/auth/forgot-password`
- [x] `POST /api/v1/auth/reset-password`
- [x] `POST /api/v1/auth/change-password`

### User API Routes

- [x] `GET/PATCH /api/v1/me`

### File API Routes

- [x] `GET /api/v1/files`
- [x] `GET/PATCH/DELETE /api/v1/files/[fileId]`
- [x] `POST /api/v1/files/[fileId]/restore`
- [x] `DELETE /api/v1/files/[fileId]/permanent`
- [x] `GET /api/v1/trash/files`

### Tag API Routes

- [x] `GET/POST /api/v1/tags`
- [x] `DELETE /api/v1/tags/[tagId]`
- [x] `POST/DELETE /api/v1/files/[fileId]/tags/[tagId]`

### Frontend Integration

- [x] Update `app/src/services/api.ts` from mock calls to real `fetch('/api/v1/...')`
- [x] Update `app/src/lib/auth.ts`
- [x] Update `app/src/hooks/use-auth.ts`
- [x] Update `app/src/components/route-guard.tsx`
- [x] Update `app/src/components/user-menu.tsx`
- [x] Update `app/src/modules/settings/profile-section.tsx`
- [x] Update `app/src/modules/settings/billing-section.tsx`
- [x] Update `app/src/types/index.ts`
- [ ] ~~Update `app/src/components/providers.tsx`~~ not needed; Supabase client is created on demand

### Cleanup

- [ ] Delete `app/src/services/mock-data.ts`
- [ ] Delete `server/` directory

### DB Migration

- [x] `supabase/migrations/001_initial_schema.sql`

### Verification

- [x] `next build` passes

### Environment Setup

- [x] `app/.env.local.example` created

---

## Phase 2: Storage + Upload + Transcription Worker

### Implemented

- [x] `POST /api/v1/files/upload-init`
- [x] `POST /api/v1/files/upload-complete`
- [x] `GET /api/v1/files/[fileId]/status`
- [x] `POST /api/v1/files/[fileId]/transcribe`
- [x] `GET/PATCH /api/v1/files/[fileId]/transcription`
- [x] `app/src/lib/inngest/functions/transcribe.ts`
- [x] Register transcribe function in `app/src/app/api/v1/inngest/route.ts`
- [x] Add `app/src/lib/audio-storage.ts` for signed upload/download URLs
- [x] Update `app/src/services/api.ts` upload flow to fail fast when direct storage PUT fails
- [x] Refresh signed download URL in `GET /api/v1/files/[fileId]` so private bucket audio can still play in detail view
- [x] Use admin storage client for permanent delete
- [x] `next build` passes

### Phase 2 Notes

- Upload flow is now wired end-to-end: `upload-init -> direct PUT -> upload-complete`
- `upload-complete` verifies the uploaded object before queueing transcription
- Auto-transcription is driven by `user_preferences.auto_transcribe`
- Inngest worker follows the planned 4-step shape:
  1. update status
  2. get signed audio URL
  3. call STT provider
  4. store transcript and usage
- If `OPENAI_API_KEY` is set, the worker calls OpenAI transcription via native `fetch`
- If `OPENAI_API_KEY` is missing, the worker writes a mock transcript so local/dev upload flows still work
- Speaker diarization is currently normalized to a single speaker
- Manual transcription quota enforcement is still not implemented
- The backend manual transcribe endpoint exists, but the current UI still does not expose a trigger button

### Required Before Real End-to-End Testing

- [ ] Create Supabase Storage bucket `audio-files`
- [ ] Add storage policies for authenticated users to upload/read their own `{user_id}/...` objects
- [ ] Configure `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Configure `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Configure `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Configure `OPENAI_API_KEY` if real STT is desired
- [ ] Point Inngest dev/prod to `/api/v1/inngest`

---

## Phase 3: Ask AI + Preferences

- [ ] `GET/PATCH /api/v1/me/preferences`
- [ ] `GET/POST/DELETE /api/v1/files/[fileId]/ask-ai/messages`
- [ ] Update `api.ts` + hooks + store
- [ ] `next build` passes

## Phase 4: Billing (Stripe)

- [ ] `GET /api/v1/billing/plans`
- [ ] `GET /api/v1/billing/subscription`
- [ ] `GET /api/v1/billing/usage`
- [ ] `POST /api/v1/billing/checkout-session`
- [ ] `POST /api/v1/billing/customer-portal`
- [ ] `POST /api/v1/billing/webhooks/stripe`
- [ ] Update `api.ts`
- [ ] Install `stripe` dependency
- [ ] `next build` passes

---

## Architecture Reference

### Stack

- Frontend: Next.js 16 App Router, React 19, TanStack Query v5, Zustand, Tailwind v4
- Backend: Next.js Route Handlers
- Auth: Supabase Auth via `@supabase/ssr`
- DB: Supabase PostgreSQL with RLS
- Storage: Supabase Storage bucket `audio-files`
- Background jobs: Inngest

### Key Patterns

- Auth in routes: `const { user, supabase } = await requireAuth()`
- Response format: `{ data, meta, error }`
- DTO transform: DB snake_case -> frontend camelCase via `toCamelCase()` / `transformRows()`
- Next.js 16 route params are promises and must be awaited

### File Structure

```text
app/src/
  app/api/v1/
    auth/
    files/
    me/
    tags/
    trash/
    inngest/
  lib/
    supabase/
    api-helpers.ts
    audio-storage.ts
    inngest.ts
    inngest/functions/transcribe.ts
  services/api.ts
  middleware.ts

supabase/migrations/
  001_initial_schema.sql
```

### Environment Variables

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```
