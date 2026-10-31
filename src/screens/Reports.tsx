import { AuthedShell } from '../components/layout';
import { Card, EmptyState, SkeletonList } from '../components/ui';
import { useRemoteData } from '../lib/useRemoteData';
import { ReportsApi } from '../lib/api';
import { formatLiters } from '../lib/format';
import { ErrorBanner } from './Home';

export function ReportsScreen() {
  const { data, loading, error, reload } = useRemoteData(() => ReportsApi.milk());
  const trend = data?.trend || [];
  const top = data?.topProducers || [];
  const max = Math.max(1, ...trend.map((t) => Number(t.total)));
  const monthName = (m: string) => new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });

  return (
    <AuthedShell title="Reports" showBack>
      <div className="space-y-4 pb-8">
        <Card className="bg-emerald-700 text-white">
          <p className="text-sm font-bold">Milk Production</p>
          <p className="mt-1 text-xs opacity-80">6-month trend and top producers</p>
        </Card>

        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading && <SkeletonList rows={4} />}

        {!loading && trend.length === 0 && top.length === 0 && (
          <EmptyState title="No milk data yet" description="Record milk production to see reports here." />
        )}

        {trend.length > 0 && (
          <Card>
            <p className="mb-3 text-sm font-bold text-slate-900">Trend (Litres)</p>
            <div className="flex items-end gap-2 h-32">
              {trend.map((t) => (
                <div key={t.month} className="flex flex-1 flex-col items-center justify-end h-full gap-1">
                  <div className="w-full rounded-t-sm bg-emerald-500" style={{ height: `${(Number(t.total) / max) * 100}%` }} />
                  <span className="text-[10px] text-slate-500">{monthName(t.month)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {top.length > 0 && (
          <Card>
            <p className="mb-2 text-sm font-bold text-slate-900">Top Producers (This month)</p>
            <div className="space-y-2">
              {top.map((p) => (
                <div key={p.animalId} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-sm text-slate-700">{p.animal?.name || 'Animal'} <span className="text-xs text-slate-400">({p.animal?.tagNumber})</span></span>
                  <span className="text-sm font-bold text-emerald-700">{formatLiters(Number(p._sum.quantityLiters || 0))}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AuthedShell>
  );
}
