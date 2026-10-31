import { useState } from 'react';
import { Mail } from 'lucide-react';
import { AuthedShell } from '../components/layout';
import { Button, Card, EmptyState, FormField, Select, SkeletonList, TextArea, TextInput } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useRemoteData } from '../lib/useRemoteData';
import { IssuesApi } from '../lib/api';
import { formatDate } from '../lib/format';
import { ErrorBanner } from './Home';

export function HelpScreen() {
  const { pushToast } = useApp();
  const { data, loading, error, reload } = useRemoteData(() => IssuesApi.list());
  const [form, setForm] = useState({ title: '', description: '', category: 'bug' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const issues = data?.issues || [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setFormError(null);
    if (form.title.trim().length < 3) { setFormError('Please give your report a short title (at least 3 letters).'); return; }
    if (form.description.trim().length < 10) { setFormError('Please describe the problem in a few words (at least 10 letters).'); return; }
    setSaving(true);
    try {
      await IssuesApi.create({ title: form.title.trim(), description: form.description.trim(), category: form.category, priority: 'medium' });
      pushToast({ title: 'Report sent', description: 'Thank you. The AgriPulse team will look at it.', tone: 'success' });
      setForm({ title: '', description: '', category: 'bug' });
      reload();
    } catch (err: any) {
      setFormError(err?.message || 'Could not send your report. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthedShell title="Help & Support" showBack>
      <div className="space-y-4">
        <Card className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">Need help?</p>
          <p className="text-xs text-slate-500">Send us a report below, or write to us by email.</p>
          <a href="mailto:agripulse254@gmail.com" className="inline-flex items-center gap-2 pt-1 text-xs font-semibold text-emerald-700">
            <Mail className="h-3.5 w-3.5" /> agripulse254@gmail.com
          </a>
        </Card>

        <form onSubmit={submit} className="space-y-4 pb-32">
          <FormField label="What is the problem about?">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="bug">Something is not working</option>
              <option value="feature_request">I need a new feature</option>
              <option value="performance">The app is slow</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Short title *">
            <TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </FormField>
          <FormField label="Tell us what happened *">
            <TextArea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          {formError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{formError}</div>}
          <Button type="submit" fullWidth loading={saving}>Send report</Button>
        </form>

        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-slate-900">Your earlier reports</p>
          {error && <ErrorBanner message={error} onRetry={reload} />}
          {loading && <SkeletonList rows={2} />}
          {!loading && !error && issues.length === 0 && (
            <EmptyState title="No reports yet" description="Reports you send will appear here with their status." />
          )}
          {issues.map((i) => (
            <Card key={i.id}>
              <p className="text-sm font-semibold text-slate-900">{i.title}</p>
              <p className="mt-0.5 text-xs capitalize text-slate-500">{i.status.replace('_', ' ')} · {formatDate(i.createdAt)}</p>
            </Card>
          ))}
        </div>
      </div>
    </AuthedShell>
  );
}
