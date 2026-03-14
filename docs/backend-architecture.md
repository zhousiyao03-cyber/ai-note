# Plaud MVP Backend Architecture

## Goal

Turn the current mock-driven frontend into a production-capable application without forcing a major UI rewrite.

## Recommended backend slices

### 1. API application

Responsibilities:

- auth and session management
- user profile and preferences
- file CRUD and trash operations
- tag CRUD
- transcript read and edit endpoints
- Ask AI message endpoints
- billing endpoints and webhook receiver

Good fit:

- NestJS, FastAPI, or Express with strong validation

### 2. Object storage

Responsibilities:

- store uploaded source audio
- return signed read URLs for playback
- support direct browser upload with presigned URLs

Good fit:

- S3
- Cloudflare R2
- Aliyun OSS

### 3. Background worker

Responsibilities:

- consume transcription jobs
- call the speech-to-text provider
- persist transcript, summary, speakers, and segments
- update file progress and terminal status
- record usage
- optionally send completion email

Good fit:

- BullMQ worker
- Celery worker
- SQS consumer

### 4. Billing integration

Responsibilities:

- create checkout sessions
- keep local subscription state in sync
- update plan and quota data after webhook events

Good fit:

- Stripe Checkout + Customer Portal + Webhooks

## Request flow

### Upload and transcription

1. Frontend calls `POST /files/upload-init`
2. API creates a `files` row with `status=pending`
3. API returns presigned upload info
4. Browser uploads directly to object storage
5. Frontend calls `POST /files/upload-complete`
6. API validates object exists and populates metadata if available
7. If `auto_transcribe=true`, API enqueues transcription job
8. Worker sets file `status=transcribing` and updates `progress`
9. Worker stores transcript output and sets file `status=completed`
10. Frontend reads details via `GET /files/{id}` and `GET /files/{id}/transcription`

### Ask AI

1. Frontend posts user message
2. API verifies ownership and remaining quota
3. API loads transcript and recent chat history
4. LLM workflow generates answer
5. API stores both user and assistant messages
6. API increments monthly usage

### Billing

1. Frontend requests checkout session
2. API creates Stripe checkout session
3. User completes payment on Stripe
4. Stripe webhook updates local subscription record
5. API updates `users.plan`
6. Frontend reads billing and usage from local API only

## Service boundaries

Keep the first version as one deployable API plus one worker process.

- API app
- Worker app
- Postgres
- Object storage
- Redis or queue broker

Do not split into microservices yet. The product is too small to benefit from that complexity.

## External provider choices

### Speech-to-text

Three pragmatic options:

- OpenAI audio transcription if you want a unified vendor stack
- Deepgram if streaming and diarization matter
- AssemblyAI if you want richer transcript metadata

Normalize provider output into your own `transcriptions`, `speakers`, and `transcription_segments` tables.

### LLM for Ask AI

Use a server-side prompt that takes:

- transcript summary
- transcript segments
- recent chat history
- user question

Do not let the browser call the model vendor directly.

## Security rules

- Every file, transcript, tag, and message query must verify ownership.
- Store passwords using Argon2 or bcrypt with a modern work factor.
- Prefer httpOnly refresh token cookies even if access token remains bearer-based.
- Signed audio URLs should expire quickly.
- Rate limit auth endpoints and Ask AI endpoints.
- Validate upload MIME type and extension, but trust server-side inspection over client declarations.

## Quota model

Track quota in `usage_records` and derive monthly totals.

- transcription: sum seconds or minutes of completed files
- storage: current sum of non-deleted file sizes
- Ask AI: increment per successful assistant response

Enforce quota at these points:

- before upload if storage is exceeded
- before enqueuing transcription if transcription quota is exceeded
- before Ask AI completion if question quota is exceeded

## Rollout order

### Phase 1

- auth
- files list/detail/trash
- upload-init and upload-complete
- direct object storage upload

### Phase 2

- transcription worker
- status polling
- transcript read and save

### Phase 3

- Ask AI persistence and quota enforcement
- preferences and notification hooks

### Phase 4

- Stripe billing
- plan-based gating
- customer portal

## Deployment minimum

- API service
- worker service
- Postgres
- Redis
- object storage bucket
- secret manager for tokens and provider keys
- error monitoring

## Operational checks

Add these on day one:

- structured logs with request IDs
- worker job retry tracking
- dead-letter handling for failed transcription jobs
- metrics for upload success, transcription latency, and Ask AI latency
- alerting for webhook failures and queue backlog growth
