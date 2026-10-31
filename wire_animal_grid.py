import pathlib
P = 'src/screens/Farm.tsx'
s = pathlib.Path(P).read_text()
old = '<div className="space-y-2.5">\n          {filtered.map((a) => ('
assert s.count(old) == 1, f"expected 1, found {s.count(old)}; nothing written"
s = s.replace(old, '<div className="space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 lg:grid-cols-3">\n          {filtered.map((a) => (')
pathlib.Path(P).write_text(s)
print("wired")
