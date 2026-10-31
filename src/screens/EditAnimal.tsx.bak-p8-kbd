import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthedShell } from '../components/layout';
import { Button, EmptyState, FormField, Select, SkeletonList, TextArea, TextInput } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useRemoteData } from '../lib/useRemoteData';
import { AnimalsApi } from '../lib/api';
import type { Animal } from '../types';
import { ErrorBanner } from './Home';

export function EditAnimalScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, pushToast } = useApp();
  const animalId = Number(id);
  const { data, loading, error, reload } = useRemoteData(() => AnimalsApi.get(animalId), [animalId]);
  const animal = data?.animal;

  const [form, setForm] = useState({
    name: '', tagNumber: '', breed: '', gender: 'female', dateOfBirth: '',
    color: '', notes: '', status: 'active',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!animal) return;
    setForm({
      name: animal.name,
      tagNumber: animal.tagNumber,
      breed: animal.breed,
      gender: animal.gender,
      dateOfBirth: animal.dateOfBirth.slice(0, 10),
      color: animal.color || '',
      notes: animal.notes || '',
      status: animal.status,
    });
  }, [animal]);

  if (user?.role !== 'admin') {
    return <AuthedShell title="Edit animal" showBack><EmptyState title="Not allowed" description="Only the farm owner can edit animals." /></AuthedShell>;
  }
  if (loading) return <AuthedShell title="Edit animal" showBack><SkeletonList rows={3} /></AuthedShell>;
  if (error) return <AuthedShell title="Edit animal" showBack><ErrorBanner message={error} onRetry={reload} /></AuthedShell>;
  if (!animal) return <AuthedShell title="Edit animal" showBack><EmptyState title="Animal not found" description="This record may have been removed." /></AuthedShell>;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setFormError(null);
    if (!form.name.trim() || !form.tagNumber.trim() || !form.breed.trim() || !form.dateOfBirth) {
      setFormError('Please complete all required fields.');
      return;
    }
    setSaving(true);
    try {
      await AnimalsApi.update(animalId, {
        name: form.name.trim(),
        tagNumber: form.tagNumber.trim(),
        breed: form.breed.trim(),
        gender: form.gender as Animal['gender'],
        dateOfBirth: form.dateOfBirth,
        color: form.color.trim() || null,
        notes: form.notes.trim() || null,
        status: form.status as Animal['status'],
      });
      pushToast({ title: 'Animal updated', tone: 'success' });
      navigate(`/farm/${animalId}`, { replace: true });
    } catch (err: any) {
      setFormError(err?.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthedShell title="Edit animal" showBack>
      <form onSubmit={save} className="space-y-4 pb-8">
        <FormField label="Animal name *">
          <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FormField>
        <FormField label="Tag number *" hint="Must be unique">
          <TextInput required value={form.tagNumber} onChange={(e) => setForm({ ...form, tagNumber: e.target.value })} />
        </FormField>
        <FormField label="Breed *">
          <TextInput required value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
        </FormField>
        <FormField label="Gender *">
          <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </Select>
        </FormField>
        <FormField label="Category" hint="Set automatically from gender and age">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm capitalize text-slate-600">
            {animal.category ? animal.category.replace('_', ' ') : 'Not yet assigned'}
          </p>
        </FormField>
        <FormField label="Status">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="deceased">Deceased</option>
          </Select>
        </FormField>
        <FormField label="Date of birth *">
          <TextInput type="date" required max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
        </FormField>
        <FormField label="Colour / markings">
          <TextInput value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        </FormField>
        <FormField label="Notes">
          <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </FormField>
        {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{formError}</div>}
        <Button type="submit" fullWidth loading={saving}>Save changes</Button>
      </form>
    </AuthedShell>
  );
}
