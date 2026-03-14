# Productization Workstreams

This folder splits the current frontend prototype into four delivery tracks that can be assigned in parallel.

## Files

- `api-spec.md`: REST API contract for auth, files, transcription, Ask AI, tags, and billing.
- `schema.sql`: PostgreSQL schema for the MVP, including indexes and core constraints.
- `backend-architecture.md`: service boundaries, async pipeline, storage choices, and rollout order.
- `frontend-integration.md`: exact frontend replacement plan for the current mock API and local-only state.

## Suggested team split

- Track A: API and auth
- Track B: file pipeline and transcription jobs
- Track C: billing and usage
- Track D: frontend integration and QA

## Current product scope

The current app is a frontend prototype for:

- user authentication
- audio upload and file management
- transcription detail view with editing
- Ask AI chat against a transcript
- trash and tag management
- billing/settings UI

The existing implementation is mock-driven, so these docs define the backend needed to make it production-capable.
