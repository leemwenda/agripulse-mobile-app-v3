import pathlib
files = {}
def sub(p, old, new):
    s = files.get(p) or pathlib.Path(p).read_text()
    assert s.count(old) == 1, f"{p}: expected 1 of {old[:70]!r}, found {s.count(old)}; nothing written"
    files[p] = s.replace(old, new)

A = 'src/App.tsx'
sub(A, "import { WorkersScreen } from './screens/Workers';",
    "import { WorkersScreen } from './screens/Workers';\nimport { MyListingsScreen } from './screens/MyListings';")
sub(A, '<Route path="/marketplace/new" element={<PrivateRoute><CreateListingScreen /></PrivateRoute>} />',
    '<Route path="/marketplace/new" element={<PrivateRoute><CreateListingScreen /></PrivateRoute>} />\n      <Route path="/marketplace/mine" element={<PrivateRoute><MyListingsScreen /></PrivateRoute>} />')

M = 'src/screens/More.tsx'
sub(M, "ChevronRight, Users, FileText, Moon,", "ChevronRight, Users, FileText, Moon, Store,")
sub(M, "    isFarm && user?.role === 'admin' && { icon: Users,",
    "    isFarm && { icon: Store, label: 'My listings', to: '/marketplace/mine' },\n    isFarm && user?.role === 'admin' && { icon: Users,")

F = 'src/screens/Farm.tsx'
sub(F, "import { Search, Plus, PawPrint, Milk, Stethoscope, Syringe, Wallet, QrCode, Camera, ChevronRight } from 'lucide-react';",
    "import { Search, Plus, PawPrint, Milk, Stethoscope, Syringe, Wallet, QrCode, Camera, ChevronRight, Tag } from 'lucide-react';")
sub(F, '<div className="grid grid-cols-4 gap-2">', '<div className="grid grid-cols-5 gap-2">')
sub(F, "<ShortcutButton icon={Wallet} label=\"Finance\" onClick={() => navigate('/farm/finance')} />",
    "<ShortcutButton icon={Wallet} label=\"Finance\" onClick={() => navigate('/farm/finance')} />\n          <ShortcutButton icon={Tag} label=\"Sold\" onClick={() => setStatus('sold')} />")

for p, s in files.items():
    pathlib.Path(p).write_text(s)
print("wired")
