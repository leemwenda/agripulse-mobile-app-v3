import pathlib
files = {}
def sub(p, old, new):
    s = files.get(p) or pathlib.Path(p).read_text()
    assert s.count(old) == 1, f"{p}: expected 1 of {old[:70]!r}, found {s.count(old)}; nothing written"
    files[p] = s.replace(old, new)

sub('src/App.tsx',
    "import { FarmListScreen, RegisterAnimalScreen, AnimalDetailScreen } from './screens/Farm';",
    "import { FarmListScreen, AnimalDetailScreen } from './screens/Farm';\nimport { RegisterAnimalScreen } from './screens/RegisterAnimal';")

sub('src/lib/api.ts',
    "  uploadPhoto: (id: number, file: File) => {\n    const fd = new FormData();\n    fd.append('photo', file);",
    "  uploadPhoto: (id: number, file: File, isPrimary = false) => {\n    const fd = new FormData();\n    fd.append('isPrimary', String(isPrimary));\n    fd.append('photo', file);")

sub('src/screens/Farm.tsx', "import { ErrorBanner } from './Home';",
    "import { ErrorBanner } from './Home';\nimport { API_BASE_URL } from '../lib/httpClient';")
sub('src/screens/Farm.tsx', '<PawPrint className="h-8 w-8" />',
    "{animal.photos && animal.photos[0] ? <img src={API_BASE_URL.replace(/\\/api$/, '') + animal.photos[0].url} alt=\"\" className=\"h-16 w-16 rounded-2xl object-cover\" /> : <PawPrint className=\"h-8 w-8\" />}")

for p, s in files.items():
    pathlib.Path(p).write_text(s)
print("wired")
