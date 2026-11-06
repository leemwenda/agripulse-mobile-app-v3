import { useState } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { motion } from 'framer-motion';
import {
  BarChart3, Milk as MilkIcon, Stethoscope, Baby, Wallet,
  TrendingUp, TrendingDown, Download,
} from 'lucide-react';
import { AuthedShell } from '../components/layout';
import { Card, EmptyState, SkeletonList } from '../components/ui';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { useRemoteData } from '../lib/useRemoteData';
import { ReportsApi } from '../lib/api';
import type { ExportType } from '../lib/api';
import { useApp } from '../context/AppContext';
import { formatKES, formatLiters } from '../lib/format';
import { ErrorBanner } from './Home';

type Tab = 'animals' | 'milk' | 'health' | 'breeding' | 'finance';

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'animals', label: 'Animals', icon: BarChart3 },
  { id: 'milk', label: 'Milk', icon: MilkIcon },
  { id: 'health', label: 'Health', icon: Stethoscope },
  { id: 'breeding', label: 'Breeding', icon: Baby },
  { id: 'finance', label: 'Finance', icon: Wallet },
];

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0">
      <span className="text-sm text-slate-700 capitalize">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

function MiniBars({ items, valueKey, labelKey }: { items: any[]; valueKey: string; labelKey: string }) {
  if (items.length === 0) return null;
  const values = items.map((i) => Number(i[valueKey]) || 0);
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-1.5 h-24" role="img">
      {items.slice(0, 10).map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const pct = (val / max) * 100;
        return (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1 min-w-0 h-full">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(val > 0 ? 4 : 2, pct)}%` }}
              transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: i * 0.04 }}
              className="w-full max-w-[28px] rounded-t-md bg-emerald-500"
            />
            <span className="text-[9px] text-slate-500 truncate max-w-full">{String(item[labelKey] || '').slice(0, 6)}</span>
          </div>
        );
      })}
    </div>
  );
}

function AnimalsReport() {
  const { data, loading, error, reload } = useRemoteData(() => ReportsApi.animals());
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  if (loading) return <SkeletonList rows={3} />;
  if (!data) return null;

  return (
    <div className="space-y-3">
      <Card className="bg-emerald-700 text-white">
        <p className="text-xs font-semibold opacity-80">Total animals</p>
        <p className="text-3xl font-extrabold"><AnimatedCounter value={data.total} /></p>
      </Card>

      {data.byStatus.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">By status</p>
          <div className="space-y-1.5">
            {data.byStatus.map((s) => <Row key={s.status} label={s.status} value={s.count} />)}
          </div>
        </Card>
      )}

      {data.byCategory.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">By category</p>
          <MiniBars items={data.byCategory} valueKey="count" labelKey="category" />
        </Card>
      )}

      {data.byGender.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">By gender</p>
          <div className="space-y-1.5">
            {data.byGender.map((g) => <Row key={g.gender} label={g.gender} value={g.count} />)}
          </div>
        </Card>
      )}

      {data.byBreed.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">Top breeds</p>
          <div className="space-y-1.5">
            {data.byBreed.slice(0, 5).map((b) => <Row key={b.breed} label={b.breed} value={b.count} />)}
          </div>
        </Card>
      )}
    </div>
  );
}

