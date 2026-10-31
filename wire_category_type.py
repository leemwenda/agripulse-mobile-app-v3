import pathlib, re
P = 'src/types/index.ts'
s = pathlib.Path(P).read_text()
pat = re.compile(r"export type AnimalCategory\s*=[^;]*;")
n = len(pat.findall(s))
assert n == 1, f"expected 1 AnimalCategory type alias, found {n}; nothing written"
s = pat.sub("export type AnimalCategory = 'calf' | 'heifer' | 'cow' | 'bull_calf' | 'young_bull' | 'bull';", s)
pathlib.Path(P).write_text(s)
print("wired")
