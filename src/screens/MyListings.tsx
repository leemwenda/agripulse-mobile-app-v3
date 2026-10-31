import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Eye, Users } from 'lucide-react';
import { AuthedShell } from '../components/layout';
import { Card, EmptyState, SkeletonList, StatusPill } from '../components/ui';
import { useRemoteData } from '../lib/useRemoteData';
import { MarketApi } from '../lib/api';
import { API_BASE_URL } from '../lib/httpClient';
import { formatKES } from '../lib/format';
import { ErrorBanner } from './Home';

type Filter = 'all' | 'active' | 'sold';

export function MyListingsScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const { data, loading, error, reload } = useRemoteData(() => MarketApi.myListings());

  const listings = (data?.listings || []) as any[];
  const isSold = (l: any) => String(l.status || '').toLowerCase() === 'sold';
  const filtered = useMemo(
    () => listings.filter((l) => filter === 'all' || (filter === 'sold' ? isSold(l) : !isSold(l))),
    [listings, filter],
  );
  const base = API_BASE_URL.replace(/\/api$/, '');

  return (
    <AuthedShell title="My Listings" showBack>
      <div className="space-y-4">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {(['all', 'active', 'sold'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold capitalize transition ${filter === f ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading && <SkeletonList rows={3} />}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={<Store className="h-6 w-6" />}
            title={filter === 'sold' ? 'Nothing sold yet' : 'No listings'}
            description={filter === 'sold' ? 'Animals you sell on the marketplace will appear here.' : 'Animals you list on the marketplace will appear here.'}
          />
        )}

        <div className="space-y-3">
          {filtered.map((l) => {
            const photo = l.animal?.photos?.[0]?.url;
            const offers = (l.offers || []) as any[];
            return (
              <Card key={l.id} onClick={() => navigate(`/marketplace/${l.id}`)} className="space-y-2">
                <div className="flex gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 text-emerald-700">
                    {photo ? <img src={base + photo} alt="" className="h-full w-full object-cover" /> : <Store className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-bold text-slate-900">{l.title}</p>
                      {l.status && <StatusPill status={String(l.status)} />}
                    </div>
                    <p className="text-base font-extrabold text-emerald-700">{formatKES(l.askingPrice)}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {l.county}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {l.viewCount}</span>
                    </div>
                  </div>
                </div>
                {offers.length > 0 && (
                  <div className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">
                    <p className="flex items-center gap-1 font-semibold"><Users className="h-3.5 w-3.5" /> {offers.length} pending offer{offers.length > 1 ? 's' : ''}</p>
                    {offers.slice(0, 3).map((o) => (
                      <p key={o.id} className="mt-0.5">{o.buyer?.name || 'Buyer'}{o.amount ? ` · ${formatKES(o.amount)}` : ''}</p>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </AuthedShell>
  );
}
