import pathlib
def edit(path, pairs):
    p = pathlib.Path(path); s = p.read_text()
    for old, new in pairs:
        assert s.count(old) == 1, f"{path}: expected 1 of {old[:60]!r}, found {s.count(old)}; nothing written"
        s = s.replace(old, new)
    p.write_text(s)

edit('src/App.tsx', [
    ("import { SplashScreen, LoginScreen, RegisterScreen } from './screens/Auth';",
     "import { SplashScreen, LoginScreen, RegisterScreen } from './screens/Auth';\nimport { WelcomeScreen } from './screens/Welcome';"),
    ('<Navigate to="/login" replace />;\n  return children;', '<Navigate to="/welcome" replace />;\n  return children;'),
    ("mode === 'signed-out' ? '/login' : '/home'", "mode === 'signed-out' ? '/welcome' : '/home'"),
    ('<Route path="/login"', '<Route path="/welcome" element={<PublicOnlyRoute><WelcomeScreen /></PublicOnlyRoute>} />\n      <Route path="/login"'),
])
edit('src/components/ui.tsx', [
    ('src="https://agripulse.me/agripulse-logo.png"', 'src="/brand-logo-source.png"'),
    ('className="rounded-2xl object-contain shadow-lg shadow-emerald-900/20"',
     'className="rounded-2xl bg-white object-contain p-1.5 shadow-lg shadow-emerald-900/20"'),
])
edit('src/screens/Auth.tsx', [
    ("import { useNavigate } from 'react-router-dom';", "import { useNavigate, useSearchParams } from 'react-router-dom';"),
    ("  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'farmer', farmName: '' });",
     "  const [params] = useSearchParams();\n  const startRole = ['farmer', 'buyer', 'vet'].includes(params.get('role') || '') ? (params.get('role') as string) : 'farmer';\n  const [form, setForm] = useState({ name: '', email: '', password: '', role: startRole, farmName: '' });"),
])
print("wired")
