import { useState } from 'react';
import { Plus, Milk as MilkIcon, Stethoscope, Syringe, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { AuthedShell } from '../components/layout';
import {
  Card, EmptyState, SkeletonList, Button, Sheet, FormField, TextInput, TextArea, Select, StatusPill,
} from '../components/ui';
import { useApp } from '../context/AppContext';
import { useRemoteData } from '../lib/useRemoteData';
import { MilkApi, HealthApi, BreedingApi, FinanceApi, AnimalsApi } from '../lib/api';
import { formatDate, formatKES, formatLiters } from '../lib/format';
import { ErrorBanner } from './Home';

function useAnimalOptions() {
  const { data } = useRemoteData(() => AnimalsApi.list());
  return data?.animals || [];
}

// --------------------------------------------------------------- Milk -----
export function MilkScreen() {
  const { pushToast } = useApp();
  const animals = useAnimalOptions();
  const { data, loading, error, reload } = useRemoteData(() => MilkApi.list());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ animalId: '', productionDate: new Date().toISOString().slice(0, 10), quantityLiters: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const records = data?.records || [];
  const todayTotal = records
    .filter((r) => String(r.productionDate).slice(0, 10) === new Date().toLocaleDateString('en-CA'))
    .reduce((s, r) => s + Number(r.quantityLiters), 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setFormError(null);
    if (!form.animalId || !form.quantityLiters || Number(form.quantityLiters) <= 0) {
      setFormError('Select an animal and enter a valid quantity greater than zero.');
      return;
    }
    setSaving(true);
    try {
      await MilkApi.create({ animalId: Number(form.animalId), productionDate: form.productionDate, quantityLiters: Number(form.quantityLiters), notes: form.notes });
      pushToast({ title: 'Milk recorded', tone: 'success' });
      reload();
      setOpen(false);
      setForm({ animalId: '', productionDate: new Date().toISOString().slice(0, 10), quantityLiters: '', notes: '' });
    } catch (err: any) {
      setFormError(err?.message?.includes('already exists') ? 'A record for this animal on this date already exists. Edit it instead of creating a duplicate.' : err?.message || 'Could not save this record.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthedShell title="Milk Production" showBack right={<AddButton onClick={() => setOpen(true)} />}>
      <div className="space-y-4">
        <Card className="bg-emerald-700 text-white">
          <p className="text-xs font-semibold opacity-80">Today's total</p>
          <p className="text-2xl font-extrabold">{formatLiters(todayTotal)}</p>
        </Card>
        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading && <SkeletonList rows={4} />}
        {!loading && records.length === 0 && <EmptyState icon={<MilkIcon className="h-6 w-6" />} title="No milk records yet" description="Record your first milking session to see totals and trends." action={<Button onClick={() => setOpen(true)}>Record milk</Button>} />}
        <div className="space-y-2.5">
          {records.map((r) => (
            <Card key={r.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{r.animal?.name || animals.find((a) => a.id === r.animalId)?.name || `Animal #${r.animalId}`}</p>
                <p className="text-xs text-slate-500">{formatDate(r.productionDate)}</p>
              </div>
              <span className="text-sm font-bold text-emerald-700">{formatLiters(r.quantityLiters)}</span>
            </Card>
          ))}
        </div>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Record milk production">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Animal *">
            <Select required value={form.animalId} onChange={(e) => setForm({ ...form, animalId: e.target.value })}>
              <option value="">Select animal</option>
              {animals.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.tagNumber})</option>)}
            </Select>
          </FormField>
          <FormField label="Date *">
            <TextInput type="date" required max={new Date().toISOString().slice(0, 10)} value={form.productionDate} onChange={(e) => setForm({ ...form, productionDate: e.target.value })} />
          </FormField>
          <FormField label="Quantity (liters) *">
            <TextInput type="number" inputMode="decimal" min="0.1" step="0.1" required value={form.quantityLiters} onChange={(e) => setForm({ ...form, quantityLiters: e.target.value })} />
          </FormField>
          <FormField label="Notes">
            <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </FormField>
          {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{formError}</div>}
          <Button type="submit" fullWidth loading={saving}>Save record</Button>
        </form>
      </Sheet>
    </AuthedShell>
  );
}

