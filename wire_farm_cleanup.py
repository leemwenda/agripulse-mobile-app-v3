import pathlib
P = 'src/screens/Farm.tsx'
s = pathlib.Path(P).read_text()
a = "export function RegisterAnimalScreen() {"
b = "export function AnimalDetailScreen() {"
assert s.count(a) == 1 and s.count(b) == 1, f"markers found {s.count(a)}/{s.count(b)}; nothing written"
i, j = s.index(a), s.index(b)
assert i < j, "markers out of order; nothing written"
pathlib.Path(P).write_text(s[:i] + s[j:])
print("wired")
