import pathlib
files = {}
def sub(p, old, new):
    s = files[p] if p in files else pathlib.Path(p).read_text()
    assert s.count(old) == 1, f"{p}: expected 1 of {old[:70]!r}, found {s.count(old)}; nothing written"
    files[p] = s.replace(old, new)

A = 'src/App.tsx'
sub(A, "import { WorkersScreen } from './screens/Workers';",
    "import { WorkersScreen } from './screens/Workers';\nimport { EditAnimalScreen } from './screens/EditAnimal';")
sub(A, '<Route path="/farm/:id" element={<PrivateRoute><AnimalDetailScreen /></PrivateRoute>} />',
    '<Route path="/farm/:id/edit" element={<PrivateRoute><EditAnimalScreen /></PrivateRoute>} />\n      <Route path="/farm/:id" element={<PrivateRoute><AnimalDetailScreen /></PrivateRoute>} />')

F = 'src/screens/Farm.tsx'
sub(F, "QrCode, ChevronRight, Tag } from 'lucide-react';",
    "QrCode, ChevronRight, Tag } from 'lucide-react';\nimport { useApp } from '../context/AppContext';")
sub(F, "export function AnimalDetailScreen() {\n  const { id } = useParams();\n  const navigate = useNavigate();",
    "export function AnimalDetailScreen() {\n  const { id } = useParams();\n  const navigate = useNavigate();\n  const { user } = useApp();")
sub(F, "          <QrCode className=\"h-4 w-4\" /> View digital passport & QR code\n        </Button>",
    "          <QrCode className=\"h-4 w-4\" /> View digital passport & QR code\n        </Button>\n\n        {user?.role === 'admin' && (\n          <Button variant=\"outline\" fullWidth onClick={() => navigate(`/farm/${animal.id}/edit`)}>Edit animal</Button>\n        )}")
sub(F, "<Row label=\"Colour\" value={animal.color || '—'} />",
    "<Row label=\"Category\" value={animal.category ? animal.category.replace('_', ' ') : '—'} />\n            <Row label=\"Colour\" value={animal.color || '—'} />")

for p, s in files.items():
    pathlib.Path(p).write_text(s)
print("wired")
