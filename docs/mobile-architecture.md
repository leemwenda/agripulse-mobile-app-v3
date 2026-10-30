# AgriPulse Mobile — Architecture

## 1. Audit method

This document is based on a direct, read-only inspection of the real
repository (`git clone https://github.com/leemwenda/agripulse-node.git`,
HEAD at the time of this work), plus live, non-destructive HTTP checks
against `https://agripulse.me` (`GET /api/health`, `GET /api/market`).
No destructive commands were run, no records were created, and no
credentials were used against production.

## 2. What already exists (verified)

| Layer | Technology | Evidence |
|---|---|---|
| Backend | Node.js + TypeScript + Express 4 | `src/index.ts`, `package.json` |
| ORM / DB | Prisma 5 + MySQL | `prisma/schema.prisma` (44 models) |
| Auth | JWT, issued on login, stored as an **httpOnly, `SameSite=Strict` cookie** named `token`; `Authorization: Bearer <jwt>` header accepted as a fallback | `src/routes/auth.routes.ts`, `src/middleware/auth.middleware.ts` |
| Roles | `superadmin`, `admin` (farm owner), `worker`, `buyer`, `vet` | `prisma/schema.prisma` `enum Role` |
| Web client | React 18 + TypeScript + Vite + Tailwind + React Router + Axios (`withCredentials: true`) | `client/` |
| AI Advisor | Server-side chat via Groq (`callGroq`), persisted sessions/messages, farm-data-aware system prompt | `src/routes/extra.routes.ts` (`aiRouter`) |
| Image intelligence / Re-ID | Dedicated service + routes (`imageIntelligence.routes.ts`, `reid-service/`) | `src/routes/`, `reid-service/` |
| Marketplace | Listings, offers, messages, favorites, watchlists, saved searches, reviews, agreements | `src/routes/market.*.ts`, matching Prisma models |
| Veterinary module | Profiles, slots, appointments, treatments, vaccinations, prescriptions, certificates, lab tests | `src/routes/vet.*.ts` |
| Digital passport | Public, unauthenticated lookup by `agripulseId`; ownership-transfer workflow (initiate/accept/cancel/refresh-code) | `src/routes/passport.routes.ts` |
| PDF/reports | `pdfkit`-based report generation | `src/services/pdf.service.ts`, `reportsRouter` |
| No existing mobile app | No Capacitor config, no `android/` project, no React Native code found anywhere in the repository | `find . -iname "*capacitor*"` → no results |

The production API is live and responding (`GET https://agripulse.me/api/health`
→ `200 {"status":"ok","version":"2.0.0","name":"AgriPulse API"}`), and the
public marketplace endpoint (`GET /api/market`) is reachable and currently
returns zero listings — i.e. the real marketplace has no listings at the time
of this audit. This confirms the backend is operational and that example
data shown in this mobile app must never be confused with that real,
currently-empty data set.

## 3. Chosen mobile architecture

**React + TypeScript + Capacitor + Android**, reusing the existing backend's
REST API and Prisma-backed MySQL database — no new database, no duplicate
business logic, no second backend.

Rationale:
- The existing web client is already React + TypeScript + Vite + Tailwind,
  so the same component mental model, API shapes, and design language
  transfer directly to a Capacitor-wrapped mobile app.
- The backend already exposes a REST JSON API consumed by a separate SPA
  (not server-rendered HTML), which is exactly the shape a mobile client
  needs.
- The backend's auth middleware **already supports Bearer-token
  authentication** as a fallback to the cookie (see `extractToken()` in
  `auth.middleware.ts`), which is the correct mechanism for a native app
  that cannot rely on a `SameSite=Strict` cookie. This made Capacitor (over
  a generic WebView wrapper or a from-scratch native rewrite) the pragmatic
  choice — most of the integration work is in the client, not the server.

This is **not** a "put the website in a WebView" solution: the mobile app
in `src/` is a separate, purpose-built, mobile-first UI with its own
navigation (bottom tabs), its own screens, and a typed API client — it does
not load `agripulse.me` in an iframe/WebView.

