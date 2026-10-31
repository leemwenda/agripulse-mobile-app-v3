import { Browser } from '@capacitor/browser';
import { AuthLayout } from '../components/layout';
import { Button } from '../components/ui';
import { useApp } from '../context/AppContext';

export function WebsiteOnlyScreen() {
  const { user, logout } = useApp();
  const label = user?.role === 'vet' ? 'veterinarian' : 'buyer';
  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-xl font-bold text-slate-900">This app is for farm management</h1>
        <p className="text-sm text-slate-600">
          Your account is a {label} account. Please use the AgriPulse website to continue.
        </p>
        <Button fullWidth onClick={() => { Browser.open({ url: 'https://agripulse.me' }); }}>
          Open agripulse.me
        </Button>
        <Button fullWidth variant="outline" onClick={() => { logout(); }}>
          Sign out
        </Button>
      </div>
    </AuthLayout>
  );
}
