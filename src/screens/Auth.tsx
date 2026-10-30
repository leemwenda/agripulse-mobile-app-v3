import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { AuthLayout } from '../components/layout';
import { Button, FormField, TextInput, Select, ToastStack, BrandLogo } from '../components/ui';
import { useApp } from '../context/AppContext';
import { AuthApi } from '../lib/api';
import { isNativeApp, startGoogleSignIn } from '../lib/googleAuth';

// Google's own brand mark (4-color "G"), per Google's sign-in branding
// guidelines — not the AgriPulse logo.
function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.5C29.6 35.2 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.5C41.2 36.2 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function GoogleButton() {
  const native = isNativeApp();
  const [opening, setOpening] = useState(false);
  return (
    <button
      type="button"
      disabled={!native || opening}
      title={native ? undefined : 'Google sign-in requires the Android app — not available in this preview'}
      onClick={async () => {
        setOpening(true);
        try {
          await startGoogleSignIn();
        } finally {
          setOpening(false);
        }
      }}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 active:scale-[0.99] disabled:opacity-50"
    >
      {opening ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
      Continue with Google
    </button>
  );
}

function BrandHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="px-6 pb-2 pt-10 text-center">
      <div className="mx-auto">
        <BrandLogo size={56} />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">AgriPulse</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export function LoginScreen() {
  const { login, apiReachable } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password, remember);
    setLoading(false);
    if (res.ok) navigate('/home', { replace: true });
    else setError(res.error || 'Login failed.');
  }

  return (
    <AuthLayout>
      <BrandHeader subtitle="Smart livestock management for Kenyan farms" />
      <form onSubmit={onSubmit} className="space-y-4 px-6 pt-4">
        <FormField label="Email address">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput type="email" required placeholder="you@farm.co.ke" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </FormField>
        <FormField label="Password">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <TextInput type="password" required placeholder="••••••••" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </FormField>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-700" />
          Keep me signed in
        </label>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <p className="font-semibold">Couldn't sign in</p>
            <p className="mt-0.5">{error}</p>
            {apiReachable === false && (
              <p className="mt-1 text-red-600">
                Could not reach AgriPulse. Check your internet connection and try again.
              </p>
            )}
          </div>
        )}

        <Button type="submit" fullWidth loading={loading}>Sign in</Button>
      </form>

      <div className="px-6 pt-4">
        <div className="relative my-2 text-center text-xs text-slate-400">
          <span className="relative z-10 bg-slate-50 px-2">or</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
        </div>
        <GoogleButton />
      </div>


      <p className="mt-6 pb-8 text-center text-sm text-slate-500">
        New to AgriPulse?{' '}
        <button className="font-semibold text-emerald-700" onClick={() => navigate('/register')}>Create an account</button>
      </p>
      <ToastStack />
    </AuthLayout>
  );
}

export function RegisterScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'farmer', farmName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await AuthApi.register(form);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <BrandHeader subtitle="Check your inbox" />
        <div className="px-6 pt-6 text-center">
          <p className="text-sm text-slate-600">
            If registration is open on the live server, a verification email has been sent to <b>{form.email}</b>.
            Verify your email, then sign in.
          </p>
          <Button className="mt-6" fullWidth onClick={() => navigate('/login')}>Back to sign in</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <BrandHeader subtitle="Create your AgriPulse account" />
      <form onSubmit={onSubmit} className="space-y-4 px-6 pt-4 pb-10">
        <FormField label="Full name">
          <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FormField>
        <FormField label="Email address">
          <TextInput type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </FormField>
        <FormField label="Password" hint="At least 8 characters">
          <TextInput type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </FormField>
        <FormField label="I am a...">
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="farmer">Farmer / Farm owner</option>
            <option value="buyer">Livestock buyer</option>
            <option value="vet">Veterinarian</option>
          </Select>
        </FormField>
        {form.role === 'farmer' && (
          <FormField label="Farm name">
            <TextInput required value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} />
          </FormField>
        )}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
        <Button type="submit" fullWidth loading={loading}>Create account</Button>
        <button type="button" onClick={() => navigate('/login')} className="w-full text-center text-sm font-semibold text-emerald-700">
          Already have an account? Sign in
        </button>
      </form>
    </AuthLayout>
  );
}

export function SplashScreen() {
  return (
    <AuthLayout>
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-emerald-700 via-emerald-700 to-emerald-800 px-8 text-center">
        <BrandLogo size={88} />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">AgriPulse</h1>
          <p className="mt-1 text-sm text-emerald-100">Smart livestock management for Kenyan farms</p>
        </div>
        <Loader2 className="mt-2 h-5 w-5 animate-spin text-emerald-100" />
      </div>
    </AuthLayout>
  );
}
