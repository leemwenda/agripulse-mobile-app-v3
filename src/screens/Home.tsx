import { useNavigate } from 'react-router-dom';
import {
  Milk, Stethoscope, Syringe, PawPrint, Sparkles, PlusCircle, AlertTriangle,
  Baby, TrendingDown, ArrowRight, Wallet,
} from 'lucide-react';
import { AuthedShell } from '../components/layout';
import { Card, SectionHeader, StatCard, SkeletonList, EmptyState, Button } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useRemoteData } from '../lib/useRemoteData';
import { DashboardApi } from '../lib/api';
import { formatKES, formatLiters, formatDate, daysUntil } from '../lib/format';

interface PriorityItem {
  id: string;
  tone: 'danger' | 'warning' | 'info';
  icon: typeof AlertTriangle;
  title: string;
  description: string;
  action: () => void;
}

export function HomeScreen() {
  const { user } = useApp();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useRemoteData(() => DashboardApi.get());

  const priorities: PriorityItem[] = [];
  if (data) {
    for (const b of data.upcomingBirths) {
      const d = daysUntil(b.expectedBirthDate);
      if (d !== null && d <= 14) {
        priorities.push({
          id: `calving-${b.id}`,
          tone: d <= 3 ? 'danger' : 'warning',
          icon: Baby,
          title: `${b.animal?.name || 'Animal'} expected to calve ${d <= 0 ? 'any day now' : `in ${d} day${d === 1 ? '' : 's'}`}`,
          description: `Expected birth date: ${formatDate(b.expectedBirthDate)}. Prepare a clean calving area and monitor closely.`,
          action: () => navigate('/farm/breeding'),
        });
      }
    }
    if (data.weeklyTrend.length >= 3) {
      const last = data.weeklyTrend[data.weeklyTrend.length - 1]?._sum.quantityLiters ?? 0;
      const avgPrev = data.weeklyTrend.slice(0, -1).reduce((s, d) => s + (d._sum.quantityLiters || 0), 0) / Math.max(1, data.weeklyTrend.length - 1);
      if (avgPrev > 0 && last < avgPrev * 0.8) {
        priorities.push({
          id: 'milk-decline',
          tone: 'warning',
          icon: TrendingDown,
          title: 'Milk production dropped versus this week\'s average',
          description: `Today's recorded total (${formatLiters(last)}) is notably below the recent daily average (${formatLiters(avgPrev)}). Check feed, water and animal health.`,
          action: () => navigate('/farm/milk'),
        });
      }
    }
    if (data.stats.totalAnimals === 0) {
      priorities.push({
        id: 'no-animals',
        tone: 'info',
        icon: PawPrint,
        title: 'Register your first animal',
        description: 'Your farm has no registered animals yet. Add one to start tracking milk, health and breeding.',
        action: () => navigate('/farm/new'),
      });
    }
  }

  return (
    <AuthedShell title={`Hi, ${user?.name?.split(' ')[0] || 'there'}`}>
      <div className="space-y-5 pb-4">
        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading && <SkeletonList rows={3} />}

        {data && (
          <>
            <section>
              <SectionHeader title="Farm snapshot" />
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Registered animals" value={data.stats.totalAnimals} hint={`${data.stats.femaleAnimals} female · ${data.stats.maleAnimals} male`} onClick={() => navigate('/farm')} />
                <StatCard label="Milk today" value={formatLiters(data.stats.todayMilk)} hint={`${formatLiters(data.stats.monthMilk)} this month`} onClick={() => navigate('/farm/milk')} />
                <StatCard label="Pregnant animals" value={data.stats.activePregnant} hint="Active pregnancies" onClick={() => navigate('/farm/breeding')} />
                <StatCard label="Profit (this month)" value={formatKES(data.stats.monthProfit)} hint={`${formatKES(data.stats.monthIncome)} in · ${formatKES(data.stats.monthExpense)} out`} onClick={() => navigate('/farm/finance')} />
              </div>
            </section>

            <section>
              <SectionHeader title="Needs your attention" />
              {priorities.length === 0 ? (
                <EmptyState title="All caught up" description="No urgent items right now. Great work keeping records up to date." />
              ) : (
                <div className="space-y-2.5">
                  {priorities.map((p) => (
                    <Card key={p.id} onClick={p.action} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${p.tone === 'danger' ? 'bg-red-100 text-red-600' : p.tone === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                        <p.icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{p.description}</p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <SectionHeader title="Quick actions" />
              <div className="grid grid-cols-2 gap-3">
                <QuickAction icon={PawPrint} label="Register animal" onClick={() => navigate('/farm/new')} />
                <QuickAction icon={Milk} label="Record milk" onClick={() => navigate('/farm/milk')} />
                <QuickAction icon={Stethoscope} label="Record treatment" onClick={() => navigate('/farm/health')} />
                <QuickAction icon={Syringe} label="Breeding record" onClick={() => navigate('/farm/breeding')} />
                <QuickAction icon={Sparkles} label="Ask AI Advisor" onClick={() => navigate('/ai')} />
                <QuickAction icon={Wallet} label="Finance" onClick={() => navigate('/farm/finance')} />
              </div>
            </section>

            {data.recentHealth.length > 0 && (
              <section>
                <SectionHeader title="Recent health events" action={<button onClick={() => navigate('/farm/health')} className="text-xs font-semibold text-emerald-700">View all</button>} />
                <div className="space-y-2.5">
                  {data.recentHealth.slice(0, 3).map((h) => (
                    <Card key={h.id}>
                      <p className="text-sm font-semibold text-slate-900">{h.animal?.name || 'Animal'} · {h.condition}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{formatDate(h.recordDate)}{h.doctorName ? ` · ${h.doctorName}` : ''}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

      </div>
    </AuthedShell>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof PlusCircle; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm active:scale-[0.98]">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </button>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="flex items-start gap-3 border-red-200 bg-red-50">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-800">Couldn't load live data</p>
        <p className="mt-0.5 text-xs text-red-600">{message}</p>
        <Button size="sm" variant="outline" className="mt-2 border-red-300 text-red-700" onClick={onRetry}>Retry</Button>
      </div>
    </Card>
  );
}
