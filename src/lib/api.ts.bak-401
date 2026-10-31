// Typed endpoint functions — mapped 1:1 to real, verified AgriPulse routes.
// See docs/mobile-api-mapping.md for the full capability matrix.
import { http, tokenStore } from './httpClient';
import type {
  AuthUser,
  Animal,
  MilkProduction,
  HealthRecord,
  Breeding,
  FinancialTransaction,
  DashboardResponse,
  MarketListing,
  AiChatSession,
  AiMessage,
  AnimalPassport,
} from '../types';

// ---- Auth: POST/GET /api/auth/* -------------------------------------------
export const AuthApi = {
  login: (email: string, password: string, remember: boolean) =>
    http.post<{ user: AuthUser; token?: string }>('/auth/login', { email, password, remember }),
  register: (payload: { name: string; email: string; password: string; role: string; farmName?: string }) =>
    http.post<{ message: string }>('/auth/register', payload),
  me: () => http.get<{ user: AuthUser }>('/auth/me'),
  logout: () => http.post<{ message: string }>('/auth/logout'),
  forgotPassword: (email: string) => http.post<{ message: string }>('/auth/forgot-password', { email }),
};

// ---- Dashboard: GET /api/dashboard -----------------------------------------
export const DashboardApi = {
  get: () => http.get<DashboardResponse>('/dashboard'),
};

// ---- Animals: /api/animals --------------------------------------------------
export const AnimalsApi = {
  list: (params?: { search?: string; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return http.get<{ animals: Animal[] }>(`/animals${qs ? `?${qs}` : ''}`);
  },
  get: (id: number) => http.get<{ animal: Animal }>(`/animals/${id}`),
  create: (payload: Partial<Animal>) => http.post<{ animal: Animal }>('/animals', payload),
  update: (id: number, payload: Partial<Animal>) => http.put<{ animal: Animal }>(`/animals/${id}`, payload),
  remove: (id: number) => http.delete<{ message: string }>(`/animals/${id}`),
  uploadPhoto: (id: number, file: File, isPrimary = false) => {
    const fd = new FormData();
    fd.append('isPrimary', String(isPrimary));
    fd.append('photo', file);
    return http.post<{ photo: unknown }>(`/animals/${id}/photos`, fd, { isFormData: true });
  },
};

// ---- Milk: /api/milk ----------------------------------------------------
export const MilkApi = {
  list: (params?: { animalId?: number; from?: string; to?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return http.get<{ records: MilkProduction[] }>(`/milk${qs ? `?${qs}` : ''}`);
  },
  create: (payload: { animalId: number; productionDate: string; quantityLiters: number; notes?: string }) =>
    http.post<{ record: MilkProduction }>('/milk', payload),
  update: (id: number, payload: Partial<MilkProduction>) => http.put<{ record: MilkProduction }>(`/milk/${id}`, payload),
  remove: (id: number) => http.delete<{ message: string }>(`/milk/${id}`),
};

// ---- Health: /api/animal-health -----------------------------------------
export const HealthApi = {
  list: (params?: { animalId?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return http.get<{ records: HealthRecord[] }>(`/animal-health${qs ? `?${qs}` : ''}`);
  },
  create: (payload: Partial<HealthRecord>) => http.post<{ record: HealthRecord }>('/animal-health', payload),
  update: (id: number, payload: Partial<HealthRecord>) => http.put<{ record: HealthRecord }>(`/animal-health/${id}`, payload),
  remove: (id: number) => http.delete<{ message: string }>(`/animal-health/${id}`),
};

// ---- Breeding: /api/breeding ----------------------------------------------
export const BreedingApi = {
  list: (params?: { animalId?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return http.get<{ records: Breeding[] }>(`/breeding${qs ? `?${qs}` : ''}`);
  },
  create: (payload: Partial<Breeding>) => http.post<{ record: Breeding }>('/breeding', payload),
  update: (id: number, payload: Partial<Breeding>) => http.put<{ record: Breeding }>(`/breeding/${id}`, payload),
};

// ---- Finance: /api/financial ------------------------------------------------
export const FinanceApi = {
  list: (params?: { type?: string; from?: string; to?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return http.get<{ records: FinancialTransaction[] }>(`/financial${qs ? `?${qs}` : ''}`);
  },
  create: (payload: Partial<FinancialTransaction>) => http.post<{ record: FinancialTransaction }>('/financial', payload),
};

// ---- Marketplace: /api/market (public browse uses optionalAuth) -----------
export const MarketApi = {
  list: (params?: { search?: string; county?: string; page?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return http.get<{ listings: MarketListing[]; total: number; page: number; pages: number }>(
      `/market${qs ? `?${qs}` : ''}`,
      { skipAuth: true },
    );
  },
  get: (id: number) => http.get<{ listing: MarketListing }>(`/market/${id}`, { skipAuth: true }),
  create: (payload: Partial<MarketListing> & { animalId: number }) => http.post<{ listing: MarketListing }>('/market', payload),
  myListings: () => http.get<{ listings: MarketListing[] }>('/market/my-listings'),
};

// ---- AI Advisor: /api/ai ---------------------------------------------------
export const AiApi = {
  sessions: () => http.get<{ sessions: AiChatSession[] }>('/ai/sessions'),
  createSession: () => http.post<{ session: AiChatSession }>('/ai/sessions'),
  messages: (sessionId: number) => http.get<{ messages: AiMessage[] }>(`/ai/sessions/${sessionId}/messages`),
  chat: (sessionId: number, message: string) => http.post<{ reply: string }>('/ai/chat', { sessionId, message }),
  context: () => http.get<{ animals: number; milk7: string; health: number; breeding: number }>('/ai/context'),
};

// ---- Digital Passport: /api/passport (PUBLIC verification endpoint) -------
export const PassportApi = {
  getByAgripulseId: (agripulseId: string) => http.get<{ passport: AnimalPassport }>(`/passport/${agripulseId}`, { skipAuth: true }),
};

// ---- Notifications: GET /api/notifications (computed server-side, no read state)
export interface FarmNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}
export const NotificationsApi = {
  list: () => http.get<{ notifications: FarmNotification[]; unread: number }>('/notifications'),
};

// ---- Workers: /api/workers (farm owner manages; server enforces roles)
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
  // Disabled: deleting a worker cascades to every record they entered. Use update with status 'inactive'.
  remove: (_id: number) => Promise.reject(new Error('Deleting workers is disabled. Use Deactivate instead.')),
};

export function clearSession() {
  tokenStore.clear();
}
