import pathlib
files = {}
def sub(p, old, new, count=1):
    s = files.get(p) if p in files else pathlib.Path(p).read_text()
    assert s.count(old) == count, f"{p}: expected {count} of {old[:70]!r}, found {s.count(old)}; nothing written"
    files[p] = s.replace(old, new)

H = 'src/screens/Home.tsx'
# Farm snapshot (first) and Quick actions (second) both use this grid.
sub(H, '<div className="grid grid-cols-2 gap-3">', '<div className="grid grid-cols-2 gap-3 md:grid-cols-4">', count=2)
sub(H, '<div className="space-y-2.5">\n                  {priorities.map', '<div className="space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">\n                  {priorities.map')
sub(H, '<div className="space-y-2.5">\n                  {data.recentHealth', '<div className="space-y-2.5 md:grid md:grid-cols-3 md:gap-3 md:space-y-0">\n                  {data.recentHealth')

F = 'src/screens/Farm.tsx'
sub(F, '<div className="grid grid-cols-5 gap-2">', '<div className="grid grid-cols-5 gap-2 md:mx-auto md:max-w-2xl md:gap-4">')

for p, s in files.items():
    pathlib.Path(p).write_text(s)
print("wired")
