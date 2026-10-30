# AgriPulse Mobile — Security Notes

## Summary of what this change set does and does not do

- **No production code was modified or deployed.** All findings below come
  from reading the real repository and making read-only, non-destructive
  HTTP requests to `https://agripulse.me` (`GET /api/health`, `GET
  /api/market`, and CORS preflight checks). No accounts were created, no
  records were written, and no credentials were used against production.
- The mobile app built in this repository implements its own
  defense-in-depth client-side behavior (described below) but **cannot**
  fix server-side authorization gaps — those require changes to
  `agripulse-node` by its maintainer, reviewed and deployed through its own
  process.

## Findings from the audit

### 1. Public passport endpoint over-exposes data (server-side finding)

`GET /api/passport/:agripulseId` has no authentication/authorization
middleware and returns, to any caller:
- Full health record history (`healthRecords`)
- Full milk production history (`milkProduction`)
- Full breeding history (`breeding`)
- The owning farm account's **name and email address** (`farm: {id, name, email}`)

This conflicts with the product requirement that a QR/public passport should
expose identity/verification information only, and keep health, production
and contact details private to authorized accounts.

**Mitigation implemented in this mobile app:** `src/screens/Passport.tsx`
only renders health/milk/breeding sections when the signed-in user's role is
`admin` or `worker`; it also builds the QR's public verification link to the
real site's `/animal/:agripulseId` page rather than exposing data inline.
This reduces *accidental* exposure inside this specific client but does not
close the underlying gap, since the raw API remains unauthenticated and
unfiltered for any other caller. **Recommended server fix** (not applied):
filter the response based on `req.user` (via `optionalAuth`), returning only
`{name, tagNumber, breed, gender, dateOfBirth, agripulseId, status}` to
anonymous/public callers, and the full record only to the farm's own
authenticated account.

### 2. Cookie/token model is not mobile-compatible yet (server-side finding)

See `docs/mobile-api-mapping.md` for full detail. In short: the login
response never returns the JWT in JSON, only via an httpOnly,
`SameSite=Strict` cookie, which a native app cannot read. The middleware
already accepts `Authorization: Bearer <jwt>`, so the fix is additive (return
the token in JSON for an explicitly-flagged mobile client) rather than a
redesign. This is documented, not implemented in production.

### 3. CORS allow-list correctly rejects unknown origins

Verified: requests from an arbitrary `Origin` header are rejected (no
`Access-Control-Allow-Origin` returned, and the server currently responds
`500` instead of a clean `403` because the thrown CORS error isn't caught by
an error-handling middleware). This is good security posture for arbitrary
web origins; the `500` response leaking a generic internal error page is a
minor hardening opportunity (should be a handled `403`), reported here but
not changed.

## How this mobile app handles authentication

- Uses the backend's **existing** JWT mechanism — no second, parallel
  authentication system was created.
- Token is sent as `Authorization: Bearer <token>` (already supported
  server-side), never relies on reading the httpOnly cookie.
- On native Android (Capacitor), the token must be stored via
  `@capacitor/preferences` (and ideally encrypted via a platform keystore
  wrapper) instead of `localStorage`. The current web-preview build uses
  `localStorage` through a single abstraction (`tokenStore` in
  `src/lib/httpClient.ts`) specifically so that swapping to secure,
  encrypted native storage is a one-file change.
- Session state (`checking` / `live` / `demo` / `signed-out`) is explicit;
  the UI never presents demo data as if it were a live session, and a
  persistent banner is shown throughout Demo Mode.
- Logout clears the locally stored token and calls `/api/auth/logout` to
  clear the server-side cookie when in a live session.

## Client-side security practices implemented

- All backend requests use HTTPS (`https://agripulse.me/api` is the default
  base URL; overriding via `VITE_API_BASE_URL` is intended for local/staging
  development only, not for shipping a production build pointed at HTTP).
- No TLS validation is disabled anywhere in this client.
- No secrets, API keys, or credentials are embedded in the client code.
  The AI Advisor, image analysis, email, and any other third-party
  credentials remain server-side, as found in the audited repository
  (`.env.example` keys like `JWT_SECRET`, mail provider keys, etc. are only
  referenced by backend code, never by the mobile client).
- Request timeouts (15s) and explicit network-error handling prevent the UI
  from hanging indefinitely or silently succeeding on failure.
- Duplicate-submission guards on all create forms (register animal, milk,
  health, breeding, finance, listing) disable the submit action while a
  request is in flight and track a `submitted` flag.
- Server error messages are surfaced to the user as-is (no sensitive
  internals), and generic fallback copy is shown for unexpected errors.
- No passwords, tokens, or private farm data are written to `console.log`
  anywhere in this codebase.
- Role-based UI is **advisory only**; every screen assumes the server is
  the actual authority and renders whatever the server allows/returns. No
  client-side role check is used as a security boundary — it only affects
  which menu items/screens are shown for usability.

## Required follow-up before a production Android release

1. Backend owner reviews and ships the additive "token in JSON for mobile
   clients" change (see `mobile-api-mapping.md`).
2. Backend owner reviews and fixes the public passport endpoint's
   over-exposure of health/contact data.
3. Backend CORS allow-list updated if any credentialed cookie-based calls
   from the packaged app are desired (not required if the Bearer-token flow
   above is adopted).
4. Replace `localStorage` token storage with `@capacitor/preferences` (or a
   secure-storage plugin) when the native Android project is built.
5. Obtain and securely store a release signing key (see
   `docs/android-release.md`); never commit it to source control.
