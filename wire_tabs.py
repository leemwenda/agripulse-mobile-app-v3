import pathlib
p = pathlib.Path('src/components/layout.tsx'); s = p.read_text()
def sub(old, new):
    global s
    assert s.count(old) == 1, f"expected 1 of {old[:60]!r}, found {s.count(old)}; nothing written"
    s = s.replace(old, new)
assert 'useApp' in s, "useApp is not imported in layout.tsx; nothing written"
sub("export function BottomNav() {\n  return (",
    "export function BottomNav() {\n  const { user } = useApp();\n  const hideFarm = user?.role === 'buyer' || user?.role === 'vet';\n  const tabs = TABS.filter((t) => !(hideFarm && t.to === '/farm'));\n  return (")
sub("{TABS.map((tab) => (", "{tabs.map((tab) => (")
p.write_text(s)
print("wired")