// -------------------------------------------------------------- Health ----
export function HealthScreen() {
  const { pushToast } = useApp();
  const animals = useAnimalOptions();
  const { data, loading, error, reload } = useRemoteData(() => HealthApi.list());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ animalId: '', recordDate: new Date().toISOString().slice(0, 10), condition: '', treatment: '', doctorName: '', vaccination: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setFormError(null);
    if (!form.animalId || !form.condition) {
      setFormError('Select an animal and describe the condition or reason for this record.');
      return;
    }
    setSaving(true);
    try {
      await HealthApi.create({ ...form, animalId: Number(form.animalId) } as any);
      pushToast({ title: 'Health record saved', tone: 'success' });
      reload();
      setOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Could not save this record.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthedShell title="Animal Health" showBack right={<AddButton onClick={() => setOpen(true)} />}>
      <div className="space-y-4">
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800">
          Records entered here are farmer observations. They do not replace a professional veterinary diagnosis — contact a vet for suspected serious illness.
        </div>
        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading && <SkeletonList rows={3} />}
        {!loading && (data?.records.length || 0) === 0 && <EmptyState icon={<Stethoscope className="h-6 w-6" />} title="No health records yet" description="Treatments, symptoms and vaccinations you record will appear here." action={<Button onClick={() => setOpen(true)}>Add record</Button>} />}
        <div className="space-y-2.5">
          {data?.records.map((h) => (
            <Card key={h.id}>
              <p className="text-sm font-semibold text-slate-900">{h.animal?.name || animals.find((a) => a.id === h.animalId)?.name || `Animal #${h.animalId}`} · {h.condition}</p>
              <p className="mt-0.5 text-xs text-slate-500">{formatDate(h.recordDate)}{h.doctorName ? ` · ${h.doctorName}` : ''}</p>
              {h.treatment && <p className="mt-1 text-xs text-slate-600">Treatment: {h.treatment}</p>}
            </Card>
          ))}
        </div>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Add health record">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Animal *">
            <Select required value={form.animalId} onChange={(e) => setForm({ ...form, animalId: e.target.value })}>
              <option value="">Select animal</option>
              {animals.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.tagNumber})</option>)}
            </Select>
          </FormField>
          <FormField label="Date *">
            <TextInput type="date" required max={new Date().toISOString().slice(0, 10)} value={form.recordDate} onChange={(e) => setForm({ ...form, recordDate: e.target.value })} />
          </FormField>
          <FormField label="Condition / reason *">
            <TextInput required placeholder="e.g. Lameness, routine check-up" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
          </FormField>
          <FormField label="Treatment given">
            <TextArea value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
          </FormField>
          <FormField label="Vaccination (if any)">
            <TextInput value={form.vaccination} onChange={(e) => setForm({ ...form, vaccination: e.target.value })} />
          </FormField>
          <FormField label="Veterinarian">
            <TextInput value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} />
          </FormField>
          {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{formError}</div>}
          <Button type="submit" fullWidth loading={saving}>Save record</Button>
        </form>
      </Sheet>
    </AuthedShell>
  );
}

