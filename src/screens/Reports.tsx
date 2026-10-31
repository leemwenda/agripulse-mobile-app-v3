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
      <div className="space-y-4">
        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading && <SkeletonList rows={3} />}
        {!loading && !error && trend.length === 0 && top.length === 0 && (
          <EmptyState title="No milk data yet" description="Record milk production to see reports here." />
        )}
        {trend.length > 0 && (
          <Card className="space-y-3">
            <p className="text-sm font-bold text-slate-900">Milk per month</p>
            {trend.map((t) => (
              <div key={t.month}>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{monthName(t.month)}</span>
                  <span className="font-semibold">{formatLiters(Number(t.total))}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${(Number(t.total) / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </Card>
        )}
        {top.length > 0 && (
          <Card className="space-y-2">
            <p className="text-sm font-bold text-slate-900">Top producers this month</p>
            {top.map((p, i) => (
              <div key={p.animalId} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{i + 1}. {p.animal?.name || `Animal #${p.animalId}`}</span>
                <span className="font-semibold text-emerald-700">{formatLiters(Number(p._sum.quantityLiters || 0))}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </AuthedShell>
  );
}
