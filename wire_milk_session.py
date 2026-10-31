import pathlib
files = {}
def sub(p, old, new, count=1):
    s = files[p] if p in files else pathlib.Path(p).read_text()
    assert s.count(old) == count, f"{p}: expected {count} of {old[:70]!r}, found {s.count(old)}; nothing written"
    files[p] = s.replace(old, new)

T = 'src/types/index.ts'
sub(T, "  productionDate: string;\n  quantityLiters: number;",
       "  productionDate: string;\n  session?: 'morning' | 'evening';\n  quantityLiters: number;")

A = 'src/lib/api.ts'
sub(A, "{ animalId: number; productionDate: string; quantityLiters: number; notes?: string }",
       "{ animalId: number; productionDate: string; session?: 'morning' | 'evening'; quantityLiters: number; notes?: string }")

R = 'src/screens/Records.tsx'
sub(R, "quantityLiters: '', notes: '' }", "quantityLiters: '', session: 'morning', notes: '' }", count=2)
sub(R, "quantityLiters: Number(form.quantityLiters), notes: form.notes });",
       "quantityLiters: Number(form.quantityLiters), session: form.session as 'morning' | 'evening', notes: form.notes });")
sub(R, '          <FormField label="Quantity (liters) *">',
'''          <FormField label="Milking session *">
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              {(['morning', 'evening'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, session: s })}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold capitalize transition ${form.session === s ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Quantity (liters) *">''')
sub(R, '<p className="text-xs text-slate-500">{formatDate(r.productionDate)}</p>',
       '<p className="text-xs text-slate-500">{formatDate(r.productionDate)}{r.session ? ` · ${r.session === \'evening\' ? \'Evening\' : \'Morning\'}` : \'\'}</p>')
sub(R, "A record for this animal on this date already exists. Edit it instead of creating a duplicate.",
       "A record for this animal, date and session already exists. Edit it instead of creating a duplicate.")

for p, s in files.items():
    pathlib.Path(p).write_text(s)
print("wired")
