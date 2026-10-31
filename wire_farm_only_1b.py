import pathlib, re
files = {}
def get(p):
    return files[p] if p in files else pathlib.Path(p).read_text()
def sub(p, old, new):
    s = get(p)
    assert s.count(old) == 1, f"{p}: expected 1 of {old[:70]!r}, found {s.count(old)}; nothing written"
    files[p] = s.replace(old, new)
def cut(p, start, end_marker):
    """Remove text from `start` up to (not including) `end_marker`."""
    s = get(p)
    assert s.count(start) == 1, f"{p}: start {start[:50]!r} found {s.count(start)}; nothing written"
    i = s.index(start)
    j = s.index(end_marker, i)
    files[p] = s[:i] + s[j:]

# ---- Auth.tsx: farm owner only
A = 'src/screens/Auth.tsx'
sub(A, "  const [params] = useSearchParams();\n  const startRole = ['farmer', 'buyer', 'vet'].includes(params.get('role') || '') ? (params.get('role') as string) : 'farmer';\n  const [form, setForm] = useState({ name: '', email: '', password: '', role: startRole, farmName: '' });",
       "  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'farmer', farmName: '' });")
sub(A, "<BrandHeader subtitle={'Create your ' + (({ farmer: 'Farm Owner', buyer: 'Buyer', vet: 'Veterinarian' } as Record<string, string>)[form.role] || 'AgriPulse') + ' account'} />",
       "<BrandHeader subtitle=\"Create your Farm Owner account\" />")
sub(A, "        {form.role === 'farmer' && (\n          <FormField label=\"Farm name\">\n            <TextInput required value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} />\n          </FormField>\n        )}",
       "        <FormField label=\"Farm name\">\n          <TextInput required value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} />\n        </FormField>")

# ---- Welcome.tsx: farm owner only, no marketplace
W = 'src/screens/Welcome.tsx'
sub(W, "import { ArrowRight, Check, Mail, Milk, QrCode, Stethoscope, Store } from 'lucide-react';",
       "import { ArrowRight, Check, Mail, Milk, QrCode } from 'lucide-react';")
sub(W, "  { icon: Store, title: 'Livestock Marketplace', desc: 'Buy and sell livestock securely with verified passports.' },\n", "")
sub(W, "  { icon: Stethoscope, title: 'Veterinary Services', desc: 'Book appointments and access trusted care from licensed vets.' },\n", "")
cut(W, "  {\n    role: 'buyer', img:", "];\n\nfunction Logo")
sub(W, "Your farm, fully digital. Register animals, track health and sell directly.", "Your farm, fully digital. Register animals and track milk, health, breeding and finances.")
sub(W, "items: ['Digital Animal Passports', 'Milk & Health Tracking', 'Sell on Marketplace'],", "items: ['Digital Animal Passports', 'Milk & Health Tracking', 'Breeding & Finance Records'],")
sub(W, "All-in-One Livestock Platform", "Dairy Farm Management")
sub(W, "Manage. Trade.<br />Care. <span className=\"text-green-400\">Grow.</span>", "Manage. Track.<br />Improve. <span className=\"text-green-400\">Grow.</span>")
sub(W, "AgriPulse connects farmers, buyers and veterinarians on one secure platform for smarter livestock management across Kenya.",
       "AgriPulse helps Kenyan dairy farmers manage animals, milk, health, breeding and finances from one app.")
sub(W, "Bring your farm records, livestock management and marketplace activity together in one place.", "Bring your farm records and livestock management together in one place.")

# ---- Journey.tsx: single farm-owner card
J = 'src/screens/Journey.tsx'
sub(J, "    items: ['Digital Animal Passports', 'Health & Milk Tracking', 'Breeding Management', 'Sell on Marketplace', 'Farm Analytics'],",
       "    items: ['Digital Animal Passports', 'Health & Milk Tracking', 'Breeding Management', 'Finance Records', 'Reports'],")
sub(J, "Your farm, fully digital. Register animals, track health, milk & breeding records, and sell directly from your dashboard.",
       "Your farm, fully digital. Register animals and track health, milk, breeding and finances from your dashboard.")
cut(J, "  {\n    role: 'buyer', tag:", "];\n\nexport function JourneyScreen")
sub(J, "<h1 className=\"mt-4 text-3xl font-black tracking-tight\">Choose Your Journey</h1>", "<h1 className=\"mt-4 text-3xl font-black tracking-tight\">Create Your Farm Account</h1>")
sub(J, "One platform. Three paths. All connected through verified digital animal passports.", "Everything you need to run your dairy farm, in one app.")

# ---- Workers.tsx: remove delete path
K = 'src/screens/Workers.tsx'
sub(K, "import { Button, Card, ConfirmDialog, EmptyState,", "import { Button, Card, EmptyState,")
sub(K, "  const [toRemove, setToRemove] = useState<FarmWorker | null>(null);\n", "")
cut(K, "  async function confirmRemove() {", "  return (\n    <AuthedShell\n      title=\"Farm Workers\"")
sub(K, "                  <Button size=\"sm\" variant=\"outline\" className=\"border-red-200 text-red-600\" onClick={() => setToRemove(w)}>Remove</Button>\n", "")
cut(K, "      <ConfirmDialog\n", "    </AuthedShell>\n  );\n}")

# ---- Home.tsx: remove buyer/vet homes
H = 'src/screens/Home.tsx'
sub(H, "  const isBuyer = user?.role === 'buyer';\n  const isVet = user?.role === 'vet';\n\n  if (isBuyer) return <BuyerHome />;\n  if (isVet) return <VetHome />;\n\n", "")
s = get(H)
i = s.index("function BuyerHome() {")
files[H] = s[:i].rstrip() + "\n"

for p, s in files.items():
    pathlib.Path(p).write_text(s)
print("wired")
