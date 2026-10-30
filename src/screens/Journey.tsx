import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/layout';

const PATHS = [
  {
    role: 'farmer', tag: 'Farm Owner', title: 'Grow & Manage',
    desc: 'Your farm, fully digital. Register animals, track health, milk & breeding records, and sell directly from your dashboard.',
    items: ['Digital Animal Passports', 'Health & Milk Tracking', 'Breeding Management', 'Sell on Marketplace', 'Farm Analytics'],
    btn: 'Start as Farm Owner',
    card: 'border-green-500/30 bg-green-500/5', accent: 'text-green-400',
    btnClass: 'border border-green-500/50 bg-green-600/15 text-green-300',
  },
  {
    role: 'buyer', tag: 'Buyer', title: 'Browse & Purchase',
    desc: 'Find verified livestock with full passport history. Chat with farmers, negotiate prices, and complete secure ownership transfers.',
    items: ['Browse Live Listings', 'View Full Animal Passports', 'Direct Farmer Messaging', 'Secure Ownership Transfer', 'Purchase History'],
    btn: 'Start as Buyer',
    card: 'border-cyan-500/30 bg-cyan-500/5', accent: 'text-cyan-400',
    btnClass: 'border border-cyan-500/50 bg-cyan-600/15 text-cyan-300',
  },
  {
    role: 'vet', tag: 'Veterinarian', title: 'Treat & Verify',
    desc: 'Access full animal health histories, record treatments and vaccinations, verify ownership transfers, and manage your client farms.',
    items: ['Animal Health Records', 'Vaccination Certificates', 'Transfer Verification', 'Client Farm Access', 'Appointment Management'],
    btn: 'Start as Veterinarian',
    card: 'border-violet-500/40 bg-violet-500/10', accent: 'text-violet-400',
    btnClass: 'bg-violet-600 text-white',
  },
];

export function JourneyScreen() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <div className="min-h-full bg-brand-dark px-5 pb-10 pt-10 text-white">
        <div className="flex flex-col items-center text-center">
          <img src="/brand-logo-source.png" alt="AgriPulse" className="keep-white h-10 w-10 rounded-lg bg-white object-contain p-1" />
          <p className="mt-2 text-[10px] font-semibold tracking-[0.3em] text-white/60">AGRIPULSE</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Choose Your Journey</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            One platform. Three paths. All connected through verified digital animal passports.
          </p>
        </div>

        <div className="mt-7 space-y-4">
          {PATHS.map((p) => (
            <div key={p.role} className={'rounded-2xl border p-5 ' + p.card}>
              <span className={'text-[10px] font-bold uppercase tracking-wider ' + p.accent}>● {p.tag}</span>
              <h2 className="mt-2 text-xl font-extrabold">{p.title}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-white/60">{p.desc}</p>
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {p.items.map((it) => (
                  <li key={it} className="flex items-center gap-2 text-xs text-white/80">
                    <Check className={'h-3.5 w-3.5 ' + p.accent} /> {it}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register?role=' + p.role)}
                className={'mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold active:scale-[0.99] ' + p.btnClass}
              >
                {p.btn} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-white/50">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="font-semibold text-green-400">Sign in</button>
          <span className="mx-2">·</span>
          <button onClick={() => navigate('/welcome')}>Back to Home</button>
        </p>
      </div>
    </AuthLayout>
  );
}
