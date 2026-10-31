import pathlib
p = pathlib.Path('src/lib/api.ts'); s = p.read_text()
old = "export function clearSession() {"
assert s.count(old) == 1, f"expected 1, found {s.count(old)}; nothing written"
new = """// ---- Workers: /api/workers (farm owner manages; server enforces roles)
export interface FarmWorker {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}
export const WorkersApi = {
  list: () => http.get<{ workers: FarmWorker[] }>('/workers'),
  create: (payload: { name: string; email: string; password: string }) =>
    http.post<{ worker: FarmWorker }>('/workers', { ...payload, status: 'active' }),
  update: (id: number, payload: { name: string; email: string; status: 'active' | 'inactive'; password?: string }) =>
    http.put<{ worker: FarmWorker }>(`/workers/${id}`, payload),
  remove: (id: number) => http.delete<{ message: string }>(`/workers/${id}`),
};

export function clearSession() {"""
p.write_text(s.replace(old, new))
print("api ok")
