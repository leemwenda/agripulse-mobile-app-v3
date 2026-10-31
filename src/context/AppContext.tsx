import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import type { AuthUser } from '../types';
import { AuthApi, clearSession } from '../lib/api';
import { tokenStore, pingApi } from '../lib/httpClient';
import { isNativeApp, parseAuthCallbackUrl, closeGoogleSignIn } from '../lib/googleAuth';

export type SessionMode = 'checking' | 'live' | 'demo' | 'signed-out';

interface AppContextValue {
  mode: SessionMode;
  user: AuthUser | null;
  isOnline: boolean;
  apiReachable: boolean | null;
  toasts: Toast[];
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  login: (email: string, password: string, remember: boolean) => Promise<{ ok: boolean; error?: string }>;
  loginWithToken: (token: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  setUser: (u: AuthUser) => void;
}

interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: 'success' | 'error' | 'info';
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SessionMode>('checking');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiReachable, setApiReachable] = useState<boolean | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastId = 0;

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++toastId + Date.now();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    const onExpired = () => {
      clearSession();
      setUser(null);
      if (mode === 'live') {
        setMode('signed-out');
        pushToast({ title: 'Session expired', description: 'Please sign in again.', tone: 'info' });
      }
    };
    window.addEventListener('agripulse:session-expired', onExpired);
    return () => window.removeEventListener('agripulse:session-expired', onExpired);
  }, [mode, pushToast]);

  useEffect(() => {
    (async () => {
      const reachable = await pingApi();
      setApiReachable(reachable);

      sessionStorage.removeItem('agripulse.mobile.mode');
      await tokenStore.init();
      if (tokenStore.get()) {
        try {
          const res = await AuthApi.me();
          setUser(res.user);
          setMode('live');
          return;
        } catch {
          clearSession();
        }
      }
      setMode('signed-out');
    })();
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    try {
      const res = await AuthApi.login(email, password, remember);
      if (res.token) tokenStore.set(res.token);
      setUser(res.user);
      setMode('live');
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Login failed.' };
    }
  }, []);

  // Shared by Google sign-in (and any other future flow that ends with a
  // bearer token already in hand, e.g. a deep link) — stores the token and
  // fetches the real user record from the server rather than trusting
  // anything embedded in the URL itself.
  const loginWithToken = useCallback(async (token: string) => {
    tokenStore.set(token);
    try {
      const res = await AuthApi.me();
      setUser(res.user);
      setMode('live');
      return { ok: true };
    } catch (err: any) {
      clearSession();
      return { ok: false, error: err?.message || 'Sign-in failed.' };
    }
  }, []);

  // Google sign-in deep-link callback (native app only). The backend's
  // OAuth callback redirects the system browser to
  // me.agripulse.app://auth/callback?token=... once sign-in completes —
  // see docs/mobile-google-signin.md. This listener catches that and
  // finishes the login the same way email/password login does.
  useEffect(() => {
    if (!isNativeApp()) return;
    
    // Handle Android hardware back button
    const backSub = CapacitorApp.addListener('backButton', () => {
      const event = new Event('agripulse:hardware-back', { cancelable: true });
      const notHandled = window.dispatchEvent(event);
      // If a modal didn't prevent default, let the web router handle the back navigation
      if (notHandled) {
        window.history.back();
      }
    });

    const sub = CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
      const { token, error } = parseAuthCallbackUrl(url);
      await closeGoogleSignIn();
      if (token) {
        const res = await loginWithToken(token);
        if (res.ok) pushToast({ title: 'Signed in with Google', tone: 'success' });
        else pushToast({ title: 'Google sign-in failed', description: res.error, tone: 'error' });
      } else if (error) {
        pushToast({ title: 'Google sign-in failed', description: error, tone: 'error' });
      }
    });
    return () => {
      backSub.then((s) => s.remove());
      sub.then((s) => s.remove());
    };
  }, [loginWithToken, pushToast]);

  const logout = useCallback(() => {
    sessionStorage.removeItem('agripulse.mobile.mode');
    clearSession();
    if (mode === 'live') {
      AuthApi.logout().catch(() => {});
    }
    setUser(null);
    setMode('signed-out');
  }, [mode]);

  const value = useMemo(
    () => ({ mode, user, isOnline, apiReachable, toasts, pushToast, dismissToast, login, loginWithToken, logout, setUser }),
    [mode, user, isOnline, apiReachable, toasts, pushToast, dismissToast, login, loginWithToken, logout, setUser],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
