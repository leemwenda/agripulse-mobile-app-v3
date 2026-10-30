import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Share2, Lock } from 'lucide-react';
import { AuthedShell } from '../components/layout';
import { Card, EmptyState, SkeletonList, StatusPill, Button } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useRemoteData } from '../lib/useRemoteData';
import { PassportApi } from '../lib/api';
import { ageFromDOB, formatDate, formatLiters } from '../lib/format';
import { ErrorBanner } from './Home';

export function PassportScreen() {
  const { agripulseId = '' } = useParams();
  const { user } = useApp();
  const { data, loading, error, reload } = useRemoteData(
    () => PassportApi.getByAgripulseId(agripulseId).then((r) => r.passport),
    [agripulseId],
  );

  // Matches the real public verification route in the AgriPulse web client
  // (client/src/App.tsx → /animal/:agripulseId → AnimalPassport.tsx).
  const verifyUrl = `https://agripulse.me/animal/${agripulseId}`;
  const isOwner = user && (user.role === 'admin' || user.role === 'worker');

  if (loading) return <AuthedShell title="Digital Passport" showBack><SkeletonList rows={3} /></AuthedShell>;
  if (error) return <AuthedShell title="Digital Passport" showBack><ErrorBanner message={error} onRetry={reload} /></AuthedShell>;
  if (!data) return <AuthedShell title="Digital Passport" showBack><EmptyState title="Passport not found" description="No animal matches this AgriPulse ID." /></AuthedShell>;

  return (
    <AuthedShell title="Digital Passport" showBack>
      <div className="space-y-4">
        <Card className="flex flex-col items-center gap-3 bg-emerald-700 text-white">
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG value={verifyUrl} size={148} />
          </div>
          <div className="text-center">
            <p className="text-base font-extrabold">{data.name}</p>
            <p className="text-xs opacity-80">{data.agripulseId || 'AgriPulse ID pending'}</p>
          </div>
          <p className="text-center text-[11px] opacity-80">Scan to verify this animal's identity and registration status via the official AgriPulse record.</p>
        </Card>

        <Card className="space-y-2 text-sm">
          <Row label="Tag number" value={data.tagNumber} />
          <Row label="Breed" value={data.breed} />
          <Row label="Sex" value={data.gender} />
          <Row label="Age" value={ageFromDOB(data.dateOfBirth)} />
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Registration status</span>
            <StatusPill status={data.status} />
          </div>
          <Row label="Registered farm" value={data.farm?.name || 'Not disclosed'} />
        </Card>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <ShieldCheck className="h-4 w-4 shrink-0" /> Public verification shows identity and registration status only. Full health and ownership history is visible to authorized farm accounts.
        </div>

        {isOwner ? (
          <>
            <section>
              <p className="mb-2 text-sm font-bold text-slate-900">Vaccination & health history</p>
              {data.healthRecords.length === 0 ? (
                <EmptyState title="No health records" />
              ) : (
                <div className="space-y-2">
                  {data.healthRecords.map((h) => (
                    <Card key={h.id}><p className="text-sm font-semibold">{h.condition}</p><p className="text-xs text-slate-500">{formatDate(h.recordDate)}</p></Card>
                  ))}
                </div>
              )}
            </section>
            <section>
              <p className="mb-2 text-sm font-bold text-slate-900">Recent milk production</p>
              {data.milkProduction.length === 0 ? (
                <EmptyState title="No milk records" />
              ) : (
                <div className="space-y-2">
                  {data.milkProduction.slice(0, 5).map((m) => (
                    <Card key={m.id} className="flex items-center justify-between"><span className="text-sm">{formatDate(m.productionDate)}</span><span className="text-sm font-bold">{formatLiters(m.quantityLiters)}</span></Card>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <Card className="flex items-center gap-3">
            <Lock className="h-5 w-5 shrink-0 text-slate-400" />
            <p className="text-xs text-slate-500">Health, production and ownership history are private and only visible to the farm's authorized account.</p>
          </Card>
        )}

        <Button variant="outline" fullWidth>
          <Share2 className="h-4 w-4" /> Share verification link
        </Button>
      </div>
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
