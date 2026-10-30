import { useState } from 'react';

const KEY = 'agripulse.theme';
export type Theme = 'light' | 'dark';

export function getTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark');
  try { localStorage.setItem(KEY, t); } catch { /* ignore */ }
}

// Runs once when the app loads.
document.documentElement.classList.toggle('dark', getTheme() === 'dark');

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getTheme);
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };
  return { theme, toggle };
}
