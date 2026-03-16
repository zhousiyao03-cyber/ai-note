# Desktop Session Strategy

## Current decision

Plaud Desktop currently uses the backend auth routes and cookie-backed session flow as the source of truth:

- login: `POST /api/v1/auth/login`
- logout: `POST /api/v1/auth/logout`
- bootstrap: `GET /api/v1/me`

The desktop client does not store raw access tokens or refresh tokens in app state, local storage, or a custom desktop store.

## Why this is the right short-term strategy

- It keeps desktop aligned with the existing backend and web auth behavior.
- It avoids introducing a second auth implementation inside the desktop shell.
- It reduces the risk of leaking bearer tokens through desktop-side persistence.
- It allows us to keep treating `/api/v1/me` as the single truth for whether the current session is valid.

## Current client behavior

- On app load, desktop queries `/api/v1/me`.
- If the request succeeds, the user is treated as authenticated.
- If the request returns `401`, the user is treated as signed out.
- Protected routes redirect to `/login`.
- Logout calls the backend and clears desktop query cache.

## What is intentionally not stored

- access token
- refresh token
- session secret
- auth cookie contents

## Future enhancements

When we move beyond the current MVP shell, we should consider:

- validating how WebView cookie persistence behaves across restarts on Windows and macOS
- adding OS-backed secure storage only for non-cookie session metadata if required
- adding a startup revalidation path and session-expired notification UX
- documenting sign-out cleanup for cached audio URLs and recent-file state