## 4. Verified integration gap (must be fixed before real devices can log in)

The backend currently returns the JWT **only** via `Set-Cookie`
(`res.cookie('token', ...)`) on `/api/auth/login`, `/api/auth/register`
(email flows) and OAuth callbacks. It never echoes the token in the JSON
response body. A native/Capacitor client — or any client on a different
origin, including this hosted preview — cannot read an httpOnly cookie, so
it cannot obtain a bearer token to send on subsequent requests, even though
the server already knows how to verify one. See
`docs/mobile-api-mapping.md` §"Required backend change" for the precise,
minimal, backward-compatible patch recommended (not deployed as part of
this change set).

Additionally, the backend's CORS allow-list
(`src/index.ts` → `allowedOrigins`) is a strict list of known origins
(`agripulse.me`, `www.agripulse.me`, a Vercel preview pattern, and
`CLIENT_URL`). Any other origin — including this sandbox's preview URL —
is rejected by the browser. This was verified directly:

```
curl -H "Origin: https://example-preview.sandbox.dev" https://agripulse.me/api/health
→ HTTP/1.1 500 Internal Server Error   (no Access-Control-Allow-Origin header)
```

**Consequence for this deliverable:** real API calls made from this hosted
preview will fail (by design of the production CORS policy, not a bug in
this app). The app therefore defaults to a clearly labeled **Demo Mode**
when the live API is unreachable, while the API client itself is written to
be production-correct for the actual Android app, where the host app's
origin should be added to the backend allow-list (see
`docs/mobile-security.md`).

## 5. Mobile app structure (this repository)

```
src/
  types/            Domain types mirrored from prisma/schema.prisma
  lib/
    httpClient.ts    Centralized fetch client: base URL, timeout, bearer auth,
                      error normalization, network-error detection
    api.ts           Typed endpoint functions, 1:1 with real routes
    demoData.ts       Clearly labeled sample data (Demo Mode only)
    useRemoteData.ts  Data-loading hook: live API in 'live' mode, demo data
                      in 'demo' mode — never silently mixed
    format.ts         KES currency, Africa/Nairobi dates, liters, age
  context/
    AppContext.tsx    Session mode (checking/live/demo/signed-out), auth,
                      connectivity, toasts
  components/
    ui.tsx            Buttons, cards, badges, empty/loading states, sheets,
                      confirm dialogs, toasts, demo/offline banners
    layout.tsx        Phone frame, top bar with back navigation, bottom tabs
  screens/            Auth, Home, Farm, Records (milk/health/breeding/
                      finance), AIAdvisor, Marketplace, Passport, More
  App.tsx             Routes, auth guards, role-aware navigation
```

## 6. Role-aware navigation

Bottom navigation (Home, My Farm, AI Advisor, Marketplace, More) is shown to
every authenticated user, but screen content adapts to `user.role`:

- `admin` / `worker` (farm accounts) see the full farm-management Home
  dashboard and farm workflows.
- `buyer` sees a marketplace-first Home screen.
- `vet` sees a veterinary-first Home screen (appointments entry point).
- No role is granted administrative capability in the UI; `superadmin`
  screens from the web app (`SystemPanel.tsx`, etc.) were intentionally
  **not** ported to mobile, per the requirement that admin privileges must
  not be exposed through a general-purpose client app. All permission
  decisions are enforced server-side regardless of what the client shows.

## 7. Known limitations of this specific deliverable

This tool environment (used to produce this deliverable) has **no Java, no
Android SDK, no Gradle** (`which java` → not found; `$ANDROID_HOME` unset),
and its own build/serve pipeline only builds and serves a static Vite web
app (`npm run build` → `dist/index.html`). It cannot compile or install an
Android APK. See `docs/android-build.md` for exactly what was and was not
possible to verify here, and the commands to complete the build in a real
Android development environment.
