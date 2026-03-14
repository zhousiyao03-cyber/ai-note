# ai-note MVP API Specification

Base URL: `/api/v1`

Authentication:

- Use bearer access tokens on API calls.
- Use refresh tokens via `POST /auth/refresh`.
- Every resource is scoped to the authenticated user unless explicitly stated otherwise.

Response envelope:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Error envelope:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "validation_error",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Shared enums

### File status

- `pending`
- `transcribing`
- `completed`
- `failed`

### Plan

- `free`
- `pro`
- `enterprise`

### Ask AI role

- `user`
- `assistant`

## Auth

### POST `/auth/register`

Create an account and return session tokens.

Request:

```json
{
  "name": "Demo User",
  "email": "demo@ai-note.app",
  "password": "strong-password"
}
```

Response `201`:

```json
{
  "data": {
    "access_token": "jwt",
    "refresh_token": "opaque-or-jwt",
    "user": {
      "id": "usr_123",
      "name": "Demo User",
      "email": "demo@ai-note.app",
      "avatar_url": null,
      "plan": "free",
      "email_verified": false,
      "created_at": "2026-03-14T10:00:00Z"
    }
  },
  "meta": {},
  "error": null
}
```

### POST `/auth/login`

Request:

```json
{
  "email": "demo@ai-note.app",
  "password": "strong-password"
}
```

Response `200`: same shape as register.

### POST `/auth/refresh`

Request:

```json
{
  "refresh_token": "token"
}
```

Response `200`:

```json
{
  "data": {
    "access_token": "new-jwt",
    "refresh_token": "new-refresh-token"
  },
  "meta": {},
  "error": null
}
```

### POST `/auth/logout`

Invalidate the current refresh token.

### GET `/me`

Return the current user.

### PATCH `/me`

Update user profile.

Request:

```json
{
  "name": "Updated Name",
  "email": "updated@ai-note.app",
  "avatar_url": "https://cdn.example.com/avatar.png"
}
```

### GET `/me/preferences`

Response:

```json
{
  "data": {
    "email_notifications": true,
    "auto_transcribe": true,
    "speaker_detection": true,
    "language": "en",
    "theme": "system"
  },
  "meta": {},
  "error": null
}
```

### PATCH `/me/preferences`

Update preference toggles used by Settings.

### POST `/auth/forgot-password`

Request:

```json
{
  "email": "demo@ai-note.app"
}
```

Always return `202` to avoid account enumeration.

### POST `/auth/reset-password`

Request:

```json
{
  "token": "reset-token",
  "new_password": "new-strong-password"
}
```

### POST `/auth/change-password`

Request:

```json
{
  "old_password": "old-password",
  "new_password": "new-password"
}
```

## Files

### GET `/files`

List user files with filters used by the current UI.

Query params:

- `search`
- `status`
- `sort_by` in `created_at | name | duration_sec | size_bytes`
- `sort_order` in `asc | desc`
- `limit`
- `cursor`
- `tag_ids` as repeated query params or comma-separated string

Response `200`:

```json
{
  "data": [
    {
      "id": "fil_123",
      "name": "Team Standup Meeting.wav",
      "duration_sec": 1847,
      "size_bytes": 32400000,
      "mime_type": "audio/wav",
      "language": "en",
      "status": "completed",
      "progress": 100,
      "audio_url": "https://signed.example.com/file.wav",
      "created_at": "2026-03-10T09:00:00Z",
      "updated_at": "2026-03-10T09:31:00Z",
      "deleted_at": null,
      "tags": [
        { "id": "tag_1", "name": "Meeting", "color": "#3b82f6" }
      ]
    }
  ],
  "meta": {
    "next_cursor": "opaque-cursor",
    "has_more": true,
    "total": 42
  },
  "error": null
}
```

### POST `/files/upload-init`

Create a file record and return object-storage upload details.

Request:

```json
{
  "filename": "meeting.wav",
  "size_bytes": 32400000,
  "mime_type": "audio/wav"
}
```

Response `201`:

```json
{
  "data": {
    "file_id": "fil_123",
    "upload": {
      "method": "PUT",
      "url": "https://storage.example.com/presigned-url",
      "headers": {
        "Content-Type": "audio/wav"
      }
    }
  },
  "meta": {},
  "error": null
}
```

### POST `/files/upload-complete`

Mark upload complete and optionally trigger auto-transcription.

Request:

```json
{
  "file_id": "fil_123"
}
```

Response includes the updated file record.

### GET `/files/{fileId}`

Return a single file.

### PATCH `/files/{fileId}`

Current frontend only needs rename.

Request:

```json
{
  "name": "Renamed Meeting.wav"
}
```

