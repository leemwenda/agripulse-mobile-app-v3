import { useState } from 'react';
import { Plus, UserCircle2, KeyRound } from 'lucide-react';
import { AuthedShell } from '../components/layout';
import { Button, Card, ConfirmDialog, EmptyState, FormField, Sheet, SkeletonList, TextInput } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useRemoteData } from '../lib/useRemoteData';
import { WorkersApi, type FarmWorker } from '../lib/api';
import { formatDate } from '../lib/format';
import { ErrorBanner } from './Home';

type Editing = { worker: FarmWorker | null } | null;

export function WorkersScreen() {
  const { user, pushToast } = useApp();
  const isOwner = user?.role === 'admin';
  const { data, loading, error, reload } = useRemoteData(() => WorkersApi.list());
  const [editing, setEditing] = useState<Editing>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toRemove, setToRemove] = useState<FarmWorker | null>(null);

  const workers = data?.workers || [];

  function openAdd() {
    setForm({ name: '', email: '', password: '' });
    setFormError(null);
    setEditing({ worker: null });
  }
  function openEdit(w: FarmWorker) {
    setForm({ name: w.name, email: w.email, password: '' });
    setFormError(null);
    setEditing({ worker: w });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !editing) return;
    setFormError(null);
    if (!form.name.trim() || !form.email.trim()) { setFormError('Name and email are required.'); return; }
    if (!editing.worker && form.password.length < 8) { setFormError('Password must be at least 8 characters.'); return; }
    if (editing.worker && form.password && form.password.length < 8) { setFormError('New password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      if (editing.worker) {
        await WorkersApi.update(editing.worker.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          status: editing.worker.isActive ? 'active' : 'inactive',
          ...(form.password ? { password: form.password } : {}),
        });
        pushToast({ title: 'Worker updated', tone: 'success' });
      } else {
        await WorkersApi.create({ name: form.name.trim(), email: form.email.trim(), password: form.password });
        pushToast({ title: 'Worker added', description: 'An invitation email was sent.', tone: 'success' });
      }
      setEditing(null);
      reload();
    } catch (err: any) {
      setFormError(err?.message || 'Could not save this worker.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(w: FarmWorker) {
    try {
      await WorkersApi.update(w.id, { name: w.name, email: w.email, status: w.isActive ? 'inactive' : 'active' });
      pushToast({ title: w.isActive ? 'Worker deactivated' : 'Worker reactivated', tone: 'success' });
      reload();
    } catch (err: any) {
      pushToast({ title: 'Could not update', description: err?.message, tone: 'error' });
    }
  }

  async function confirmRemove() {
    if (!toRemove) return;
    const w = toRemove;
    setToRemove(null);
    try {
      await WorkersApi.remove(w.id);
      pushToast({ title: 'Worker removed', tone: 'success' });
      reload();
    } catch (err: any) {
      pushToast({ title: 'Could not remove', description: err?.message, tone: 'error' });
    }
  }

  return (
    <AuthedShell
      title="Farm Workers"
      showBack
      right={isOwner ? (
        <button onClick={openAdd} aria-label="Add worker" className="rounded-full bg-emerald-700 p-2 text-white active:scale-95">
          <Plus className="h-4.5 w-4.5" />
        </button>
      ) : undefined}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800">
          Workers can record milk, health and breeding data for your farm. Only you can add or manage workers.
        </div>

        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading && <SkeletonList rows={3} />}

        {!loading && !error && workers.length === 0 && (
          <EmptyState
            icon={<UserCircle2 className="h-6 w-6" />}
            title="No workers yet"
            description="Add a worker so they can sign in and help record farm activity."
            action={isOwner ? <Button onClick={openAdd}>Add a worker</Button> : undefined}
          />
        )}

        <div className="space-y-2.5">
          {workers.map((w) => (
            <Card key={w.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                  {w.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{w.name}</p>
                  <p className="truncate text-xs text-slate-500">{w.email}</p>
                  <p className="text-[11px] text-slate-400">Added {formatDate(w.createdAt)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${w.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  {w.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(w)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(w)}>{w.isActive ? 'Deactivate' : 'Reactivate'}</Button>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600" onClick={() => setToRemove(w)}>Remove</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.worker ? 'Edit worker' : 'Add worker'}>
        <form onSubmit={save} className="space-y-4">
          <FormField label="Full name *">
            <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Email address *">
            <TextInput type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>
          <FormField label={editing?.worker ? 'New password (leave blank to keep)' : 'Password *'} hint="At least 8 characters">
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <TextInput type="password" className="pl-9" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </FormField>
          {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{formError}</div>}
          <Button type="submit" fullWidth loading={saving}>{editing?.worker ? 'Save changes' : 'Add worker'}</Button>
        </form>
      </Sheet>

      <ConfirmDialog
        open={!!toRemove}
        title="Remove worker?"
        description={toRemove ? `${toRemove.name} will be deleted permanently and can no longer sign in. To keep their account, use Deactivate instead.` : ''}
        confirmLabel="Remove"
        tone="danger"
        onConfirm={confirmRemove}
        onCancel={() => setToRemove(null)}
      />
    </AuthedShell>
  );
}