function MilkReport() {
  const { data, loading, error, reload } = useRemoteData(() => ReportsApi.milk());
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  if (loading) return <SkeletonList rows={3} />;
  if (!data) return null;

  return (
    <div className="space-y-3">
      <Card className="bg-emerald-700 text-white">
        <p className="text-xs font-semibold opacity-80">Total production</p>
        <p className="text-3xl font-extrabold"><AnimatedCounter value={data.totalLitres} suffix=" L" decimals={1} /></p>
      </Card>

      {data.trend.length > 0 ? (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">Monthly trend</p>
          <MiniBars items={data.trend} valueKey="total" labelKey="month" />
        </Card>
      ) : (
        <EmptyState title="No milk data yet" description="Record milk production to see reports here." />
      )}

      {data.topProducers.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">Top producers</p>
          <div className="space-y-2">
            {data.topProducers.slice(0, 5).map((p) => (
              <div key={p.animalId} className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0">
                <span className="text-sm text-slate-700">
                  {p.animal?.name || `Animal #${p.animalId}`}
                  <span className="ml-1 text-xs text-slate-400">({p._count.id} records)</span>
                </span>
                <span className="text-sm font-bold text-emerald-700">{formatLiters(p._sum.quantityLiters)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function HealthReport() {
  const { data, loading, error, reload } = useRemoteData(() => ReportsApi.health());
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  if (loading) return <SkeletonList rows={3} />;
  if (!data) return null;

  return (
    <div className="space-y-3">
      <Card className="bg-emerald-700 text-white">
        <p className="text-xs font-semibold opacity-80">Total health records</p>
        <p className="text-3xl font-extrabold"><AnimatedCounter value={data.totalRecords} /></p>
      </Card>

      {data.topConditions.length > 0 ? (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">Top conditions</p>
          <MiniBars items={data.topConditions} valueKey="count" labelKey="condition" />
        </Card>
      ) : (
        <EmptyState title="No health data yet" description="Record health events to see reports here." />
      )}

      {data.topVaccinations.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">Vaccinations given</p>
          <div className="space-y-1.5">
            {data.topVaccinations.map((v) => <Row key={v.vaccination} label={v.vaccination} value={v.count} />)}
          </div>
        </Card>
      )}
    </div>
  );
}

function BreedingReport() {
  const { data, loading, error, reload } = useRemoteData(() => ReportsApi.breeding());
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  if (loading) return <SkeletonList rows={3} />;
  if (!data) return null;

  return (
    <div className="space-y-3">
      <Card className="bg-emerald-700 text-white">
        <p className="text-xs font-semibold opacity-80">Total breeding records</p>
        <p className="text-3xl font-extrabold"><AnimatedCounter value={data.totalRecords} /></p>
      </Card>

      {data.byStatus.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">By status</p>
          <div className="space-y-1.5">
            {data.byStatus.map((s) => <Row key={s.status} label={s.status.replace(/_/g, ' ')} value={s.count} />)}
          </div>
        </Card>
      )}

      {data.upcomingBirths.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">Upcoming births</p>
          <div className="space-y-2">
            {data.upcomingBirths.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{b.animal?.name || 'Animal'}</p>
                  <p className="text-[11px] text-slate-500">{(b.expectedBirthDate || '').slice(0, 10) || '—'}</p>
                </div>
                <span className={`text-xs font-bold ${b.daysUntil !== null && b.daysUntil <= 3 ? 'text-red-600' : 'text-amber-600'}`}>
                  {b.daysUntil !== null ? `${b.daysUntil}d` : '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.byStatus.length === 0 && data.upcomingBirths.length === 0 && (
        <EmptyState title="No breeding data yet" description="Record breeding events to see reports here." />
      )}
    </div>
  );
}

function FinanceReport() {
  const { data, loading, error, reload } = useRemoteData(() => ReportsApi.finance());
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  if (loading) return <SkeletonList rows={3} />;
  if (!data) return null;

  const profitPositive = data.profit >= 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> Income
          </span>
          <span className="text-lg font-extrabold text-slate-900">
            <AnimatedCounter value={data.totalIncome} format={(n) => formatKES(n)} />
          </span>
        </Card>
        <Card className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <TrendingDown className="h-3.5 w-3.5 text-red-500" /> Expense
          </span>
          <span className="text-lg font-extrabold text-slate-900">
            <AnimatedCounter value={data.totalExpense} format={(n) => formatKES(n)} />
          </span>
        </Card>
      </div>

      <Card className={profitPositive ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'}>
        <p className="text-xs font-semibold opacity-80">Profit</p>
        <p className="text-3xl font-extrabold">
          <AnimatedCounter value={data.profit} format={(n) => formatKES(n)} />
        </p>
      </Card>

      {data.byCategory.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">By category</p>
          <div className="space-y-1.5">
            {data.byCategory.map((c, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0">
                <span className="text-sm text-slate-700">{c.category}</span>
                <span className={`text-sm font-bold ${c.type === 'income' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {c.type === 'income' ? '+' : '-'}{formatKES(c.total)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.trend.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-bold text-slate-900">Monthly trend</p>
          <MiniBars items={data.trend} valueKey="total" labelKey="month" />
        </Card>
      )}

      {data.byCategory.length === 0 && data.trend.length === 0 && (
        <EmptyState title="No finance data yet" description="Record transactions to see reports here." />
      )}
    </div>
  );
}

const EXPORT_TYPE: Record<Tab, ExportType> = {
  animals: 'animals',
  milk: 'milk',
  health: 'health',
  breeding: 'breeding',
  finance: 'financial',
};

export function ReportsScreen() {
  const [tab, setTab] = useState<Tab>('animals');
  const { pushToast } = useApp();
  const [exporting, setExporting] = useState(false);

  async function handleDownload() {
    if (exporting) return;
    setExporting(true);
    try {
      const { text, filename } = await ReportsApi.export(EXPORT_TYPE[tab]);
      const body = text.charCodeAt(0) === 0xfeff ? text : '\ufeff' + text;
      const saved = await Filesystem.writeFile({
        path: filename,
        data: body,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({ title: filename, url: saved.uri, dialogTitle: 'Save or share CSV' });
    } catch (e: any) {
      const msg = String(e?.message || e || '');
      if (!/cancel/i.test(msg)) pushToast({ title: 'Export failed', description: msg, tone: 'error' });
    } finally {
      setExporting(false);
    }
  }

  return (
    <AuthedShell
      title="Reports"
      showBack
      right={
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleDownload}
          disabled={exporting}
          aria-label="Download CSV"
          className="rounded-full bg-emerald-700 p-2 text-white disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
        </motion.button>
      }
    >
      <div className="space-y-4 pb-8">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 min-w-fit items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  active ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'animals' && <AnimalsReport />}
        {tab === 'milk' && <MilkReport />}
        {tab === 'health' && <HealthReport />}
        {tab === 'breeding' && <BreedingReport />}
        {tab === 'finance' && <FinanceReport />}
      </div>
    </AuthedShell>
  );
}