// ------------------------------------------------------------- Breeding ---
export function BreedingScreen() {
  const { pushToast } = useApp();
  const animals = useAnimalOptions();
  const { data, loading, error, reload } = useRemoteData(() => BreedingApi.list());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ animalId: '', serviceDate: new Date().toISOString().slice(0, 10), bullName: '', expectedBirthDate: '', pregnancyStatus: 'pending', notes: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setFormError(null);
    if (!form.animalId) { setFormError('Select an animal.'); return; }
    setSaving(true);
    try {
      await BreedingApi.create({ ...form, animalId: Number(form.animalId) } as any);
      pushToast({ title: 'Breeding record saved', tone: 'success' });
      reload();
      setOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Could not save this record.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthedShell title="Breeding" showBack right={<AddButton onClick={() => setOpen(true)} />}>
      <div className="space-y-4">
        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading && <SkeletonList rows={3} />}
        {!loading && (data?.records.length || 0) === 0 && <EmptyState icon={<Syringe className="h-6 w-6" />} title="No breeding records yet" description="Service dates, pregnancy status and expected calving dates will appear here." action={<Button onClick={() => setOpen(true)}>Add record</Button>} />}
        <div className="space-y-2.5">
          {data?.records.map((b) => (
            <Card key={b.id}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{b.animal?.name || animals.find((a) => a.id === b.animalId)?.name || `Animal #${b.animalId}`}</p>
                <StatusPill status={b.pregnancyStatus} />
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Serviced {formatDate(b.serviceDate)}{b.bullName ? ` · Sire: ${b.bullName}` : ''}</p>
              {b.expectedBirthDate && <p className="text-xs text-slate-500">Expected birth: {formatDate(b.expectedBirthDate)}</p>}
            </Card>
          ))}
        </div>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Add breeding record">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Animal *">
            <Select required value={form.animalId} onChange={(e) => setForm({ ...form, animalId: e.target.value })}>
              <option value="">Select animal</option>
              {animals.filter((a) => a.gender === 'female').map((a) => <option key={a.id} value={a.id}>{a.name} ({a.tagNumber})</option>)}
            </Select>
          </FormField>
          <FormField label="Service date *">
            <TextInput type="date" required value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} />
          </FormField>
          <FormField label="Sire / bull name">
            <TextInput value={form.bullName} onChange={(e) => setForm({ ...form, bullName: e.target.value })} />
          </FormField>
          <FormField label="Pregnancy status">
            <Select value={form.pregnancyStatus} onChange={(e) => setForm({ ...form, pregnancyStatus: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="pregnant">Pregnant</option>
              <option value="gave_birth">Gave birth</option>
              <option value="failed">Failed</option>
            </Select>
          </FormField>
          <FormField label="Expected birth date">
            <TextInput type="date" value={form.expectedBirthDate} onChange={(e) => setForm({ ...form, expectedBirthDate: e.target.value })} />
          </FormField>
          {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{formError}</div>}
          <Button type="submit" fullWidth loading={saving}>Save record</Button>
        </form>
      </Sheet>
    </AuthedShell>
  );
}

// -------------------------------------------------------------- Finance ---
export function FinanceScreen() {
  const { pushToast } = useApp();
  const { data, loading, error, reload } = useRemoteData(() => FinanceApi.list());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: 'income', category: '', amount: '', description: '', transactionDate: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const records = data?.records || [];
  const income = records.filter((r) => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
  const expense = records.filter((r) => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setFormError(null);
    if (!form.category || !form.amount || Number(form.amount) <= 0) {
      setFormError('Enter a category and an amount greater than zero.');
      return;
    }
    setSaving(true);
    try {
      await FinanceApi.create({ ...form, amount: Number(form.amount) } as any);
      pushToast({ title: 'Transaction recorded', tone: 'success' });
      reload();
      setOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Could not save this transaction.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthedShell title="Farm Finance" showBack right={<AddButton onClick={() => setOpen(true)} />}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> Income</span>
            <span className="text-lg font-extrabold text-slate-900">{formatKES(income)}</span>
          </Card>
          <Card className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><TrendingDown className="h-3.5 w-3.5 text-red-500" /> Expenses</span>
            <span className="text-lg font-extrabold text-slate-900">{formatKES(expense)}</span>
          </Card>
        </div>
        <p className="text-center text-xs text-slate-400">Totals reflect recorded transactions only, not projections.</p>
        {error && <ErrorBanner message={error} onRetry={reload} />}
        {loading && <SkeletonList rows={3} />}
        {!loading && records.length === 0 && <EmptyState icon={<Wallet className="h-6 w-6" />} title="No transactions yet" description="Record milk sales, livestock sales and farm expenses to see your income and expenses here." action={<Button onClick={() => setOpen(true)}>Add transaction</Button>} />}
        <div className="space-y-2.5">
          {records.map((r) => (
            <Card key={r.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{r.category}</p>
                <p className="text-xs text-slate-500">{formatDate(r.transactionDate)}{r.description ? ` · ${r.description}` : ''}</p>
              </div>
              <span className={`text-sm font-bold ${r.type === 'income' ? 'text-emerald-700' : 'text-red-600'}`}>
                {r.type === 'income' ? '+' : '-'}{formatKES(r.amount)}
              </span>
            </Card>
          ))}
        </div>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Add transaction">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
          </FormField>
          <FormField label="Category *">
            <TextInput required placeholder="e.g. Milk sales, Feed, Veterinary" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </FormField>
          <FormField label="Amount (KSh) *">
            <TextInput type="number" inputMode="decimal" min="1" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </FormField>
          <FormField label="Date *">
            <TextInput type="date" required value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{formError}</div>}
          <Button type="submit" fullWidth loading={saving}>Save transaction</Button>
        </form>
      </Sheet>
    </AuthedShell>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-full bg-emerald-700 p-2 text-white active:scale-95">
      <Plus className="h-4.5 w-4.5" />
    </button>
  );
}
