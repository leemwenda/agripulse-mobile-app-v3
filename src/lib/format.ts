// Shared formatting helpers — Kenyan context (KSh currency, Africa/Nairobi time)

export const TIMEZONE = 'Africa/Nairobi';

export function formatKES(amount: number | null | undefined): string {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('KES', 'KSh')
    .replace('Ksh', 'KSh');
}

export function formatLiters(value: number | null | undefined): string {
  return `${Number(value ?? 0).toLocaleString('en-KE', { maximumFractionDigits: 1 })} L`;
}

export function formatDate(iso: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: TIMEZONE,
      ...opts,
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-KE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: TIMEZONE,
    });
  } catch {
    return iso;
  }
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const target = new Date(iso);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function ageFromDOB(iso: string | null | undefined): string {
  if (!iso) return '—';
  const dob = new Date(iso);
  const now = new Date();
  let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  if (months < 0) months = 0;
  if (months < 1) return 'Newborn';
  if (months < 24) return `${months} mo`;
  return `${Math.floor(months / 12)} yr ${months % 12} mo`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
