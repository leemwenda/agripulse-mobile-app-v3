import { useCallback, useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Download, X } from 'lucide-react';
import { checkForUpdate, type UpdateState } from '../lib/updates';

const DISMISS_KEY = 'agripulse.update.dismissed';

export function UpdateGate() {
  const [state, setState] = useState<UpdateState>({ kind: 'none' });
  const [dismissed, setDismissed] = useState<number>(() => {
    try { return Number(localStorage.getItem(DISMISS_KEY)) || 0; } catch { return 0; }
  });

  const run = useCallback(async () => setState(await checkForUpdate()), []);

  useEffect(() => {
    run();
    const sub = App.addListener('appStateChange', (s) => { if (s.isActive) run(); });
    return () => { sub.then((h) => h.remove()); };
  }, [run]);

  if (state.kind === 'none') return null;
  const { info } = state;
  const open = () => Browser.open({ url: info.url });

  if (state.kind === 'required') {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-slate-900/95 px-8 text-center text-white">
        <Download className="h-10 w-10 text-green-400" />
        <h2 className="text-xl font-extrabold">Update required</h2>
        <p className="text-sm text-white/70">
          Version {info.versionName} is needed to keep using AgriPulse.{info.notes ? ` ${info.notes}` : ''}
        </p>
        <button onClick={open} className="w-full max-w-xs rounded-xl bg-green-600 py-3.5 text-[15px] font-bold">Update now</button>
      </div>
    );
  }

  if (dismissed >= info.versionCode) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[100] p-3">
      <div className="mx-auto flex max-w-[420px] items-start gap-3 rounded-2xl border border-green-500/30 bg-slate-900 p-3.5 text-white shadow-xl">
        <Download className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Update available · v{info.versionName}</p>
          {info.notes && <p className="mt-0.5 text-xs text-white/70">{info.notes}</p>}
          <button onClick={open} className="mt-2 rounded-lg bg-green-600 px-3.5 py-1.5 text-xs font-bold">Update now</button>
        </div>
        <button
          aria-label="Dismiss"
          onClick={() => { try { localStorage.setItem(DISMISS_KEY, String(info.versionCode)); } catch { /* ignore */ } setDismissed(info.versionCode); }}
          className="rounded-full p-1 text-white/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
