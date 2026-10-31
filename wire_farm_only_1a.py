import pathlib
files = {}
def sub(p, old, new):
    s = files.get(p) if p in files else pathlib.Path(p).read_text()
    assert s.count(old) == 1, f"{p}: expected 1 of {old[:70]!r}, found {s.count(old)}; nothing written"
    files[p] = s.replace(old, new)

L = 'src/components/layout.tsx'
sub(L, "Moon, PawPrint, Sparkles, Store, Sun } from 'lucide-react';", "Moon, PawPrint, Sparkles, Sun } from 'lucide-react';")
sub(L, "  { to: '/marketplace', label: 'Market', icon: Store },\n", "")
sub(L, "['/home', '/farm', '/ai', '/marketplace', '/more']", "['/home', '/farm', '/ai', '/more']")

A = 'src/App.tsx'
sub(A, "import { MarketplaceScreen, ListingDetailScreen, CreateListingScreen } from './screens/Marketplace';\n", "")
sub(A, "import { MyListingsScreen } from './screens/MyListings';\n", "import { WebsiteOnlyScreen } from './screens/WebsiteOnly';\n")
sub(A, '''      <Route path="/marketplace" element={<PrivateRoute><MarketplaceScreen /></PrivateRoute>} />
      <Route path="/marketplace/new" element={<PrivateRoute><CreateListingScreen /></PrivateRoute>} />
      <Route path="/marketplace/mine" element={<PrivateRoute><MyListingsScreen /></PrivateRoute>} />
      <Route path="/marketplace/:id" element={<PrivateRoute><ListingDetailScreen /></PrivateRoute>} />

''', "")
sub(A, '''  const { mode } = useApp();
  if (mode === 'checking') return <SplashScreen />;
  if (mode === 'signed-out') return <Navigate to="/welcome" replace />;
  return children;''', '''  const { mode, user } = useApp();
  if (mode === 'checking') return <SplashScreen />;
  if (mode === 'signed-out') return <Navigate to="/welcome" replace />;
  if (user?.role === 'buyer' || user?.role === 'vet') return <WebsiteOnlyScreen />;
  return children;''')

M = 'src/screens/More.tsx'
sub(M, "ChevronRight, Users, FileText, Moon, Store,", "ChevronRight, Users, FileText, Moon,")
sub(M, "    isFarm && { icon: Store, label: 'My listings', to: '/marketplace/mine' },\n", "")
sub(M, 'description="Vaccination, calving and marketplace alerts"', 'description="Vaccination and calving alerts"')

I = 'src/lib/api.ts'
sub(I, "  remove: (id: number) => http.delete<{ message: string }>(`/workers/${id}`),",
       "  // Disabled: deleting a worker cascades to every record they entered. Use update with status 'inactive'.\n  remove: (_id: number) => Promise.reject(new Error('Deleting workers is disabled. Use Deactivate instead.')),")

for p, s in files.items():
    pathlib.Path(p).write_text(s)
print("wired")
