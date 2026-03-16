# Plaud Desktop

Plaud Desktop is the native desktop client scaffold for this repository. It is built with Tauri 2, React, Vite, and TypeScript, and is intended to reuse the existing Plaud backend and domain model.

## Current scope

This module currently provides:

- Tauri 2 desktop shell
- React app shell with route skeleton
- TanStack Query provider
- i18n bootstrap for English and Chinese
- basic API client aimed at the existing `/api/v1/*` backend
- progress-oriented placeholder screens for login, files, and settings

## Prerequisites

- Node.js 20+
- pnpm
- Rust toolchain for `tauri dev` and `tauri build`

Tauri prerequisite guide:

- [Tauri prerequisites](https://tauri.app/start/prerequisites/)

## Getting started

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment example if you need a custom backend base URL:

```bash
cp .env.example .env.local
```

3. Start the frontend shell:

```bash
pnpm dev
```

4. Start the Tauri desktop shell once Rust is installed:

```bash
pnpm tauri:dev
```

## Environment variables

- `VITE_API_BASE_URL`: explicit backend base URL for desktop requests
- `VITE_API_PROXY_TARGET`: Vite dev proxy target, defaults to `http://localhost:3000`

## Notes

- During local development, Vite proxies `/api/*` requests to the web app backend by default.
- This scaffold intentionally keeps desktop-only concerns separate from shared business logic so we can extract shared packages incrementally.
