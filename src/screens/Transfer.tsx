import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthedShell } from '../components/layout';
import { Button, Card, EmptyState, FormField, SkeletonList, TextArea, TextInput } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useRemoteData } from '../lib/useRemoteData';
import { AnimalsApi, TransferApi, type OwnershipTransfer } from '../lib/api';
import { formatDate, formatKES } from '../lib/format';
import { ErrorBanner } from './Home';

// --------------------------------------------------- Initiate (owner) ----
export function InitiateTransferScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useApp();
  const animalId = Number(id);
  const { data: animalData, loading: animalLoading, error: animalError, reload: reloadAnimal } = useRemoteData(() => AnimalsApi.get(animalId), [animalId]);
  const { data: historyData, reload: reloadHistory } = useRemoteData(() => TransferApi.historyForAnimal(animalId), [animalId]);
  const [form, setForm] = useState({ price: '', notes: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const animal = animalData?.animal;
  const pending: OwnershipTransfer | undefined = (historyData?.transfers || []).find((t) => t.status === 'pending');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (creating) return;
    setFormError(null);
    setCreating(true);
    try {
      const price = form.price ? Number(form.price) : undefined;
      const res = await TransferApi.initiate({ animalId, price, notes: form.notes || undefined });
      if (res.alreadyPending) {
        pushToast({ title: 'A transfer is already pending for this animal', tone: 'info' });
      } else {
        pushToast({ title: 'Transfer code created', description: 'Share the code with the buyer.', tone: 'success' });
      }
      reloadHistory();
    } catch (err: any) {
      setFormError(err?.message || 'Could not create the transfer.');
    } finally {
      setCreating(false);
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard may be unavailable */ }
  }

  async function refreshPending() {
    if (!pending) return;
    try {
      const res = await TransferApi.refreshCode(pending.id);
      pushToast({ title: 'New code generated', tone: 'success' });
      if (res.transfer?.transferCode) copyCode(res.transfer.transferCode);
      reloadHistory();
    } catch (err: any) {
      pushToast({ title: 'Could not refresh code', description: err?.message, tone: 'error' });
    }
  }

  async function cancelPending() {
    if (!pending) return;
    try {
      await TransferApi.cancel(pending.id);
      pushToast({ title: 'Transfer cancelled', tone: 'success' });
      reloadHistory();
    } catch (err: any) {
      pushToast({ title: 'Could not cancel', description: err?.message, tone: 'error' });
    }
  }

  if (animalLoading) return <AuthedShell title="Transfer ownership" showBack><SkeletonList rows={3} /></AuthedShell>;
  if (animalError) return <AuthedShell title="Transfer ownership" showBack><ErrorBanner message={animalError} onRetry={reloadAnimal} /></AuthedShell>;
  if (!animal) return <AuthedShell title="Transfer ownership" showBack><EmptyState title="Animal not found" description="This animal may have been removed." /></AuthedShell>;

  return (
    <AuthedShell title="Transfer ownership" showBack>
      <div className="space-y-4 pb-8">
        <Card>
          <p className="text-xs font-semibold text-slate-500">Animal</p>
          <p className="text-sm font-bold text-slate-900">{animal.name} · {animal.tagNumber}</p>
          <p className="text-xs text-slate-500">{animal.breed} · {animal.gender}</p>
        </Card>

        {pending ? (
          <Card className="space-y-3 border-emerald-200 bg-emerald-50">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-sm font-bold">Pending transfer</p>
            </div>
            <p className="text-xs text-emerald-900">Share this code with the buyer. They enter it from their app under &ldquo;Accept transfer&rdquo;.</p>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-white p-3">
              <span className="flex-1 font-mono text-lg font-bold tracking-widest text-emerald-900">{pending.transferCode}</span>
              <button type="button" onClick={() => copyCode(pending.transferCode)} className="rounded-lg bg-emerald-700 p-2 text-white active:scale-95" aria-label="Copy code">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {pending.price ? <p className="text-xs text-emerald-900">Asking: {formatKES(pending.price)}</p> : null}
            <div className="flex gap-2">
              <Button variant="outline" fullWidth onClick={refreshPending}>New code</Button>
              <Button variant="outline" fullWidth className="border-red-200 text-red-600" onClick={cancelPending}>Cancel transfer</Button>
            </div>
          </Card>
        ) : (
          <Card>
            <form onSubmit={create} className="space-y-3 pb-32">
              <p className="text-sm font-bold text-slate-900">Start a new transfer</p>
              <FormField label="Asking price (KSh, optional)">
                <TextInput type="number" inputMode="decimal" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </FormField>
              <FormField label="Notes for the buyer (optional)">
                <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </FormField>
              {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{formError}</div>}
              <Button type="submit" fullWidth loading={creating}>Generate transfer code</Button>
            </form>
          </Card>
        )}

        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">History</p>
          {(historyData?.transfers || []).length === 0 ? (
            <p className="text-xs text-slate-500">No transfers yet.</p>
          ) : (
            <div className="space-y-2">
              {(historyData?.transfers || []).map((t) => (
                <Card key={t.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize text-slate-800">{t.status}</span>
                    <span className="text-slate-400">{formatDate(t.createdAt)}</span>
                  </div>
                  {t.toUser?.name && <p className="text-slate-500">To: {t.toUser.name}</p>}
                  {t.price ? <p className="text-slate-500">Price: {formatKES(t.price)}</p> : null}
                </Card>
              ))}
            </div>
          )}
        </section>

        <Button variant="outline" fullWidth onClick={() => navigate(`/farm/${animalId}`, { replace: true })}>
          Back to animal
        </Button>
      </div>
    </AuthedShell>
  );
}

// ---------------------------------------------------- Accept (anyone) ----
export function AcceptTransferScreen() {
  const navigate = useNavigate();
  const { pushToast } = useApp();
  const [code, setCode] = useState('');
  const [signature, setSignature] = useState('');
  const [preview, setPreview] = useState<OwnershipTransfer | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setPreview(null);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError('Enter the transfer code.'); return; }
    setLoading(true);
    try {
      const res = await TransferApi.getByCode(trimmed);
      setPreview(res.transfer);
    } catch (err: any) {
      setError(err?.message || 'Transfer not found.');
    } finally {
      setLoading(false);
    }
  }

  async function accept() {
    if (!preview || accepting) return;
    setAccepting(true);
    setError(null);
    try {
      const res = await TransferApi.accept({ transferCode: preview.transferCode, buyerSignature: signature || undefined });
      pushToast({ title: 'Ownership transferred', description: `${res.animal?.name || 'The animal'} is now on your farm.`, tone: 'success' });
      navigate('/farm', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Could not accept this transfer.');
    } finally {
      setAccepting(false);
    }
  }

  return (
    <AuthedShell title="Accept transfer" showBack>
      <div className="space-y-4 pb-8">
        <Card>
          <p className="text-sm font-bold text-slate-900">Enter the transfer code</p>
          <p className="mt-1 text-xs text-slate-500">Ask the seller for the code from their app.</p>
          <form onSubmit={lookup} className="mt-3 space-y-3 pb-32">
            <FormField label="Transfer code">
              <TextInput
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB12CD34"
                autoCapitalize="characters"
                autoCorrect="off"
                maxLength={16}
              />
            </FormField>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
            <Button type="submit" fullWidth loading={loading}>Look up transfer</Button>
          </form>
        </Card>

        {preview && (
          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-sm font-bold">Ready to accept</p>
            </div>
            {preview.animal && (
              <div className="rounded-xl bg-slate-50 p-3 text-xs">
                <p className="font-semibold text-slate-900">{preview.animal.name} · {preview.animal.tagNumber}</p>
                <p className="text-slate-500">{preview.animal.breed}</p>
              </div>
            )}
            {preview.fromUser?.name && <p className="text-xs text-slate-500">From: {preview.fromUser.name}</p>}
            {preview.price ? <p className="text-xs text-slate-500">Asking price: {formatKES(preview.price)}</p> : null}
            {preview.notes ? <p className="text-xs text-slate-500">Notes: {preview.notes}</p> : null}
            <FormField label="Your name (optional, recorded as signature)">
              <TextInput value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Type your name to confirm" />
            </FormField>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
            <Button fullWidth loading={accepting} onClick={accept}>
              Accept ownership <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        )}
      </div>
    </AuthedShell>
  );
}
