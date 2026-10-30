import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Mail, Milk, QrCode, Stethoscope, Store } from 'lucide-react';
import { AuthLayout } from '../components/layout';

const FEATURES = [
  { icon: Milk, title: 'Farm Management', desc: 'Track animals, production, health, breeding and more from one dashboard.' },
  { icon: Store, title: 'Livestock Marketplace', desc: 'Buy and sell livestock securely with verified passports.' },
  { icon: Stethoscope, title: 'Veterinary Services', desc: 'Book appointments and access trusted care from licensed vets.' },
  { icon: QrCode, title: 'Digital Passport', desc: 'QR verified identity and complete animal records accessible anywhere.' },
];

const JOURNEYS = [
  {
    role: 'farmer', img: '/img/farmer.jpg', tag: 'Farm Owner', tagClass: 'text-green-400',
    title: 'Grow & Manage', desc: 'Your farm, fully digital. Register animals, track health and sell directly.',
    items: ['Digital Animal Passports', 'Milk & Health Tracking', 'Sell on Marketplace'],
    btn: 'Start as Farm Owner', btnClass: 'bg-green-600',
  },
  {
    role: 'buyer', img: '/img/buyer.jpg', tag: 'Buyer', tagClass: 'text-sky-400',
    title: 'Browse & Purchase', desc: 'Find verified livestock with full passport history and buy securely.',
    items: ['Browse Live Listings', 'View Animal Passports', 'Secure Ownership Transfer'],
    btn: 'Start as Buyer', btnClass: 'bg-sky-600',
  },
  {
    role: 'vet', img: '/img/vet.jpg', tag: 'Veterinarian', tagClass: 'text-teal-400',
    title: 'Treat & Verify', desc: 'Manage client farms, record treatments and issue health certificates.',
    items: ['Health Records', 'Vaccination Certificates', 'Appointment Management'],
    btn: 'Join as Vet', btnClass: 'bg-teal-600',
  },
];

function Logo({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/brand-logo-source.png"
      alt="AgriPulse"
      className="keep-white rounded-lg bg-white object-contain p-1"
      style={{ height: size, width: size }}
    />
  );
}

export function WelcomeScreen() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <div className="bg-brand-dark text-white">
        {/* Hero */}
        <section className="relative min-h-[600px] overflow-hidden">
          <img src="/img/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: 'center 20%' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-brand-dark" />
          <div className="relative z-10 flex min-h-[600px] flex-col px-6 pb-10 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Logo />
                <div className="leading-tight">
                  <p className="text-base font-extrabold">AgriPulse</p>
                  <p className="text-[10px] text-white/70">Smart Farming. Stronger Future.</p>
                </div>
              </div>
              <button onClick={() => navigate('/login')} className="rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-semibold backdrop-blur">
                Sign in
              </button>
            </div>

            <div className="mt-auto pt-24">
              <span className="inline-flex rounded-full border border-green-500/35 bg-green-600/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-green-400">
                All-in-One Livestock Platform
              </span>
              <h1 className="mt-4 text-[2.6rem] font-black leading-[1.05] tracking-tight">
                Manage. Trade.<br />Care. <span className="text-green-400">Grow.</span>
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                AgriPulse connects farmers, buyers and veterinarians on one secure platform for smarter livestock management across Kenya.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button onClick={() => navigate('/journey')} className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-[15px] font-bold shadow-lg shadow-green-600/30 active:scale-[0.99]">
                  Get Started <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate('/login')} className="rounded-xl border border-white/20 bg-white/10 py-3.5 text-[15px] font-semibold backdrop-blur active:scale-[0.99]">
                  I already have an account
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-10">
          <h2 className="text-xl font-extrabold">Everything your farm needs</h2>
          <div className="mt-5 grid gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600/20 text-green-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/60">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Journeys */}
        <section className="px-6 pb-10">
          <h2 className="text-xl font-extrabold">Choose your journey</h2>
          <div className="mt-5 space-y-4">
            {JOURNEYS.map((j) => (
              <div key={j.role} className="relative overflow-hidden rounded-2xl">
                <img src={j.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30" />
                <div className="relative p-5 pt-28">
                  <p className={'text-[11px] font-bold uppercase tracking-wider ' + j.tagClass}>{j.tag}</p>
                  <h3 className="mt-1 text-xl font-extrabold">{j.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">{j.desc}</p>
                  <ul className="mt-3 space-y-1.5">
                    {j.items.map((it) => (
                      <li key={it} className="flex items-center gap-2 text-xs text-white/85">
                        <Check className={'h-3.5 w-3.5 ' + j.tagClass} /> {it}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate('/register?role=' + j.role)} className={'mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ' + j.btnClass}>
                    {j.btn} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-10">
          <div className="rounded-2xl border border-green-500/25 bg-green-600/10 p-6 text-center">
            <h2 className="text-xl font-extrabold">Ready to grow with AgriPulse?</h2>
            <p className="mt-2 text-xs leading-relaxed text-white/65">
              Bring your farm records, livestock management and marketplace activity together in one place.
            </p>
            <button onClick={() => navigate('/journey')} className="mt-4 w-full rounded-xl bg-green-600 py-3.5 text-[15px] font-bold">
              Create your account
            </button>
            <button onClick={() => navigate('/login')} className="mt-2 w-full py-2 text-sm font-semibold text-green-400">
              Sign in
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <div className="leading-tight">
              <p className="text-sm font-bold">AgriPulse</p>
              <p className="text-[11px] text-white/55">Smart Farming. Stronger Future.</p>
            </div>
          </div>
          <a href="mailto:agripulse254@gmail.com" className="mt-4 inline-flex items-center gap-2 text-xs text-white/70">
            <Mail className="h-3.5 w-3.5" /> agripulse254@gmail.com
          </a>
        </footer>
      </div>
    </AuthLayout>
  );
}
