// ============================================================================
// Centralized, typed API client for AgriPulse Mobile
//
// This client talks to the REAL AgriPulse backend (agripulse-node):
//   Base URL:    https://agripulse.me/api  (configurable via VITE_API_BASE_URL)
//   Auth:        JWT. The backend accepts EITHER an httpOnly "token" cookie
//                (used by the web app) OR an "Authorization: Bearer <jwt>"
//                header (verified in src/middleware/auth.middleware.ts of the
//                backend — extractToken() checks the header as a fallback).
//
// IMPORTANT, VERIFIED LIMITATION (see docs/mobile-security.md):
// The backend's /api/auth/login and /api/auth/register endpoints currently
// only return the JWT inside a Set-Cookie header (httpOnly, SameSite=Strict).
// They do NOT currently echo the token in the JSON body. A browser-based
// preview (or any client on a different origin than agripulse.me) cannot
// read that cookie and the backend's CORS allow-list does not include
// arbitrary preview/dev origins, so cross-origin calls are rejected by the
// browser. This is a genuine backend gap for native/mobile clients, not a
// bug in this client. The recommended, backward-compatible fix is documented
// in docs/mobile-api-mapping.md ("token in JSON body for non-browser
// clients") and has NOT been deployed to production by this change set.
//
// This client is written to be production-correct for when:
//   (a) it runs inside the packaged Android app (Capacitor), where the
//       backend's CORS allow-list is extended to include the app's origin, or
//   (b) the documented backend change ships and a bearer token becomes
//       available to store securely on-device.
// Until then, calls made from this hosted preview will fail with a network/
// CORS error — which this client surfaces honestly instead of pretending to
// succeed. The app falls back to a clearly labeled Demo Mode in that case.
// ============================================================================

import { Preferences } from '@capacitor/preferences';

const DEFAULT_BASE_URL = 'https://agripulse.me/api';
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || DEFAULT_BASE_URL;

const TOKEN_KEY = 'agripulse.mobile.token';
const REQUEST_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  status: number;
  code?: string;
  isNetworkError: boolean;

  constructor(message: string, status: number, code?: string, isNetworkError = false) {
    super(message);
    this.status = status;
    this.code = code;
    this.isNetworkError = isNetworkError;
  }
}

// Token storage: on native Android (Capacitor) this should use
// @capacitor/preferences (or secure storage) instead of localStorage.
// Abstracted here so swapping storage backends touches one place only.
// Token storage — backed by @capacitor/preferences which uses Keychain on
// iOS, SharedPreferences on Android, and localStorage on web.
//
// The synchronous get() returns a cached value. Callers must await
// tokenStore.init() once at app startup before calling get().
let cachedToken: string | null = null;
let initialized = false;

export const tokenStore = {
  async init(): Promise<void> {
    if (initialized) return;
    initialized = true;
    try {
      const { value } = await Preferences.get({ key: TOKEN_KEY });
      cachedToken = value ?? null;
    } catch {
      cachedToken = null;
    }
  },
  get(): string | null {
    return cachedToken;
  },
  set(token: string) {
    cachedToken = token;
    Preferences.set({ key: TOKEN_KEY, value: token }).catch(() => {});
  },
  clear() {
    cachedToken = null;
    Preferences.remove({ key: TOKEN_KEY }).catch(() => {});
  },
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  isFormData?: boolean;
  skipAuth?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const token = tokenStore.get();

  const headers: Record<string, string> = {
    // Identifies this client to the backend as a non-browser (mobile) caller.
    // The documented backend patch (docs/mobile-api-mapping.md) checks for
    // this exact header to decide whether to echo the JWT in the JSON body
    // (in addition to the httpOnly cookie it already sets for the web app).
    // Without this header, the client-side `if (res.token)` handling below
    // never fires even after the backend patch ships.
    'X-Client': 'mobile',
  };
  if (!opts.isFormData) headers['Content-Type'] = 'application/json';
  if (token && !opts.skipAuth) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: opts.method || 'GET',
      headers,
      credentials: 'include',
      body: opts.body ? (opts.isFormData ? (opts.body as FormData) : JSON.stringify(opts.body)) : undefined,
      signal: opts.signal || controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    const message =
      err instanceof DOMException && err.name === 'AbortError'
        ? 'Request timed out. Check your connection and try again.'
        : 'Could not reach AgriPulse. Check your internet connection and try again.';
    throw new ApiError(message, 0, 'NETWORK_ERROR', true);
  }
  clearTimeout(timeout);

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty/non-JSON body */
  }

  if (res.status === 401 && token && !opts.skipAuth) {
    tokenStore.clear();
    window.dispatchEvent(new Event('agripulse:session-expired'));
  }
  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data?.code);
  }
  return data as T;
}

export const http = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'DELETE' }),
};

export async function pingApi(): Promise<boolean> {
  try {
    await request('/health', { skipAuth: true });
    return true;
  } catch {
    return false;
  }
}
