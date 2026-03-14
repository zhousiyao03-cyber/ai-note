# Backend Implementation Progress

> Auto-updated as implementation proceeds. Other agents: read this before continuing work.

## Current Status: Phase 1 — Complete ✓ | Phase 2 — Not Started

---

## Phase 1: Foundation (Auth + DB + File/Tag CRUD) ✓

### Supabase Infrastructure ✓
- [x] Install deps: `@supabase/supabase-js`, `@supabase/ssr`, `inngest`
- [x] `app/src/lib/supabase/client.ts` — Browser client
- [x] `app/src/lib/supabase/server.ts` — Server client (cookies)
- [x] `app/src/lib/supabase/admin.ts` — Service-role client
- [x] `app/src/lib/supabase/middleware.ts` — `updateSession` helper
- [x] `app/src/middleware.ts` — Next.js middleware (note: Next.js 16 warns about middleware→proxy migration)

### API Tools ✓
- [x] `app/src/lib/api-helpers.ts` — envelope, errorResponse, requireAuth, DTO transform (toCamelCase/toSnakeCase/transformRows)
- [x] `app/src/lib/inngest.ts` — Inngest client
- [x] `app/src/app/api/v1/inngest/route.ts` — Inngest serve endpoint

### Auth API Routes ✓
- [x] `POST /api/v1/auth/register`
- [x] `POST /api/v1/auth/login`
- [x] `POST /api/v1/auth/logout`
- [x] `POST /api/v1/auth/forgot-password`
- [x] `POST /api/v1/auth/reset-password`
- [x] `POST /api/v1/auth/change-password`

### User API Routes ✓
- [x] `GET/PATCH /api/v1/me`

### File API Routes ✓
- [x] `GET /api/v1/files`
- [x] `GET/PATCH/DELETE /api/v1/files/[fileId]`
- [x] `POST /api/v1/files/[fileId]/restore`
- [x] `DELETE /api/v1/files/[fileId]/permanent`
- [x] `GET /api/v1/trash/files`

### Tag API Routes ✓
- [x] `GET/POST /api/v1/tags`
- [x] `DELETE /api/v1/tags/[tagId]`
- [x] `POST/DELETE /api/v1/files/[fileId]/tags/[tagId]`

### Frontend Integration ✓
- [x] Update `app/src/services/api.ts` — mock → real `fetch('/api/v1/...')`
- [x] Update `app/src/lib/auth.ts` — localStorage → Supabase session check
- [x] Update `app/src/hooks/use-auth.ts` — mock → Supabase auth (signIn/signUp/signOut)
- [x] Update `app/src/components/route-guard.tsx` — Supabase session + onAuthStateChange
- [x] Update `app/src/components/user-menu.tsx` — useCurrentUser() instead of mockCurrentUser
- [x] Update `app/src/modules/settings/profile-section.tsx` — useCurrentUser()
- [x] Update `app/src/modules/settings/billing-section.tsx` — useCurrentUser()
- [x] Update `app/src/types/index.ts` — added progress, mimeType, language, errorMessage, storageKey, UserPreferences
- [ ] ~~Update `app/src/components/providers.tsx` — add SupabaseProvider~~ (not needed, Supabase client is created on-demand)

### Cleanup
- [ ] Delete `app/src/services/mock-data.ts` — no longer imported (can delete safely)
- [ ] Delete `server/` directory — replaced by Next.js API routes

### DB Migration ✓
- [x] `supabase/migrations/001_initial_schema.sql` — full schema with RLS + triggers

### Verification ✓
- [x] `pnpm build` passes (all routes compiled, no type errors)

### Environment Setup Required
- [x] `app/.env.local.example` created with all needed vars

---

## Phase 2: Storage + Upload + Transcription Worker — NOT STARTED
- [ ] `POST /api/v1/files/upload-init` — create file record + presigned Storage URL
- [ ] `POST /api/v1/files/upload-complete` — verify upload + trigger Inngest event
- [ ] `GET /api/v1/files/[fileId]/status` — transcription status polling
- [ ] `POST /api/v1/files/[fileId]/transcribe` — manual trigger transcription
- [ ] `GET/PATCH /api/v1/files/[fileId]/transcription` — read/save transcription content
- [ ] `app/src/lib/inngest/functions/transcribe.ts` — 4-step Inngest function
- [ ] Update `api.ts` upload flow (init→PUT→complete is already stubbed, needs backend routes)
- [ ] Install `openai` dependency
- [ ] `pnpm build` passes

### Notes for Phase 2
- `api.ts` already has the upload flow coded (init → direct PUT → complete)
- Need to create Supabase Storage bucket `audio-files` (private) via dashboard
- Inngest function: update-status → get-audio-url → call-stt → store-transcript
- Register transcribe function in inngest route.ts

## Phase 3: Ask AI + Preferences — NOT STARTED
- [ ] `GET/PATCH /api/v1/me/preferences`
- [ ] `GET/POST/DELETE /api/v1/files/[fileId]/ask-ai/messages`
- [ ] Update `api.ts` + hooks + store
- [ ] `pnpm build` passes

## Phase 4: Billing (Stripe) — NOT STARTED
- [ ] `GET /api/v1/billing/plans`
- [ ] `GET /api/v1/billing/subscription`
- [ ] `GET /api/v1/billing/usage`
- [ ] `POST /api/v1/billing/checkout-session`
- [ ] `POST /api/v1/billing/customer-portal`
- [ ] `POST /api/v1/billing/webhooks/stripe`
- [ ] Update `api.ts`
- [ ] Install `stripe` dependency
- [ ] `pnpm build` passes

---

## Architecture Reference (for continuing agents)

### Stack
- **Frontend**: Next.js 16 App Router, React 19, TanStack Query v5, Zustand, Tailwind v4
- **Backend**: Next.js API Route Handlers (Vercel)
- **Auth**: Supabase Auth (cookie-based via @supabase/ssr)
- **DB**: Supabase PostgreSQL with RLS
- **Storage**: Supabase Storage (bucket: `audio-files`)
- **Background jobs**: Inngest (transcription pipeline)

### Key Patterns
- **Auth**: Server-side via `requireAuth()` in api-helpers.ts; client-side via RouteGuard + Supabase onAuthStateChange
- **Response format**: `{ data, meta, error }` envelope via `envelope()` / `errorResponse()`
- **DTO**: snake_case (DB) → camelCase (frontend) in Route Handlers via `toCamelCase()` / `transformRows()`
- **Route params**: Next.js 16 uses `{ params }: { params: Promise<{ id: string }> }` — must await params

### File Structure
```
app/src/
├── app/api/v1/          # API Route Handlers
│   ├── auth/            # register, login, logout, forgot/reset/change-password
│   ├── files/           # CRUD, restore, permanent delete, tags
│   ├── me/              # profile
│   ├── tags/            # tag CRUD
│   ├── trash/           # trash listing
│   └── inngest/         # Inngest webhook
├── lib/
│   ├── supabase/        # client.ts, server.ts, admin.ts, middleware.ts
│   ├── api-helpers.ts   # envelope, errorResponse, requireAuth, DTO transform
│   └── inngest.ts       # Inngest client instance
├── services/api.ts      # Frontend API layer (fetch-based, replaces mock)
└── middleware.ts         # Next.js middleware (session refresh)

supabase/migrations/     # DB migrations
  001_initial_schema.sql # Full schema + RLS + triggers
```

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```
