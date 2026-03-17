# Plaud Desktop Progress

> This file tracks delivery progress for the desktop client so we can keep planning and execution in one place.

## Current module

- Module: Phase 0 foundation
- Goal: create a real `desktop/` scaffold that can evolve into the Plaud native client
- Status: Auth, protected routes, files, detail, and upload path are connected to the current backend

## Checklist

- [x] Create `desktop/` with Tauri 2 + React + TypeScript scaffold
- [x] Replace Tauri demo with Plaud-oriented shell
- [x] Add route skeleton for login, files, and settings
- [x] Add TanStack Query provider
- [x] Add basic i18n bootstrap
- [x] Add minimal API client for `/api/v1/me`
- [x] Extract shared types into `packages/shared-types`
- [x] Connect desktop files screen to real `/api/v1/files`
- [x] Add desktop file detail route backed by real `/api/v1/files/:id`
- [x] Wire desktop upload flow to existing upload endpoints
- [x] Add desktop login flow and protected routes backed by `/api/v1/auth/*` and `/api/v1/me`
- [x] Add upload-complete desktop notification hook
- [x] Document current desktop session strategy
- [x] Replace browser upload trigger with Tauri native file dialog when available
- [x] Install desktop dependencies
- [x] Verify `pnpm build`
- [ ] Verify `pnpm tauri:dev` once Rust toolchain is available

## Notes

- The desktop shell is intentionally focused on structure, not feature completeness.
- For local development, `desktop` uses a Vite proxy so `/api/*` can point at the existing web backend.
- A real desktop auth strategy still needs to be implemented before MVP workflows are considered complete.
- Tauri runtime verification is currently blocked by the local environment missing the Rust toolchain.
- `app/src/types/index.ts` now re-exports from `packages/shared-types`, so desktop and web can keep converging without duplicating model definitions.
- The desktop files screen now reads the real file list from the backend and renders core metadata and status.
- Desktop now supports browser-based local file selection inside the Tauri shell; native Tauri file dialogs are a later enhancement.
- Desktop auth now uses backend cookies and `/api/v1/me` as the source of truth instead of storing tokens in app state.
- Session notes are documented in `docs/desktop-session-strategy.md`.
- Native file picker support now uses Tauri dialog and fs plugins, with browser input kept as a development fallback.

## Next recommended module

- Improve authenticated startup recovery across app restarts
- Add desktop transcription polling refinements and upload retry behavior
- Add system-level completion notifications after real Tauri runtime verification
