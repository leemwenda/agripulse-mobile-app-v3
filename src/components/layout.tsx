import { type ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, ChevronLeft, Home, Menu, Moon, PawPrint, Sparkles, Sun } from 'lucide-react';
import { cn } from '../utils/cn';
import { DemoModeBanner, OfflineBanner, ToastStack } from './ui';
import { useApp } from '../context/AppContext';
import { initials } from '../lib/format';
import { NotificationsApi } from '../lib/api';
import { useTheme } from '../lib/theme';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return <div className="flex h-dvh w-full overflow-hidden bg-slate-100">{children}</div>;
}

let unreadCache: { n: number; at: number } | null = null;

function HeaderIcons() {
  const navigate = useNavigate();
  const { mode } = useApp();
  const { theme, toggle } = useTheme();
  const [unread, setUnread] = useState(unreadCache ? unreadCache.n : 0);

  useEffect(() => {
    if (mode !== 'live') return;
    if (unreadCache && Date.now() - unreadCache.at < 60000) return;
    NotificationsApi.list()
      .then((r) => {
        const n = r.unread || 0;
        unreadCache = { n, at: Date.now() };
        setUnread(n);
      })
      .catch(() => {});
  }, [mode]);

  return (
    <div className="flex items-center gap-0.5">
      <button onClick={toggle} aria-label="Toggle dark mode" className="rounded-full p-2 text-slate-600 active:scale-95">
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
      <button onClick={() => navigate('/more/notifications')} aria-label="Notifications" className="relative rounded-full p-2 text-slate-600 active:scale-95">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  );
}

export function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      {onBack && (
        <button onClick={onBack} className="-ml-1.5 rounded-full p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Back">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 truncate text-base font-bold text-slate-900">{title}</h1>
      {right}
      {!onBack && <HeaderIcons />}
    </div>
  );
}

const TABS = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/farm', label: 'Animals', icon: PawPrint },
  { to: '/ai', label: 'AI Advisor', icon: Sparkles },
  { to: '/more', label: 'More', icon: Menu },
];

export function BottomNav() {
  const { user } = useApp();
  const hideFarm = user?.role === 'buyer' || user?.role === 'vet';
  const tabs = TABS.filter((t) => !(hideFarm && t.to === '/farm'));
  return (
    <nav className="sticky bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              'relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition',
              isActive ? 'text-emerald-700' : 'text-slate-400',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute top-0 h-1 w-8 rounded-b-md bg-emerald-600"
                />
              )}
              <tab.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5] text-emerald-700')} />
              <span className={cn(isActive && 'font-bold text-emerald-800')}>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SideRail() {
  const { user } = useApp();
  const hideFarm = user?.role === 'buyer' || user?.role === 'vet';
  const tabs = TABS.filter((t) => !(hideFarm && t.to === '/farm'));
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src="/brand-logo-source.png" alt="" className="keep-white h-9 w-9 rounded-lg bg-white object-contain" />
        <span className="text-base font-extrabold text-slate-900">AgriPulse</span>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-100',
              )
            }
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-slate-200 p-4">
        <RoleBadge />
      </div>
    </aside>
  );
}

export function AuthedShell({ title, children, showBack = false, right }: { title: string; children: ReactNode; showBack?: boolean; right?: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isTabRoot = ['/home', '/farm', '/ai', '/more'].includes(location.pathname);

  return (
    <PhoneFrame>
      <SideRail />
      <div className="relative flex min-w-0 flex-1 flex-col bg-slate-50">
        <OfflineBanner />
        <DemoModeBanner />
        <TopBar title={title} onBack={showBack || !isTabRoot ? () => navigate(-1) : undefined} right={right} />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-4 md:px-6 md:py-6">{children}</div>
        </div>
        <BottomNav />
        <ToastStack />
      </div>
    </PhoneFrame>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PhoneFrame>
      <div className="mx-auto flex min-w-0 w-full flex-col bg-slate-50 md:max-w-lg md:border-x md:border-slate-200 md:shadow-xl">
        <div className="flex-1 overflow-y-auto">
          <ToastStack />
          {children}
        </div>
      </div>
    </PhoneFrame>
  );
}

export function RoleBadge() {
  const { user } = useApp();
  if (!user) return null;
  const roleLabel: Record<string, string> = {
    admin: 'Farmer', worker: 'Farm Worker', buyer: 'Buyer', vet: 'Veterinarian', superadmin: 'Administrator',
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
        {initials(user.name)}
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-slate-900">{user.name}</p>
        <p className="text-[11px] text-slate-500">{roleLabel[user.role] || user.role}</p>
      </div>
    </div>
  );
}
