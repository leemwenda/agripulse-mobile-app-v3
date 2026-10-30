# AgriPulse Mobile — API Capability Matrix

All endpoints below were found by reading the actual route files in
`agripulse-node/src/routes/*.ts`. None were invented. "Mobile client" column
shows the function in `src/lib/api.ts` that calls it.

Base URL: `https://agripulse.me/api` (configurable via `VITE_API_BASE_URL`).

## Auth

| Feature | Route | Method | Auth | Request | Response | Mobile client | Status |
|---|---|---|---|---|---|---|---|
| Login | `/auth/login` | POST | none (rate-limited 10/15min) | `{email,password,remember}` | `{user}` + `Set-Cookie: token` | `AuthApi.login` | ⚠️ Works for web; **no token in JSON body**, so a native client cannot capture the session (see gap below) |
| Register | `/auth/register` | POST | none | `{name,email,password,role,farmName?}` | `{message}` (pending email verification) | `AuthApi.register` | Implemented |
| Current user | `/auth/me` | GET | cookie or Bearer | — | `{user}` | `AuthApi.me` | Implemented; Bearer path already supported server-side |
| Logout | `/auth/logout` | POST | cookie | — | `{message}` | `AuthApi.logout` | Implemented |
| Forgot password | `/auth/forgot-password` | POST | none (rate-limited) | `{email}` | `{message}` | `AuthApi.forgotPassword` | Implemented |

### Required backend change (not deployed by this change set)

