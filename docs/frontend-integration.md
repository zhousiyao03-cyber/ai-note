# Frontend Integration Plan

This document maps the current frontend prototype to the backend contract defined in `api-spec.md`.

## Replace the mock API layer

Current file:

- `app/src/services/api.ts`

Action:

- replace the in-memory mock object with a typed HTTP client
- centralize base URL, auth header injection, 401 handling, and error normalization
- keep method names stable where possible to reduce component churn

Recommended client surface:

- `authApi`
- `filesApi`
- `transcriptionApi`
- `askAiApi`
- `tagsApi`
- `billingApi`
- `userApi`

## Auth flow changes

Current files:

- `app/src/lib/auth.ts`
- `app/src/hooks/use-auth.ts`
- `app/src/components/route-guard.tsx`
- `app/src/modules/auth/*.tsx`

Required changes:

- do not treat local storage token presence as proof of authentication
- bootstrap app auth state with `GET /me`
- add refresh-token handling
- wire forgot-password and change-password pages to real endpoints
- surface field-level validation errors from backend responses

Recommended behavior:

- on app load, attempt `GET /me`
- if `401`, try refresh once
- if refresh fails, clear session and route to `/login`

## File list and detail changes

Current files:

- `app/src/hooks/use-queries.ts`
- `app/src/modules/files/use-infinite-files.ts`
- `app/src/modules/files/file-list.tsx`
- `app/src/modules/detail/index.tsx`
- `app/src/modules/files/inline-rename.tsx`
- `app/src/modules/trash/trash-list.tsx`

Required changes:

- align file field names with backend responses
- switch pagination to cursor-based if adopted by API
- make delete/restore/permanent-delete call live endpoints
- ensure file detail reads real `audio_url`
- expose backend `error_message` when file status is `failed`

Suggested file DTO shape in frontend:

```ts
type FileDto = {
  id: string
  name: string
  duration_sec: number | null
  size_bytes: number
  mime_type: string | null
  language: string | null
  status: 'pending' | 'transcribing' | 'completed' | 'failed'
  progress: number
  audio_url: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  error_message: string | null
  tags: Array<{ id: string; name: string; color: string }>
}
```

## Upload flow changes

Current files:

- `app/src/modules/files/use-file-upload.ts`
- `app/src/modules/files/upload-dialog.tsx`

Required changes:

- remove fake progress based on timeouts
- call `POST /files/upload-init`
- upload file binary to returned storage URL
- call `POST /files/upload-complete`
- optionally call `POST /files/{id}/transcribe` if auto-transcribe is disabled in backend

Progress UX guidance:

- show browser upload progress during storage upload
- after upload hits 100, switch status label to `processing`
- use file status polling for backend-side transcription progress

## Transcription changes

Current files:

- `app/src/hooks/use-transcription-polling.ts`
- `app/src/modules/detail/use-transcription-editor.ts`
- `app/src/modules/detail/transcription-editor.tsx`
- `app/src/modules/detail/speaker-timeline.tsx`

Required changes:

- poll `GET /files/{id}/status` while status is `pending` or `transcribing`
- fetch transcript from `GET /files/{id}/transcription`
- save edits through `PATCH /files/{id}/transcription`
- keep segments and speakers server-authored; do not try to derive them client-side

Nice-to-have later:

- use SSE or websocket instead of polling

## Ask AI changes

Current files:

- `app/src/modules/ask-ai/index.tsx`
- `app/src/stores/app-store.ts`

Required changes:

- load chat history from `GET /files/{id}/ask-ai/messages`
- persist messages through `POST /files/{id}/ask-ai/messages`
- keep optimistic local rendering, but reconcile with server response
- stop treating Zustand as the source of truth for message history

Suggested store role after backend integration:

- panel open/close state
- draft input
- temporary optimistic messages

Not source of truth:

- full historical message list

## Tags changes

Current files:

- `app/src/modules/files/tag-manager.tsx`
- `app/src/modules/files/tag-filter.tsx`

Required changes:

- keep tag CRUD backed by API
- add attach/detach endpoints to file row actions or detail page if desired
- ensure tag filtering sends stable tag IDs to the backend

## Billing changes

Current files:

- `app/src/lib/stripe.ts`
- `app/src/modules/settings/billing-section.tsx`
- `app/src/modules/settings/checkout-dialog.tsx`

Required changes:

- remove mock card form from the app
- create checkout session on backend and redirect to Stripe-hosted checkout
- read subscription and usage from `/billing/subscription` and `/billing/usage`
- add customer portal launch button when subscription exists

Important:

- do not collect raw card details in your own form unless you fully implement Stripe Elements and PCI handling

## Settings changes

Current files:

- `app/src/modules/settings/profile-section.tsx`
- `app/src/modules/settings/preferences-section.tsx`
- `app/src/modules/settings/account-section.tsx`

Required changes:

- read profile from `/me`
- save profile with `PATCH /me`
- read and save preferences from `/me/preferences`
- wire password change to `POST /auth/change-password`
- add account deletion endpoint later if that feature stays in scope

## Query key cleanup

Suggested query keys after backend integration:

- `['me']`
- `['preferences']`
- `['files', filters]`
- `['file', fileId]`
- `['file-status', fileId]`
- `['transcription', fileId]`
- `['ask-ai-messages', fileId]`
- `['tags']`
- `['billing-subscription']`
- `['billing-usage']`

## API error handling

Frontend should handle these cases explicitly:

- `401`: session expired, attempt refresh then redirect to login
- `403`: quota exceeded or ownership denied
- `404`: file deleted or no longer available
- `409`: invalid file state transition
- `429`: Ask AI or upload rate limit hit

## Recommended implementation order

1. Real auth bootstrap and route guard
2. File list/detail CRUD against live API
3. Direct upload flow
4. Transcription polling and editor save
5. Ask AI persistence
6. Billing
