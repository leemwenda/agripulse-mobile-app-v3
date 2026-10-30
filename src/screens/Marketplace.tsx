import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, MapPin, Plus, Store, Eye, Phone, ShieldCheck } from 'lucide-react';
import { AuthedShell } from '../components/layout';
import { Card, EmptyState, SkeletonList, Button, FormField, TextInput, Select, Badge, TextArea } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useRemoteData } from '../lib/useRemoteData';
import { MarketApi, AnimalsApi } from '../lib/api';
import { formatDate, formatKES } from '../lib/format';
import { ErrorBanner } from './Home';

export function MarketplaceScreen() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [search, setSearch] = useState('');
  const { data, loading, error, reload } = useRemoteData(() => MarketApi.list());

  const listings = data?.listings || [];
  const filtered = useMemo(
    () => listings.filter((l) => !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.county.toLowerCase().includes(search.toLowerCase())),
    [listings, search],
  );
  const canSell = user?.role === 'admin' || user?.role === 'worker';

  return (
    <AuthedShell
      title="Marketplace"
      right={canSell ? (
        <button onClick={() => navigate('/marketplace/new')} className="rounded-full bg-emerald-700 p-2 text-white active:scale-95">
          <Plus className="h-4.5 w-4.5" />
        </button>
      ) : undefined}
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput placeholder="Search livestock or county" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading && <SkeletonList rows={3} />}

        {!loading && filtered.length === 0 && (
          <EmptyState icon={<Store className="h-6 w-6" />} title="No listings found" description="There are currently no livestock listings matching your search. This reflects the real marketplace's current state." />
        )}

        <div className="space-y-3">
          {filtered.map((l) => (
            <Card key={l.id} onClick={() => navigate(`/marketplace/${l.id}`)} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{l.title}</p>
                {l.featured && <Badge tone="warning">Featured</Badge>}
              </div>
              <p className="text-lg font-extrabold text-emerald-700">{formatKES(l.askingPrice)}{l.negotiable && <span className="ml-1 text-xs font-medium text-slate-400">(negotiable)</span>}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {l.town ? `${l.town}, ` : ''}{l.county}</span>
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {l.viewCount}</span>
              </div>
              {l.animal && <p className="text-xs text-slate-500">{l.animal.breed} · {l.animal.gender}</p>}
            </Card>
          ))}
        </div>
      </div>
    </AuthedShell>
  );
}

export function ListingDetailScreen() {
  const { id } = useParams();
  const listingId = Number(id);
  const { data, loading, error, reload } = useRemoteData(() => MarketApi.get(listingId), [listingId]);
  const listing = data?.listing;

  if (loading) return <AuthedShell title="Listing" showBack><SkeletonList rows={3} /></AuthedShell>;
  if (error) return <AuthedShell title="Listing" showBack><ErrorBanner message={error} onRetry={reload} /></AuthedShell>;
  if (!listing) return <AuthedShell title="Listing" showBack><EmptyState title="Listing not found" description="This listing may have been sold or removed." /></AuthedShell>;

  return (
    <AuthedShell title="Listing details" showBack>
      <div className="space-y-4">
        <div className="flex h-40 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Store className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{listing.title}</h2>
          <p className="mt-1 text-2xl font-extrabold text-emerald-700">{formatKES(listing.askingPrice)}</p>
          {listing.negotiable && <Badge tone="info">Price negotiable</Badge>}
        </div>
        <Card className="space-y-2 text-sm">
          <Row label="Location" value={`${listing.town ? `${listing.town}, ` : ''}${listing.county}`} />
          {listing.animal && <Row label="Breed / sex" value={`${listing.animal.breed} · ${listing.animal.gender}`} />}
          <Row label="Listed" value={formatDate(listing.createdAt)} />
          <Row label="Views" value={String(listing.viewCount)} />
          <Row label="Seller" value={listing.seller?.name || '—'} />
        </Card>
        {listing.description && (
          <Card>
            <p className="text-sm font-semibold text-slate-900">Description</p>
            <p className="mt-1 text-sm text-slate-600">{listing.description}</p>
          </Card>
        )}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <ShieldCheck className="h-4 w-4 shrink-0" /> Animal identity and ownership are verified against AgriPulse farm records.
        </div>
        {(listing.seller as any)?.phone && (
          <a href={`tel:${(listing.seller as any).phone}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white active:scale-[0.99]">
            <Phone className="h-4 w-4" /> Call seller
          </a>
        )}
      </div>
    </AuthedShell>
  );
}

export function CreateListingScreen() {
  const navigate = useNavigate();
  const { pushToast } = useApp();
  const { data: animalData } = useRemoteData(() => AnimalsApi.list());
  const [form, setForm] = useState({ animalId: '', title: '', description: '', askingPrice: '', county: '', town: '', negotiable: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError(null);
    if (!form.animalId || !form.title || !form.askingPrice || !form.county) {
      setError('Please complete all required fields.');
      return;
    }
    setSaving(true);
    try {
      await MarketApi.create({ ...form, animalId: Number(form.animalId), askingPrice: Number(form.askingPrice) } as any);
      pushToast({ title: 'Listing created', tone: 'success' });
      navigate('/marketplace', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Could not create this listing.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthedShell title="New Listing" showBack>
      <form onSubmit={submit} className="space-y-4 pb-8">
        <FormField label="Animal *">
          <Select required value={form.animalId} onChange={(e) => setForm({ ...form, animalId: e.target.value })}>
            <option value="">Select animal to sell</option>
            {(animalData?.animals || []).map((a) => <option key={a.id} value={a.id}>{a.name} ({a.tagNumber})</option>)}
          </Select>
        </FormField>
        <FormField label="Listing title *">
          <TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </FormField>
        <FormField label="Description">
          <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </FormField>
        <FormField label="Asking price (KSh) *">
          <TextInput type="number" inputMode="numeric" min="1" required value={form.askingPrice} onChange={(e) => setForm({ ...form, askingPrice: e.target.value })} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="County *">
            <TextInput required value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} />
          </FormField>
          <FormField label="Town">
            <TextInput value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} />
          </FormField>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.negotiable} onChange={(e) => setForm({ ...form, negotiable: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-emerald-700" />
          Price is negotiable
        </label>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
        <Button type="submit" fullWidth loading={saving}>Publish listing</Button>
      </form>
    </AuthedShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}
