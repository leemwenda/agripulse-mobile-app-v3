import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, useState } from 'react';
import { cn } from '../utils/cn';
import { AlertTriangle, CheckCircle2, Info, Inbox, Loader2, X, Leaf } from 'lucide-react';
import { useApp } from '../context/AppContext';

// -------------------------------------------------------------- BrandLogo --
// Loads the real logo from the live site (same asset used on agripulse.me)
// so the app always shows the current brand mark, no bundled copy to keep
// in sync. Falls back to the leaf mark if the device is offline on first
// load or the asset is unreachable, so the splash/login screens never show
// a broken image.
export function BrandLogo({ size = 56 }: { size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-lg shadow-emerald-900/20"
        style={{ height: size, width: size }}
      >
        <Leaf className="h-1/2 w-1/2" />
      </div>
    );
  }
  return (
    <img
      src="/brand-logo-source.png"
      alt="AgriPulse"
      onError={() => setFailed(true)}
      className="keep-white rounded-2xl bg-white object-contain p-1.5 shadow-lg shadow-emerald-900/20"
      style={{ height: size, width: size }}
    />
  );
}

// ---------------------------------------------------------------- Button ---
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}
export function Button({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';
  const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-4 text-sm', lg: 'h-12 px-5 text-base' };
  const variants = {
    primary: 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-800',
    secondary: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button
      className={cn(base, sizes[size], variants[variant], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// ------------------------------------------------------------------ Card ---
export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn('rounded-2xl border border-slate-200 bg-white p-4 shadow-sm', onClick && 'cursor-pointer active:scale-[0.99] transition', className)}
    >
      {children}
    </div>
  );
}

// --------------------------------------------------------------- Badges ---
const toneMap = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
};
export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof toneMap; children: ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', toneMap[tone])}>{children}</span>;
}

// ----------------------------------------------------------- Status Pill ---
export function StatusPill({ status }: { status: string }) {
  const map: Record<string, keyof typeof toneMap> = {
    active: 'success', pending: 'warning', overdue: 'danger', due_today: 'warning',
    completed: 'success', cancelled: 'neutral', sold: 'info', pregnant: 'info',
    confirmed: 'info', failed: 'danger', calved: 'success', expired: 'neutral', removed: 'neutral',
  };
  const label = status.replace(/_/g, ' ');
  return <Badge tone={map[status] || 'neutral'}>{label}</Badge>;
}

// -------------------------------------------------------------- Section ---
export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------- Stat ----
export function StatCard({ label, value, hint, onClick }: { label: string; value: ReactNode; hint?: string; onClick?: () => void }) {
  return (
    <Card onClick={onClick} className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-xl font-extrabold text-slate-900">{value}</span>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </Card>
  );
}

// ------------------------------------------------------------- Empty State -
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// -------------------------------------------------------------- Skeleton --
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200', className)} />;
}
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </Card>
      ))}
    </div>
  );
}

// ------------------------------------------------------------ Form Field --
export function FormField({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-slate-400">{hint}</span>}
      {error && <span className="block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}
const fieldBase = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 h-11 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';
export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldBase, props.className)} />;
}
export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldBase, 'h-auto min-h-[88px] py-2.5', props.className)} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(fieldBase, props.className)} />;
}

// --------------------------------------------------------------- Modal ----
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-32 shadow-2xl animate-[slideUp_0.22s_ease-out]"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open, title, description, confirmLabel = 'Confirm', tone = 'primary', onConfirm, onCancel, loading,
}: {
  open: boolean; title: string; description: string; confirmLabel?: string; tone?: 'primary' | 'danger';
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" fullWidth onClick={onCancel}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} fullWidth onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Toasts --
export function ToastStack() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
        >
          {t.tone === 'success' && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
          {t.tone === 'error' && <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
          {t.tone === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">{t.title}</p>
            {t.description && <p className="text-xs text-slate-500">{t.description}</p>}
          </div>
          <button onClick={() => dismissToast(t.id)} className="text-slate-300 hover:text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------- Banners ---
export function DemoModeBanner() {
  const { mode, apiReachable } = useApp();
  if (mode !== 'demo') return null;
  return (
    <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-900">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>
        Demo Mode — showing sample farm data, not your live AgriPulse account.
        {apiReachable === false && ' Live API unreachable from this preview.'}
      </span>
    </div>
  );
}

export function OfflineBanner() {
  const { isOnline } = useApp();
  if (isOnline) return null;
  return (
    <div className="bg-slate-800 px-4 py-2 text-center text-xs font-semibold text-white">
      You are offline. Showing last loaded data where available.
    </div>
  );
}