`POST /api/auth/login` (and the equivalent success paths in
`/auth/register`'s verified-login flow and OAuth callback) should, in
addition to setting the cookie for the web client, include the token in the
JSON body **only when the request is identified as a non-browser client**,
e.g. via a custom header such as `X-Client: mobile`:

```ts
// auth.routes.ts, inside the existing login handler, after issueToken():
const isMobileClient = req.headers['x-client'] === 'mobile';
res.json({
  user: { id: user.id, name: user.name, email: user.email, role: user.role, farmId: user.farmId },
  ...(isMobileClient ? { token } : {}),
});
```

This is additive and backward-compatible: web behavior is unchanged (no
`X-Client` header sent, no `token` field added to the response), and the
mobile client gains the ability to store a bearer token securely on-device.
This patch has **not** been applied to the production repository or
deployed — it is documented here for the repository owner's review, per the
non-negotiable rule against modifying production without approval.

**Client-side status (updated):** `src/lib/httpClient.ts` now sends
`X-Client: mobile` on every request and already reads `res.token` if present
(`src/context/AppContext.tsx`'s `login()`). So the client side of this fix is
complete — once the snippet above is deployed on the backend, a farmer who
already has an account on the website can log into this app with the same
email/password and it will work, with no further app changes needed.

Separately, the backend's CORS allow-list should include the Capacitor
Android app's effective origin (with `server.androidScheme: 'https'` in
`capacitor.config.ts`, Capacitor serves the app from `https://localhost`) if
the production team wants to support credentialed cookie calls from the
packaged app. If the Bearer-token approach above is adopted end-to-end,
the native app does not need to rely on cookies/CORS credentials at all.

## Dashboard

| Feature | Route | Method | Auth | Response shape (verified) | Mobile screen |
|---|---|---|---|---|---|
| Farm dashboard | `/dashboard` | GET | required | `{stats:{totalAnimals,femaleAnimals,maleAnimals,todayMilk,monthMilk,activePregnant,monthIncome,monthExpense,monthProfit}, upcomingBirths[], recentHealth[], topProducers[], weeklyTrend[], recentTransactions[]}` | `HomeScreen` |

## Animals

| Feature | Route | Method | Auth | Status |
|---|---|---|---|---|
| List | `/animals` | GET | required | Implemented |
| Detail | `/animals/:id` | GET | required | Implemented |
| Create | `/animals` | POST | `requireAdmin` (admin/superadmin) | Implemented |
| Update | `/animals/:id` | PUT | `requireAdmin` | Implemented |
| Delete | `/animals/:id` | DELETE | `requireAdmin` | Implemented |
| Upload photo | `/animals/:id/photos` | POST (multipart) | `requireAdmin` | Implemented |
| Delete photo | `/animals/:id/photos/:photoId` | DELETE | `requireAdmin` | Implemented |

Note: `requireAdmin` currently allows `admin`/`superadmin` only — a `worker`
account may not be able to register/edit animals directly via this route
today. The mobile app surfaces server error messages as-is rather than
guessing permissions client-side.

## Milk / Health / Breeding / Finance (`src/routes/data.routes.ts`)

| Feature | Route | Method | Notes |
|---|---|---|---|
| Milk list/create/update/delete | `/milk` | GET/POST/PUT/DELETE | Unique constraint `(animalId, productionDate)` — server returns `409` on duplicate, surfaced in the mobile form as "a record for this animal on this date already exists" |
| Health list/create/update/delete | `/animal-health` | GET/POST/PUT/DELETE | Fields: `condition`, `treatment`, `doctorName`, `vaccination`, `notes` |
| Breeding list/create/update | `/breeding` | GET/POST/PUT | `pregnancyStatus`: pending/confirmed/pregnant/calved/failed |
| Financial list/create/update/delete | `/financial` | GET/POST/PUT/DELETE | `type`: income/expense |

## AI Advisor (`aiRouter`, mounted at `/api/ai`, `requireAuth` on all routes)

| Feature | Route | Method | Notes |
|---|---|---|---|
| List sessions | `/ai/sessions` | GET | |
| Create session | `/ai/sessions` | POST | |
| Delete session | `/ai/sessions/:id` | DELETE | |
| Session messages | `/ai/sessions/:id/messages` | GET | |
| Send message | `/ai/chat` | POST | `{sessionId, message | quickAction}` → `{reply}`. Server builds a farm-data-aware system prompt and calls Groq (`callGroq`) — **this is a real LLM call, not a canned response**. The mobile app never fabricates a reply; if the request fails it shows an explicit "AI Advisor unavailable" error instead of inventing text. |
| Context | `/ai/context` | GET | `{animals, milk7, health, breeding}` |

## Marketplace

| Feature | Route | Method | Auth | Notes |
|---|---|---|---|---|
| Browse | `/market` | GET | `optionalAuth` (public) | Verified live: currently returns 0 listings on production |
| Detail | `/market/:id` | GET | public | |
| Create | `/market` | POST | `requireAuth` + `requireFarmer` | |
| Upload photo | `/market/:id/photos` | POST (multipart) | `requireAuth` | |
| Update | `/market/:id` | PATCH | `requireAuth` | |
| Delete | `/market/:id` | DELETE | `requireAuth` | |
| My listings | `/market/my-listings` | GET | `requireAuth` | |
| Offers, messages, reviews, watchlist, saved search, analytics | `/market-offers`, `market.messages`, `market.reviews`, `market.watchlist`, `market.savedsearch`, `market.analytics` | various | **Not yet wired into this mobile build** — documented gap, see §Not implemented below |

No payment processing endpoints exist in the backend. The mobile app
therefore never claims a listing is "paid" or "sold via the app" — it treats
`status` from the server as authoritative and only offers a "Contact seller"
action.

## Digital Passport

| Feature | Route | Method | Auth | Notes |
|---|---|---|---|---|
| Get passport by AgriPulse ID | `/passport/:agripulseId` | GET | **none (public)** | ⚠️ Security finding: this returns full health records, milk history, breeding history, and the owning farm's **email address**, to any caller with a valid ID, with no authorization check. See `docs/mobile-security.md`. The mobile app mitigates this on the client by only rendering health/milk/breeding history when the signed-in user's role is `admin`/`worker` for their own farm — but this is **not a substitute for a server-side fix**, since a non-app client (e.g. `curl`) can still read everything today. |
| Initiate/accept/cancel ownership transfer | `/passport/transfer/*` | POST/GET | `requireAuth` | Not yet wired into this mobile build (documented gap) |

## Veterinary module

Routes exist for profiles, availability slots, appointments, treatments,
vaccinations, prescriptions, certificates, and lab tests
(`src/routes/vet.*.ts`). **Not yet wired into this mobile build** beyond a
role-aware Home placeholder — implementing the full vet workflow set was out
of scope for this pass given the size of the surface area (9 route files).
This is the top recommended next milestone.

## Reports / Profile / Notifications / Workers / Issues

`reportsRouter`, `profileRouter`, `notificationsRouter`, `workersRouter`,
`issuesRouter` all exist server-side (`src/routes/extra.routes.ts`) and are
represented in the mobile "More" menu as entry points, but only
Notifications and Profile are wired to real calls in this pass; Reports,
Workers and Help/Issues are placeholders pointing at the real route for a
future iteration.

## Explicitly NOT implemented in this mobile build

- Image intelligence / Re-ID admin tooling (`/api/admin/images`, `/api/admin/reid`) — these are admin-only surfaces and were intentionally excluded, per the requirement not to expose admin capability on mobile.
- Full veterinary appointment booking/management flow.
- Marketplace offers, messaging threads, reviews, watchlists, saved searches.
- Ownership transfer workflow UI (passport transfer endpoints exist server-side but have no mobile screen yet).
- Push notifications (no device-token registration endpoint was found in the backend; would require a new, additive endpoint plus FCM configuration — not implemented).
