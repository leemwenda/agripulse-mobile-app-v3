import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export interface UpdateInfo {
  versionCode: number;
  minVersionCode?: number;
  versionName: string;
  url: string;
  notes?: string;
  // iOS-only: link to the App Store listing. If absent, iOS skips the update
  // banner — iOS apps update through TestFlight / the App Store automatically.
  appStoreUrl?: string;
}
export type UpdateState =
  | { kind: 'none' }
  | { kind: 'optional'; info: UpdateInfo }
  | { kind: 'required'; info: UpdateInfo };

const VERSION_URL = 'https://agripulse.me/downloads/version.json';

export async function checkForUpdate(): Promise<UpdateState> {
  if (!Capacitor.isNativePlatform()) return { kind: 'none' };
  try {
    // iOS: no sideloading. Show banner only if an App Store URL is configured.
    if (Capacitor.getPlatform() === 'ios') {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(timer);
      if (!res.ok) return { kind: 'none' };
      const info = (await res.json()) as UpdateInfo;
      if (!info?.appStoreUrl) return { kind: 'none' };
      return { kind: 'optional', info: { ...info, url: info.appStoreUrl } };
    }

    const current = parseInt((await App.getInfo()).build, 10);
    if (!Number.isFinite(current)) return { kind: 'none' };

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (!res.ok) return { kind: 'none' };
    const info = (await res.json()) as UpdateInfo;
    if (!info || typeof info.versionCode !== 'number' || !info.url) return { kind: 'none' };

    if (typeof info.minVersionCode === 'number' && current < info.minVersionCode) return { kind: 'required', info };
    if (current < info.versionCode) return { kind: 'optional', info };
    return { kind: 'none' };
  } catch {
    return { kind: 'none' }; // offline or unreachable: never block the app
  }
}
