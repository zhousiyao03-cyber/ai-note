# AI Note App

Next.js 16 transcription workspace for uploading audio, tracking transcription progress, editing transcripts, organizing files with tags, and managing account settings.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase auth, database, and storage
- TanStack Query for client data fetching
- Inngest for background transcription workflows

## Features

- Email/password authentication flows
- Audio file upload and transcription status tracking
- Transcript detail page with summary, editor, export, and speaker timeline
- Tag management and trash recovery flows
- Settings and billing UI
- English and Chinese localization

## Getting started

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment example and fill in your values:

```bash
cp .env.local.example .env.local
```

3. Start the development server:

```bash
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Environment variables

Set the Supabase variables in `.env.local` before using authenticated flows or storage-backed features.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

If these values are missing, the app shows the built-in Supabase setup screen instead of the main workspace.

## Available scripts

- `pnpm dev` to run the local development server
- `pnpm build` to create a production build
- `pnpm start` to serve the production build
- `pnpm lint` to run ESLint

## Project structure

- `src/app`: App Router routes and API endpoints
- `src/modules`: feature-level UI modules
- `src/components`: shared components and UI primitives
- `src/lib`: platform helpers, Supabase clients, exports, and Inngest setup
- `src/hooks`: shared React hooks
- `src/locales`: i18n dictionaries

## Related docs

Productization and backend planning docs live in [`../docs`](../docs).
