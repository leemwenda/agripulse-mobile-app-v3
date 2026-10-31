import pathlib
P = 'src/screens/EditAnimal.tsx'
s = pathlib.Path(P).read_text()
def sub(old, new):
    global s
    assert s.count(old) == 1, f"expected 1 of {old[:70]!r}, found {s.count(old)}; nothing written"
    s = s.replace(old, new)

# 1. Remove the unused category list and Category type
i = s.index("type Category = NonNullable<Animal['category']>;")
j = s.index("export function EditAnimalScreen()")
s = s[:i] + s[j:]

# 2. Drop category from form state
sub("color: '', notes: '', status: 'active', category: '',", "color: '', notes: '', status: 'active',")
sub("      status: animal.status,\n      category: animal.category || '',\n", "      status: animal.status,\n")

# 3. Do not send category on save
sub("        category: (form.category || null) as Animal['category'],\n", "")

# 4. Replace the picker with a read-only line
sub("""        <FormField label="Category">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Not set</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </FormField>""",
"""        <FormField label="Category" hint="Set automatically from gender and age">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm capitalize text-slate-600">
            {animal.category ? animal.category.replace('_', ' ') : 'Not yet assigned'}
          </p>
        </FormField>""")

pathlib.Path(P).write_text(s)
print("wired")
