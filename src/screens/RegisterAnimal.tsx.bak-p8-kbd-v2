import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X } from 'lucide-react';
import { AuthedShell } from '../components/layout';
import { Button, FormField, TextInput, Select, TextArea } from '../components/ui';
import { useApp } from '../context/AppContext';
import { AnimalsApi } from '../lib/api';
import { pickPhoto } from '../lib/photos';

const MAX_PHOTOS = 4;

interface PickedPhoto { file: File; preview: string }

export function RegisterAnimalScreen() {
  const navigate = useNavigate();
  const { pushToast } = useApp();
  const [form, setForm] = useState({ name: '', tagNumber: '', breed: '', gender: 'female', dateOfBirth: '', color: '', notes: '' });
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function addPhoto() {
    if (photos.length >= MAX_PHOTOS) return;
    try {
      const file = await pickPhoto('animal');
      if (!file) return;
      setPhotos((p) => [...p, { file, preview: URL.createObjectURL(file) }]);
    } catch (err: any) {
      pushToast({ title: 'Could not add photo', description: err?.message || 'Please try again.', tone: 'error' });
    }
  }

  function removePhoto(i: number) {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted) return;
    setError(null);
    if (!form.name || !form.tagNumber || !form.breed || !form.dateOfBirth) {
      setError('Please complete all required fields.');
      return;
    }
    setLoading(true);
    setSubmitted(true);
    try {
      const res = await AnimalsApi.create(form as any);
      let failed = 0;
      for (let i = 0; i < photos.length; i++) {
        try {
          await AnimalsApi.uploadPhoto(res.animal.id, photos[i].file, i === 0);
        } catch {
          failed++;
        }
      }
      if (failed > 0) {
        pushToast({ title: 'Animal saved', description: `${failed} photo${failed > 1 ? 's' : ''} could not be uploaded.`, tone: 'info' });
      } else {
        pushToast({ title: 'Animal registered', description: `${form.name} has been added to your farm.`, tone: 'success' });
      }
      navigate('/farm', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Could not register this animal. It has not been saved.');
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthedShell title="Register Animal" showBack>
      <form onSubmit={onSubmit} className="space-y-4 pb-8">
        <FormField label="Animal name *">
          <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FormField>
        <FormField label="Tag number *" hint="Must be unique across the farm">
          <TextInput required value={form.tagNumber} onChange={(e) => setForm({ ...form, tagNumber: e.target.value })} />
        </FormField>
        <FormField label="Breed *">
          <TextInput required placeholder="e.g. Friesian, Ayrshire, Jersey" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
        </FormField>
        <FormField label="Gender *">
          <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="female">Female</option>
            <option value="male">Male</option>
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

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Photos (optional, up to {MAX_PHOTOS})</p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div key={p.preview} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                <img src={p.preview} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>}
                <button type="button" onClick={() => removePhoto(i)} aria-label="Remove photo" className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button type="button" onClick={addPhoto} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-500 active:scale-95">
                <Camera className="h-5 w-5" /> Add photo
              </button>
            )}
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

        <Button type="submit" fullWidth loading={loading} disabled={submitted && loading}>Save animal</Button>
      </form>
    </AuthedShell>
  );
}
