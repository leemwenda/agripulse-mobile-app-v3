import pathlib
files = {}
def sub(p, old, new):
    s = files.get(p) or pathlib.Path(p).read_text()
    assert s.count(old) == 1, f"{p}: expected 1 of {old[:70]!r}, found {s.count(old)}; nothing written"
    files[p] = s.replace(old, new)

# ---- App.tsx: journey route
sub('src/App.tsx', "import { WelcomeScreen } from './screens/Welcome';",
    "import { WelcomeScreen } from './screens/Welcome';\nimport { JourneyScreen } from './screens/Journey';")
sub('src/App.tsx', '<Route path="/welcome" element={<PublicOnlyRoute><WelcomeScreen /></PublicOnlyRoute>} />',
    '<Route path="/welcome" element={<PublicOnlyRoute><WelcomeScreen /></PublicOnlyRoute>} />\n      <Route path="/journey" element={<PublicOnlyRoute><JourneyScreen /></PublicOnlyRoute>} />')

# ---- Welcome.tsx: Get Started goes to journey; keep logo tile white in dark mode
sub('src/screens/Welcome.tsx',
    """onClick={() => navigate('/register')} className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5""",
    """onClick={() => navigate('/journey')} className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5""")
sub('src/screens/Welcome.tsx',
    """onClick={() => navigate('/register')} className="mt-4 w-full rounded-xl bg-green-600 py-3.5""",
    """onClick={() => navigate('/journey')} className="mt-4 w-full rounded-xl bg-green-600 py-3.5""")
sub('src/screens/Welcome.tsx', 'className="rounded-lg bg-white object-contain p-1"',
    'className="keep-white rounded-lg bg-white object-contain p-1"')

# ---- keep logo and QR white in dark mode
sub('src/components/ui.tsx', 'className="rounded-2xl bg-white object-contain p-1.5 shadow-lg shadow-emerald-900/20"',
    'className="keep-white rounded-2xl bg-white object-contain p-1.5 shadow-lg shadow-emerald-900/20"')
sub('src/screens/Passport.tsx', '<div className="rounded-xl bg-white p-3">', '<div className="keep-white rounded-xl bg-white p-3">')

# ---- Auth.tsx: remove "I am a...", role comes from the journey card
sub('src/screens/Auth.tsx', "import { Button, FormField, TextInput, Select, ToastStack, BrandLogo }",
    "import { Button, FormField, TextInput, ToastStack, BrandLogo }")
sub('src/screens/Auth.tsx', """        <FormField label="I am a...">
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="farmer">Farmer / Farm owner</option>
            <option value="buyer">Livestock buyer</option>
            <option value="vet">Veterinarian</option>
          </Select>
        </FormField>
""", "")
sub('src/screens/Auth.tsx', '<BrandHeader subtitle="Create your AgriPulse account" />',
    "<BrandHeader subtitle={'Create your ' + (({ farmer: 'Farm Owner', buyer: 'Buyer', vet: 'Veterinarian' } as Record<string, string>)[form.role] || 'AgriPulse') + ' account'} />")
sub('src/screens/Auth.tsx', "onClick={() => navigate('/register')}>Create an account",
    "onClick={() => navigate('/journey')}>Create an account")

# ---- layout.tsx: bell + dark-mode icons in the top bar
L = 'src/components/layout.tsx'
sub(L, "import { type ReactNode } from 'react';", "import { type ReactNode, useEffect, useState } from 'react';")
sub(L, "import { ChevronLeft, Home, PawPrint, Sparkles, Store, Menu } from 'lucide-react';",
    "import { Bell, ChevronLeft, Home, Menu, Moon, PawPrint, Sparkles, Store, Sun } from 'lucide-react';")
sub(L, "import { initials } from '../lib/format';",
    "import { initials } from '../lib/format';\nimport { NotificationsApi } from '../lib/api';\nimport { useTheme } from '../lib/theme';")
sub(L, "export function TopBar(", """let unreadCache: { n: number; at: number } | null = null;

function HeaderIcons() {
  const navigate = useNavigate();
  const { mode } = useApp();
  const { theme, toggle } = useTheme();
  const [unread, setUnread] = useState(unreadCache ? unreadCache.n : 0);

  useEffect(() => {
    if (mode !== 'live') return;
    if (unreadCache && Date.now() - unreadCache.at < 60000) return;
    NotificationsApi.list()
      .then((r) => {
        const n = r.unread || 0;
        unreadCache = { n, at: Date.now() };
        setUnread(n);
      })
      .catch(() => {});
  }, [mode]);

  return (
    <div className="flex items-center gap-0.5">
      <button onClick={toggle} aria-label="Toggle dark mode" className="rounded-full p-2 text-slate-600 active:scale-95">
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
      <button onClick={() => navigate('/more/notifications')} aria-label="Notifications" className="relative rounded-full p-2 text-slate-600 active:scale-95">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  );
}

export function TopBar(""")
sub(L, """      <h1 className="flex-1 truncate text-base font-bold text-slate-900">{title}</h1>
      {right}
""", """      <h1 className="flex-1 truncate text-base font-bold text-slate-900">{title}</h1>
      {right}
      {!onBack && <HeaderIcons />}
""")

# ---- More.tsx: make the Settings dark-mode switch work
M = 'src/screens/More.tsx'
sub(M, "import { ErrorBanner } from './Home';", "import { ErrorBanner } from './Home';\nimport { useTheme } from '../lib/theme';")
sub(M, "  const [darkMode, setDarkMode] = useState(false);", "  const { theme, toggle } = useTheme();")
sub(M, 'description="Not yet available in this preview" checked={darkMode} onChange={setDarkMode} disabled />',
    "description=\"Use a dark colour theme\" checked={theme === 'dark'} onChange={() => toggle()} />")

for p, s in files.items():
    pathlib.Path(p).write_text(s)
print("wired")
