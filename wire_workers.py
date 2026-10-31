import pathlib
p = pathlib.Path('src/App.tsx'); s = p.read_text()
def sub(old, new):
    global s
    assert s.count(old) == 1, f"expected 1 of {old[:60]!r}, found {s.count(old)}; nothing written"
    s = s.replace(old, new)
sub("import { PassportScreen } from './screens/Passport';",
    "import { PassportScreen } from './screens/Passport';\nimport { WorkersScreen } from './screens/Workers';")
sub('<PlaceholderScreen title="Farm Workers" description="Manage worker accounts and permissions for your farm." />',
    '<WorkersScreen />')
p.write_text(s)
print("wired")
