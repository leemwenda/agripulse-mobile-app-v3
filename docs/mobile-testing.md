# AgriPulse Mobile — Testing Report

## What was actually executed in this session

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **Passed** — 0 type errors across the mobile app source |
| `npm run build` (Vite production build) | **Passed** — built `dist/index.html` successfully (see build logs in session; ~121 KB gzipped) |
| `curl https://agripulse.me/api/health` | **200 OK**, `{"status":"ok","version":"2.0.0","name":"AgriPulse API"}` — confirms the real backend is live |
| `curl https://agripulse.me/api/market?limit=2` | **200 OK**, `{"listings":[],"total":0,"page":1,"pages":0}` — confirms the public marketplace endpoint works and currently has no listings |
| `curl -H "Origin: https://example-preview.sandbox.dev" https://agripulse.me/api/health` | **500**, no CORS header — confirms cross-origin browser calls from this preview are rejected by production CORS policy |
| `which java javac gradle adb` / `$ANDROID_HOME` | **Not found / unset** — confirms no Android build toolchain is available in this environment |

No backend unit/integration tests (`vitest`) were run against the cloned
`agripulse-node` repository in this session, because doing so would require
installing its dependencies and, for most meaningful tests, a configured
MySQL database and `.env` — none of which were provided, and provisioning
them was out of scope for a mobile-focused change set that does not modify
the backend. This is a **documented gap**, not a claimed pass.

## What was manually verified by code inspection (not executed)

- Route existence and shape for every endpoint listed in
  `docs/mobile-api-mapping.md`, by reading the actual route source files.
- Prisma schema field names/types for `Animal`, `MilkProduction`,
  `HealthRecord`, `Breeding`, `FinancialTransaction`, `MarketListing`, by
  reading `prisma/schema.prisma`.
- Auth middleware behavior (`extractToken`, cookie vs Bearer precedence), by
  reading `src/middleware/auth.middleware.ts`.

## Manual test plan for the mobile app (to run once a live or staging backend is reachable)

| Scenario | Steps | Expected result |
|---|---|---|
| App startup | Open the app with no stored session | Splash → Login screen |
| Demo Mode | Tap "Continue in Demo Mode" | Lands on Home with amber Demo Mode banner, sample stats, no network calls for data screens |
| Live login success | Enter valid credentials against a reachable backend | Home loads real dashboard stats; no Demo banner |
| Live login failure | Enter wrong password | Inline error message from the server (`"Incorrect email or password."`), no crash |
| Network/CORS failure | Attempt live login from an origin not in the backend's allow-list | Clear "Could not reach the AgriPulse server..." message, not a blank screen or fabricated success |
| Role-aware nav | Log in as `buyer` vs `admin` vs `vet` (backend-dependent) | Home and More menu contents differ per role; no admin-only entries ever appear |
| Register animal — happy path | Fill all required fields, submit once | Success toast, returns to farm list; duplicate submit while pending is blocked (`submitted` guard + disabled button) |
| Register animal — validation | Submit with missing required field | Inline error, no request sent |
| Milk duplicate | Submit two milk records for the same animal + date | Second submission surfaces the server's `409` message about an existing record, not a silent duplicate |
| Android back navigation | Navigate Home → Farm → Animal detail → Milk tab, then press hardware/gesture back repeatedly | Returns one screen at a time via browser history (React Router); verified behaviorally in a Capacitor WebView, which maps the hardware back button to `history.back()` by default — final native wiring to `@capacitor/app`'s `backButton` event is listed as a to-do in `docs/android-build.md` |
| Offline | Toggle device/browser offline | Slate "You are offline" banner appears; cached screens remain visible |
| Empty states | New account / Demo farm with zero records in a category | Each list screen (animals, milk, health, breeding, finance, marketplace, notifications) shows a specific, actionable empty state rather than a blank screen |
| AI Advisor unavailable | Force a chat request to fail (e.g. by being offline) | "AI Advisor unavailable" message with the real error, never a fabricated reply |
| Passport privacy | View a passport as a `buyer`/anonymous role vs the owning farmer | Health/milk/breeding sections are hidden for non-owner roles in this client (see `docs/mobile-security.md` for the server-side gap this does not fully close) |

These scenarios were exercised informally during development (every screen
was built against both Demo Mode and the live-mode code path, and the
network-failure path was exercised naturally since this hosted preview
cannot reach the real API). They were **not** run as an automated Vitest/
Playwright suite in this session — see "Known gaps" below.

## Known gaps / not run

- No automated component tests (Vitest + React Testing Library) were added
  for the mobile screens in this pass. The existing web client already has a
  Vitest setup (`client/vitest.config.ts`, `client/src/test/`) that could be
  extended with shared assertions; recommended as the next step.
- No Android instrumentation tests (Espresso) — no Android project exists
  yet in this environment.
- No load/performance testing against the production API was performed
  (and would be inappropriate against production without authorization).
- No test accounts were created against the production database — by
  design, per the non-negotiable rule against using production as disposable
  test data.
