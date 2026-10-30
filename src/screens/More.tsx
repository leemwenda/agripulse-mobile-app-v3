import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Milk, Stethoscope, Syringe, Wallet, Bell, User, Settings, HelpCircle, LogOut,
  ChevronRight, Users, FileText, Moon,
} from 'lucide-react';
import { AuthedShell } from '../components/layout';
import { Card, EmptyState, Button, ConfirmDialog, SkeletonList } from '../components/ui';
import { useApp } from '../context/AppContext';
import { formatDateTime, initials } from '../lib/format';
import { useRemoteData } from '../lib/useRemoteData';
import { NotificationsApi } from '../lib/api';
import { ErrorBanner } from './Home';
import { useTheme } from '../lib/theme';

export function MoreScreen() {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const roleLabel: Record<string, string> = { admin: 'Farmer', worker: 'Farm Worker', buyer: 'Buyer', vet: 'Veterinarian', superadmin: 'Administrator' };
  const isFarm = user?.role === 'admin' || user?.role === 'worker';

  const items = [
    isFarm && { icon: Milk, label: 'Milk production', to: '/farm/milk' },
    isFarm && { icon: Stethoscope, label: 'Animal health', to: '/farm/health' },
    isFarm && { icon: Syringe, label: 'Breeding', to: '/farm/breeding' },
    isFarm && { icon: Wallet, label: 'Finance', to: '/farm/finance' },
    isFarm && user?.role === 'admin' && { icon: Users, label: 'Farm workers', to: '/more/workers' },
    { icon: Bell, label: 'Notifications', to: '/more/notifications' },
    { icon: FileText, label: 'Reports', to: '/more/reports' },
    { icon: User, label: 'Profile', to: '/more/profile' },
    { icon: Settings, label: 'Settings', to: '/more/settings' },
    { icon: HelpCircle, label: 'Help & support', to: '/more/help' },
  ].filter(Boolean) as { icon: typeof Milk; label: string; to: string }[];

  return (
    <AuthedShell title="More">
      <div className="space-y-4">
        <Card onClick={() => navigate('/more/profile')} className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
            {user ? initials(user.name) : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user ? roleLabel[user.role] : ''} {user?.farmName ? `· ${user.farmName}` : ''}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Card>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {items.map((item, i) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${i !== items.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <item.icon className="h-4.5 w-4.5 text-slate-500" />
              <span className="flex-1 text-sm font-medium text-slate-800">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </button>
          ))}
        </div>

        <Button variant="outline" fullWidth className="border-red-200 text-red-600" onClick={() => setConfirmLogout(true)}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>

        <p className="pb-4 text-center text-[11px] text-slate-400">AgriPulse Mobile · v1.0.0</p>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Sign out?"
        description="You will need to sign in again to access your farm data."
        confirmLabel="Sign out"
        tone="danger"
        onConfirm={() => { setConfirmLogout(false); logout(); navigate('/login', { replace: true }); }}
        onCancel={() => setConfirmLogout(false)}
      />
    </AuthedShell>
  );
}

export function NotificationsScreen() {
  const { data, loading, error, reload } = useRemoteData(() => NotificationsApi.list());
  const notifications = data?.notifications || [];
  const dot: Record<string, string> = { danger: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-sky-500' };
  return (
    <AuthedShell title="Notifications" showBack>
      <div className="space-y-2.5">
        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading && <SkeletonList rows={3} />}
        {!loading && !error && notifications.length === 0 && (
          <EmptyState icon={<Bell className="h-6 w-6" />} title="No notifications" description="Important farm events and reminders will appear here." />
        )}
        {notifications.map((n) => (
          <Card key={n.id} className="flex items-start gap-3">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot[n.type] || 'bg-sky-500'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{n.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
              <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</p>
            </div>
          </Card>
        ))}
      </div>
    </AuthedShell>
  );
}

export function ProfileScreen() {
  const { user } = useApp();
  if (!user) return null;
  return (
    <AuthedShell title="Profile" showBack>
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-700 text-2xl font-bold text-white">
            {initials(user.name)}
          </div>
          <p className="text-base font-bold text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <Card className="space-y-2 text-sm">
          <Row label="Role" value={user.role} />
          <Row label="Farm" value={user.farmName || '—'} />
          <Row label="County" value={user.county || '—'} />
          <Row label="Phone" value={user.phone || '—'} />
        </Card>
      </div>
    </AuthedShell>
  );
}

export function SettingsScreen() {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const { theme, toggle } = useTheme();
  return (
    <AuthedShell title="Settings" showBack>
      <div className="space-y-3">
        <ToggleRow icon={Bell} label="Push notifications" description="Vaccination, calving and marketplace alerts" checked={notifEnabled} onChange={setNotifEnabled} />
        <ToggleRow icon={Moon} label="Dark mode" description="Use a dark colour theme" checked={theme === 'dark'} onChange={() => toggle()} />
        <Card>
          <p className="text-sm font-semibold text-slate-900">Measurement units</p>
          <p className="mt-0.5 text-xs text-slate-500">Liters (L) for milk · Kenyan Shillings (KSh) for currency</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-900">API endpoint</p>
          <p className="mt-0.5 break-all text-xs text-slate-500">{(import.meta as any).env?.VITE_API_BASE_URL || 'https://agripulse.me/api'}</p>
        </Card>
      </div>
    </AuthedShell>
  );
}

export function PlaceholderScreen({ title, description }: { title: string; description: string }) {
  return (
    <AuthedShell title={title} showBack>
      <EmptyState title={title} description={description} />
    </AuthedShell>
  );
}

function ToggleRow({ icon: Icon, label, description, checked, onChange, disabled }: { icon: typeof Bell; label: string; description: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Card className="flex items-center gap-3">
      <Icon className="h-5 w-5 shrink-0 text-slate-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${checked ? 'bg-emerald-600' : 'bg-slate-300'}`}
      >
        <span className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800 capitalize">{value}</span>
    </div>
  );
}
