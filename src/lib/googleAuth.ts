// ============================================================================
// Google sign-in for the native app
//
// Flow (standard, Google-approved pattern for native apps — Google blocks
// OAuth inside an embedded WebView, so this must use the system browser):
//
//   1. App opens `${API_BASE_URL}/auth/google?client=mobile` in the system
//      browser via @capacitor/browser (NOT an in-app WebView).
//   2. User completes Google sign-in normally (same flow as the website).
//   3. Backend's OAuth callback sees `client=mobile` was requested (the
//      ?client=mobile param must round-trip through Google's `state`
//      param — see docs/mobile-google-signin.md for the exact backend
//      change this requires) and, instead of only setting the web cookie
//      and redirecting into the website, redirects the browser to:
//        me.agripulse.app://auth/callback?token=<jwt>
//   4. Android hands that URL to this app (AndroidManifest.xml intent
//      filter already added) and @capacitor/app's `appUrlOpen` listener
//      (wired in AppContext.tsx) extracts the token and completes login.
//
// REQUIRES A BACKEND CHANGE — see docs/mobile-google-signin.md. Nothing in
// this file works until that ships, same as the email/password mobile-auth
// gap in docs/mobile-api-mapping.md.
// ============================================================================
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { API_BASE_URL } from './httpClient';

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Opens Google sign-in in the system browser (Chrome Custom Tabs on
 * Android). Resolves once the browser is opened — the actual sign-in
 * result arrives later via the `appUrlOpen` deep-link listener, not as a
 * return value here.
 */
export async function startGoogleSignIn(): Promise<void> {
  const url = `${API_BASE_URL}/auth/google?client=mobile`;
  await Browser.open({ url, presentationStyle: 'popover' });
}

/** Closes the in-app browser tab, if open — call this once the deep-link callback fires. */
export async function closeGoogleSignIn(): Promise<void> {
  try {
    await Browser.close();
  } catch {
    /* no-op if it was already closed by the system */
  }
}

/**
 * Parses the token out of a `me.agripulse.app://auth/callback?token=...`
 * deep link. Returns null if the URL doesn't match the expected shape
 * (e.g. some other deep link, or an error redirect with no token).
 */
export function parseAuthCallbackUrl(url: string): { token: string | null; error: string | null } {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'me.agripulse.app:' || parsed.host !== 'auth') {
      return { token: null, error: null };
    }
    return {
      token: parsed.searchParams.get('token'),
      error: parsed.searchParams.get('error'),
    };
  } catch {
    return { token: null, error: null };
  }
}
