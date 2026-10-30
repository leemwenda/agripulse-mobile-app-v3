# AgriPulse Mobile — Development Guide

## Prerequisites

- Node.js 18+ (this project was developed/tested with Node 20)
- npm 10+
- For native Android work (not available in this sandbox, see
  `docs/android-build.md`): Android Studio, JDK 17, Android SDK

## Project layout

This repository contains the **mobile web client** (React + TypeScript +
Tailwind + Capacitor-ready). It is intended to be built, then wrapped with
Capacitor into an Android app. See `capacitor.config.ts` at the repo root.

```
src/
  types/           Shared TypeScript types mirroring the real backend schema
  lib/             API client, demo data, formatting helpers, data hook
  context/         AppContext (auth/session/connectivity/toasts)
  components/      Reusable UI primitives + app shell/navigation
  screens/         Feature screens (Auth, Home, Farm, Records, AI, Market...)
  App.tsx          Routing + auth guards
```

## Environment configuration

The API base URL is controlled by `VITE_API_BASE_URL` (Vite env convention).
If unset, it defaults to the real production API:
`https://agripulse.me/api`.

Create a `.env.local` (not committed) for local development against a
staging/dev backend:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Never hardcode a developer machine's LAN IP into a release build. For a
device/emulator talking to a local backend, pass the LAN IP via this same
env variable at build time instead.

## Local development

```bash
npm install
npm run dev        # Vite dev server
npm run build       # Type-checks via tsc (through vite build) + production bundle
npm run preview     # Preview the production build locally
```

## Demo Mode vs Live Mode

- On load, the app pings `GET {API_BASE_URL}/health`. If a stored token
  exists, it calls `GET /api/auth/me` to restore a live session.
- If there's no session, the Login screen offers **"Continue in Demo
  Mode"**, which loads clearly labeled sample data (`src/lib/demoData.ts`)
  so the full app can be explored without a live account or network access.
- Every screen that renders demo data shows a persistent amber "Demo Mode"
  banner. Real and demo data are never merged in the same view.
- When running against a real backend with working mobile authentication
  (see `docs/mobile-api-mapping.md` for the one required backend change),
  signing in moves the app into Live Mode and all reads/writes go through
  the real API.

## Code conventions

- All API calls go through `src/lib/api.ts`, which wraps the shared HTTP
  client in `src/lib/httpClient.ts`. Do not call `fetch` directly from a
  screen component.
- All screens that load server data should use `useRemoteData` (
  `src/lib/useRemoteData.ts`) so Demo Mode fallback and error/loading states
  stay consistent.
- Currency must always be formatted with `formatKES()`; dates with
  `formatDate()`/`formatDateTime()` (Africa/Nairobi timezone) — see
  `src/lib/format.ts`.
- Do not fabricate AI responses, diagnoses, confidence scores, or financial
  totals anywhere in the codebase — surface real API errors instead.

## Adding a new backend-integrated screen

1. Add/confirm the real route and response shape in the backend repository
   (do not guess).
2. Add a typed function to `src/lib/api.ts`.
3. Add a demo fallback value to `src/lib/demoData.ts` if the screen should
   work in Demo Mode.
4. Use `useRemoteData(loader, demoValue)` in the screen.
5. Add the route to `src/App.tsx`, guarded by `PrivateRoute`.
6. Update `docs/mobile-api-mapping.md`.
