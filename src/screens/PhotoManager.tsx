import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Card, ConfirmDialog } from '../components/ui';
import { useApp } from '../context/AppContext';
import { AnimalsApi } from '../lib/api';
import { API_BASE_URL } from '../lib/httpClient';
import { pickPhoto } from '../lib/photos';

export function PhotoManager({ animal, canEdit, onChanged }: { animal: any; canEdit: boolean; onChanged: () => void }) {
  const { pushToast } = useApp();
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const photos: any[] = animal.photos || [];
  const base = API_BASE_URL.replace(/\/api$/, '');

  async function addPhoto() {
    if (uploading) return;
    try {
      const file = await pickPhoto('animal');
      if (!file) return;
      setUploading(true);
      await AnimalsApi.uploadPhoto(animal.id, file, photos.length === 0);
      pushToast({ title: 'Photo added', tone: 'success' });
      onChanged();
    } catch (err: any) {
      pushToast({ title: 'Could not add photo', description: err?.message, tone: 'error' });
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete || deleting) return;
    setDeleting(true);
    try {
      await AnimalsApi.deletePhoto(animal.id, toDelete.id);
      pushToast({ title: 'Photo removed', tone: 'success' });
      setToDelete(null);
      onChanged();
    } catch (err: any) {
      pushToast({ title: 'Could not remove photo', description: err?.message, tone: 'error' });
    } finally {
      setDeleting(false);
    }
  }

  if (!canEdit && photos.length === 0) return null;

  return (
    <>
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Photos</p>
          {canEdit && (
            <button
              type="button"
              onClick={addPhoto}
              disabled={uploading}
              className="flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 active:scale-95"
            >
              <Camera className="h-3.5 w-3.5" /> {uploading ? 'Uploading…' : 'Add'}
            </button>
          )}
        </div>
        {photos.length === 0 ? (
          <p className="text-xs text-slate-500">No photos yet.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((p: any, i: number) => (
              <div key={p.id} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200">
                <img src={base + p.url} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 py-0.5 text-[9px] font-semibold text-white">Main</span>}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setToDelete({ id: p.id, label: `Photo ${i + 1}` })}
                    aria-label="Delete photo"
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete photo?"
        description={toDelete ? `${toDelete.label} will be removed permanently.` : ''}
        confirmLabel="Delete"
        tone="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
