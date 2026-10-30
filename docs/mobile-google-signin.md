# AgriPulse Mobile — Google Sign-In

## Status

- ✅ **Mobile app (this repo):** fully implemented — `@capacitor/browser` opens
  Google sign-in in the system browser (required by Google; OAuth inside an
  embedded WebView is blocked), `@capacitor/app` catches the deep-link
  callback, and `AndroidManifest.xml` has the intent filter for it. Verified
  with `npm run build` + `npx tsc --noEmit` (zero errors) and
  `npx cap sync android`.
- ❌ **Backend (`agripulse-node`):** **not changed by this session** — that
  repo isn't available here. The snippet below is written against the
  *pattern* described in `docs/mobile-architecture.md` (`auth.routes.ts`
  already has an "OAuth callback" that sets the `token` cookie). **You must
  verify the exact route path and handler names against your real repo
  before pasting this in** — this doc assumes the conventional
  `passport-google-oauth20` layout (`/api/auth/google` →
  `/api/auth/google/callback`), which may not match your code exactly.

Until the backend change ships, tapping "Continue with Google" in the app
will open the browser and the user can sign in, but the callback will do
whatever it does today for the web (set a cookie, redirect into
`agripulse.me`) — it will **not** hand control back to the app, because it
doesn't know yet to redirect to the custom scheme. The button is disabled
entirely on web (this hosted preview) since it only makes sense in the
packaged Android app.

## How the mobile flow works

```
App                         System Browser              Backend
 |--- Browser.open(            |                            |
 |     /api/auth/google        |                            |
 |     ?client=mobile) ------->|--- GET /api/auth/google --->|
 |                              |     ?client=mobile          |
 |                              |<-- redirect to Google ------|
 |                              |--- user signs in ---------->|
 |                              |<-- redirect to              |
 |                              |     /api/auth/google/       |
 |                              |     callback ----------------->|
 |                              |                            |--- issues JWT
 |                              |                            |--- sees this
 |                              |                            |    was a mobile
 |                              |                            |    request
 |<---- me.agripulse.app:// ----|<-- redirect to --------------|
 |      auth/callback?token=... |    me.agripulse.app://auth/  |
 |                              |    callback?token=<jwt>      |
 |--- AndroidManifest intent   |                            |
 |    filter routes this URL   |                            |
 |    into the app             |                            |
 |--- appUrlOpen listener      |                            |
 |    (AppContext.tsx) reads   |                            |
 |    ?token, stores it,       |                            |
 |    calls GET /auth/me ----------------------------------->|
```

The app never sees the Google account directly — it only ever talks to
*your* backend, exactly like the email/password flow. This also means it
reuses the same user accounts: a farmer who signs in with Google on the
website can do the same in the app, no separate account.

## The backend change

In your Google OAuth initiation route (where the app currently redirects to
Google — likely `GET /api/auth/google` using `passport.authenticate('google', ...)`),
carry the `client=mobile` flag through Google's round trip using the OAuth
`state` parameter:

```ts
// auth.routes.ts — wherever the Google OAuth flow currently starts
router.get('/google', (req, res, next) => {
  const isMobileClient = req.query.client === 'mobile';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: isMobileClient ? 'mobile' : undefined,
  })(req, res, next);
});
```

Then in the callback handler — wherever it currently does
`res.cookie('token', ...)` and redirects into the website — branch on that
state:

```ts
// auth.routes.ts — the Google OAuth callback handler
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google' }),
  (req, res) => {
    const user = req.user as /* your user type */ any;
    const token = issueToken(user); // however the existing login handler creates the JWT

    const isMobileClient = req.query.state === 'mobile';
    if (isMobileClient) {
      // Hand off to the app instead of the website. No cookie needed here —
      // the app stores the token itself (src/lib/httpClient.ts tokenStore).
      return res.redirect(`me.agripulse.app://auth/callback?token=${encodeURIComponent(token)}`);
    }

    // Existing web behavior — unchanged.
    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', /* ...existing options */ });
    res.redirect(process.env.CLIENT_URL || 'https://agripulse.me/dashboard');
  }
);
```

On failure, redirect mobile clients to
`me.agripulse.app://auth/callback?error=<message>` instead of the web's
failure redirect, so the app can show a real error instead of the request
silently going nowhere.

This is additive and backward-compatible, same shape as the
`X-Client: mobile` patch in `docs/mobile-api-mapping.md`: web behavior
(no `client=mobile` query param sent, no `state` set) is completely
unchanged.

## Things to double-check against your real repo

1. **Exact route paths.** If your Google routes aren't `/auth/google` and
   `/auth/google/callback`, update `src/lib/googleAuth.ts`'s
   `startGoogleSignIn()` URL (currently
   `${API_BASE_URL}/auth/google?client=mobile`) to match.
2. **If you already use `state` for something else** (e.g. CSRF protection
   via `passport-oauth2`'s built-in state), don't overwrite it — instead
   encode `client=mobile` into whatever state payload you already build
   (e.g. a JSON string or an extra field), and parse it back out in the
   callback.
3. **`issueToken()`/equivalent** — use whatever function your existing
   `/auth/login` handler already calls to sign the JWT, so mobile tokens are
   issued identically to web ones (same claims, same expiry, same secret).
4. **CORS is irrelevant here** — the redirect happens via the system
   browser's navigation, not a `fetch()`/XHR call, so the backend's CORS
   allow-list (which blocks the app's origin for API calls — see
   `docs/mobile-api-mapping.md`) doesn't apply to this flow at all.
