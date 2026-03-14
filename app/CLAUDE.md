# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Next.js dev server with Turbopack
pnpm build        # TypeScript type-check + Next.js production build
pnpm lint         # ESLint across the project
pnpm start        # Start production server
```

No test framework is configured.

## Architecture

Audio file management app with transcription, AI chat, user auth, and billing. Next.js 16 App Router + React 19 + TypeScript + Supabase + Inngest.

### Backend

API Route Handlers in `src/app/api/v1/`:
- `auth/` — register, login, logout, forgot/reset/change-password (Supabase Auth)
- `files/` — CRUD, restore, permanent delete, upload-init/complete, status, transcription, tags
- `me/` — profile CRUD, preferences
- `tags/` — tag CRUD
- `trash/` — trash listing
- `inngest/` — Inngest webhook endpoint
- `billing/` — plans, subscription, usage, checkout, webhooks (Phase 4)

Response envelope: `{ data, meta, error }` via helpers in `src/lib/api-helpers.ts`.
Auth in routes: `const { user, supabase } = await requireAuth()`.
DTO: DB snake_case → frontend camelCase via `toCamelCase()` / `transformRows()`.

### Supabase

- `src/lib/supabase/client.ts` — Browser client (createBrowserClient)
- `src/lib/supabase/server.ts` — Server client with cookies (createServerClient)
- `src/lib/supabase/admin.ts` — Service-role client (bypass RLS)
- `src/lib/supabase/middleware.ts` — Session refresh helper
- `src/middleware.ts` — Next.js middleware for session + route protection

DB schema in `supabase/migrations/001_initial_schema.sql`. All tables have RLS enabled.

### Routing

Next.js App Router:
- `/` → `FilesPage` (file listing) — protected
- `/detail/[id]` → `DetailPage` (transcription viewer + audio player) — protected
- `/trash` → `TrashPage` (soft-deleted files) — protected
- `/settings` → `SettingsPage` (profile, preferences, billing, account) — protected
- `/login`, `/register`, `/forgot-password` → Auth pages — public

Protected routes wrapped in `RouteGuard` → `Layout` (three-column: AppSidebar | Main + MobileNav | AskAIPanel).

### State Management

- **Server state**: TanStack React Query v5 — hooks in `src/hooks/use-queries.ts`
- **UI state**: Zustand store in `src/stores/app-store.ts`
- **Auth**: Supabase Auth via `src/hooks/use-auth.ts` (`useLogin`, `useRegister`, `useLogout`, `useCurrentUser`), cookie-based sessions
- Query client configured in `providers.tsx` with 60s staleTime, 1 retry

### Data Layer

API client in `src/services/api.ts` — all calls use `fetch('/api/v1/...')` with JSON envelope parsing.
Types in `src/types/index.ts` (`AudioFile`, `Transcription`, `AskAIMessage`, `User`, `Tag`, `Speaker`, `TranscriptionSegment`, `UploadProgress`, `PaginatedResponse<T>`, `Plan`, `Subscription`, `AuthResponse`, `UserPreferences`).

### Module Structure

Feature modules in `src/modules/`:
- `files/` — file list, search/filter/sort, upload dialog, inline rename
- `detail/` — transcription editor (Tiptap), audio player (WaveSurfer), speaker timeline, export menu
- `ask-ai/` — sliding chat panel
- `trash/` — deleted files list with restore/permanent delete
- `auth/` — login, register, forgot password pages
- `settings/` — profile, preferences, billing, account tabs

Shared UI in `src/components/` — `app-sidebar`, `mobile-nav`, `user-menu`, `theme-toggle`, `language-switcher`, `route-guard`, `shortcuts-help-dialog`, and `ui/` (shadcn components).

### Key Libraries

- **Backend**: @supabase/supabase-js, @supabase/ssr, inngest
- **Audio**: wavesurfer.js (waveform visualization + playback)
- **Editor**: @tiptap/react + starter-kit + placeholder + highlight
- **Export**: file-saver, jspdf, docx
- **i18n**: i18next + react-i18next + browser language detector
- **Forms**: react-hook-form + zod + @hookform/resolvers
- **Payments**: @stripe/stripe-js + @stripe/react-stripe-js

### Styling

Tailwind CSS v4 via `@tailwindcss/postcss` plugin. Theme uses OKLch CSS variables with light/dark mode (`.dark` class toggle via `src/hooks/use-theme.ts`). Utility `cn()` in `src/lib/utils.ts`. Font: Geist Variable. Responsive with mobile bottom nav at `md:` breakpoint.

### i18n

Translations in `src/locales/en.json` and `src/locales/zh.json`. Initialized in `src/lib/i18n.ts`. Use `useTranslation()` hook with `t('key.path')`.

### Path Alias

`@/` maps to `./src/` (configured in tsconfig).

### shadcn/ui

Configured via `components.json`. Add components with `pnpm dlx shadcn@latest add <component>`.

### Implementation Progress

See `docs/backend-progress.md` for current implementation status and notes for continuing agents.