### DELETE `/files/{fileId}`

Soft-delete file and move it to trash.

### POST `/files/{fileId}/restore`

Restore soft-deleted file.

### DELETE `/files/{fileId}/permanent`

Hard-delete file, transcript, AI messages, and storage object if retention policy allows.

### GET `/trash/files`

List trashed files.

## Tags

### GET `/tags`

List user-created tags.

### POST `/tags`

Request:

```json
{
  "name": "Meeting",
  "color": "#3b82f6"
}
```

### DELETE `/tags/{tagId}`

Delete a tag and detach it from files owned by the user.

### POST `/files/{fileId}/tags/{tagId}`

Attach a tag to a file.

### DELETE `/files/{fileId}/tags/{tagId}`

Detach a tag from a file.

## Transcription

### POST `/files/{fileId}/transcribe`

Queue a transcription job.

Request:

```json
{
  "language": "auto",
  "speaker_detection": true
}
```

### GET `/files/{fileId}/status`

Used by the polling hook.

Response:

```json
{
  "data": {
    "file_id": "fil_123",
    "status": "transcribing",
    "progress": 64,
    "error_message": null
  },
  "meta": {},
  "error": null
}
```

### GET `/files/{fileId}/transcription`

Response:

```json
{
  "data": {
    "id": "trn_123",
    "file_id": "fil_123",
    "content_html": "<p>Hello world</p>",
    "summary": "Short summary",
    "language": "en",
    "created_at": "2026-03-10T09:32:00Z",
    "updated_at": "2026-03-10T09:40:00Z",
    "speakers": [
      { "id": "spk_1", "name": "Speaker 1", "color": "#3b82f6" }
    ],
    "segments": [
      {
        "id": "seg_1",
        "speaker_id": "spk_1",
        "start_time": 0,
        "end_time": 4.2,
        "text": "Hello world",
        "sequence": 1
      }
    ]
  },
  "meta": {},
  "error": null
}
```

### PATCH `/files/{fileId}/transcription`

Persist edited transcript content.

Request:

```json
{
  "content_html": "<p>Updated content</p>"
}
```

Response returns the updated transcription.

## Ask AI

### GET `/files/{fileId}/ask-ai/messages`

Return the chat history for a file.

### POST `/files/{fileId}/ask-ai/messages`

Store the user message, run the assistant workflow, then return both messages.

Request:

```json
{
  "content": "Summarize action items."
}
```

Response:

```json
{
  "data": {
    "user_message": {
      "id": "msg_user_1",
      "role": "user",
      "content": "Summarize action items.",
      "created_at": "2026-03-14T10:00:00Z"
    },
    "assistant_message": {
      "id": "msg_ai_1",
      "role": "assistant",
      "content": "The action items are ...",
      "created_at": "2026-03-14T10:00:02Z"
    }
  },
  "meta": {
    "remaining_questions": 42
  },
  "error": null
}
```

### DELETE `/files/{fileId}/ask-ai/messages`

Clear the file-scoped conversation if the product keeps this feature.

## Billing

### GET `/billing/plans`

Return plan definitions shown in Settings.

### GET `/billing/subscription`

Response:

```json
{
  "data": {
    "plan": "pro",
    "status": "active",
    "current_period_end": "2026-04-01T00:00:00Z",
    "cancel_at_period_end": false
  },
  "meta": {},
  "error": null
}
```

### GET `/billing/usage`

Response:

```json
{
  "data": {
    "transcription_hours_used": 12.5,
    "transcription_hours_limit": 50,
    "storage_used_gb": 3.2,
    "storage_limit_gb": 50,
    "ai_questions_used": 45,
    "ai_questions_limit": -1
  },
  "meta": {},
  "error": null
}
```

### POST `/billing/checkout-session`

Request:

```json
{
  "plan": "pro",
  "success_url": "https://app.example.com/settings?billing=success",
  "cancel_url": "https://app.example.com/settings?billing=cancel"
}
```

Response:

```json
{
  "data": {
    "checkout_url": "https://checkout.stripe.com/..."
  },
  "meta": {},
  "error": null
}
```

### POST `/billing/customer-portal`

Return a Stripe customer portal URL.

### POST `/billing/webhooks/stripe`

Internal webhook endpoint. Must validate Stripe signature and update subscription state.

## Suggested status codes

- `200` for successful reads and updates
- `201` for creates
- `202` for accepted async work
- `204` for deletes with no body
- `400` for validation errors
- `401` for missing or expired auth
- `403` for ownership or plan violations
- `404` for missing resources
- `409` for state conflicts
- `429` for plan limits and rate limits
