# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Vite dev server with HMR
pnpm build        # TypeScript type-check + Vite production build
pnpm lint         # ESLint across the project
pnpm preview      # Preview production build locally
```

No test framework is configured.

## Architecture

Audio file management app with transcription, AI chat, user auth, and billing. React 19 + TypeScript + Vite 7.

### Routing

React Router v7 (`src/router/index.tsx`):
- `/` → `FilesPage` (file listing) — protected
- `/detail/:id` → `DetailPage` (transcription viewer + audio player) — protected
- `/trash` → `TrashPage` (soft-deleted files) — protected
- `/settings` → `SettingsPage` (profile, preferences, billing, account) — protected
- `/login`, `/register`, `/forgot-password` → Auth pages — public, uses `AuthLayout`

Protected routes wrapped in `RouteGuard` → `Layout` (three-column: AppSidebar | Main + MobileNav | AskAIPanel).

### State Management

- **Server state**: TanStack React Query v5 — hooks in `src/hooks/use-queries.ts` (`useFiles`, `useFile`, `useTranscription`, `useDeleteFile`, `useAskAI`, `useUpdateTranscription`, `useRenameFile`, `useTrashFiles`, `useRestoreFile`, `usePermanentDeleteFile`, `useTags`, `useCreateTag`, `useDeleteTag`)
- **UI state**: Zustand store in `src/stores/app-store.ts` (nav sidebar, ask AI panel, chat messages, playback prefs, search/filter/sort state)
- **Auth**: `src/hooks/use-auth.ts` (`useLogin`, `useRegister`, `useLogout`, `useCurrentUser`), token in localStorage via `src/lib/auth.ts`
- Query client configured in `App.tsx` with 60s staleTime, 1 retry

### Data Layer

Mock API in `src/services/api.ts` with simulated delays — swap to real backend by only modifying this file. Mock data in `src/services/mock-data.ts`. Types in `src/types/index.ts` (`AudioFile`, `Transcription`, `AskAIMessage`, `User`, `Tag`, `Speaker`, `TranscriptionSegment`, `UploadProgress`, `PaginatedResponse<T>`, `Plan`, `Subscription`, `AuthResponse`).

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

- **Audio**: wavesurfer.js (waveform visualization + playback)
- **Editor**: @tiptap/react + starter-kit + placeholder + highlight
- **Export**: file-saver, jspdf, docx
- **i18n**: i18next + react-i18next + browser language detector
- **Forms**: react-hook-form + zod + @hookform/resolvers
- **Payments**: @stripe/stripe-js + @stripe/react-stripe-js (mock)

### Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin. Theme uses OKLch CSS variables with light/dark mode (`.dark` class toggle via `src/hooks/use-theme.ts`). Utility `cn()` in `src/lib/utils.ts`. Font: Geist Variable. Responsive with mobile bottom nav at `md:` breakpoint.

### i18n

Translations in `src/locales/en.json` and `src/locales/zh.json`. Initialized in `src/lib/i18n.ts`, imported in `main.tsx`. Use `useTranslation()` hook with `t('key.path')`.

### Path Alias

`@/` maps to `./src/` (configured in both vite.config.ts and tsconfig).

### shadcn/ui

Configured via `components.json`. Add components with `pnpm dlx shadcn@latest add <component>`.
