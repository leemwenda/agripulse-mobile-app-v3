// ============================================================================
// AgriPulse Mobile — Domain Types
// These mirror the REAL Prisma schema / API response shapes found in the
// agripulse-node repository (prisma/schema.prisma + src/routes/*).
// They are kept in sync with the authoritative backend contract — no fields
// are invented beyond what the audited source code defines.
// ============================================================================

export type Role = 'superadmin' | 'admin' | 'worker' | 'buyer' | 'vet';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  farmId: number | null;
  farmName?: string | null;
  county?: string | null;
  phone?: string | null;
}

export type AnimalGender = 'male' | 'female';
export type AnimalStatus = 'active' | 'sold' | 'deceased' | 'archived';
export type AnimalCategory = 'calf' | 'heifer' | 'cow' | 'bull_calf' | 'young_bull' | 'bull';

export interface AnimalPhoto {
  id: number;
  url: string;
  isPrimary: boolean;
}

export interface Animal {
  id: number;
  farmId: number;
  name: string;
  tagNumber: string;
  breed: string;
  gender: AnimalGender;
  category?: AnimalCategory | null;
  dateOfBirth: string;
  color?: string | null;
  notes?: string | null;
  agripulseId?: string | null;
  status: AnimalStatus;
  createdAt: string;
  photos?: AnimalPhoto[];
}

export interface MilkProduction {
  id: number;
  animalId: number;
  farmId: number;
  productionDate: string;
  session?: 'morning' | 'evening';
  quantityLiters: number;
  notes?: string | null;
  recordedBy?: number | null;
  createdAt: string;
  animal?: Pick<Animal, 'id' | 'name' | 'tagNumber'>;
}

export interface HealthRecord {
  id: number;
  animalId: number;
  farmId: number;
  recordDate: string;
  condition: string;
  treatment?: string | null;
  doctorName?: string | null;
  vaccination?: string | null;
  notes?: string | null;
  createdAt: string;
  animal?: Pick<Animal, 'id' | 'name' | 'tagNumber'>;
}

export type BreedingStatus = 'pending' | 'confirmed' | 'pregnant' | 'calved' | 'failed';

export interface Breeding {
  id: number;
  animalId: number;
  farmId: number;
  serviceDate: string;
  bullName?: string | null;
  expectedBirthDate?: string | null;
  actualBirthDate?: string | null;
  pregnancyStatus: BreedingStatus;
  notes?: string | null;
  createdAt: string;
  animal?: Pick<Animal, 'id' | 'name' | 'tagNumber'>;
}

export type TransactionType = 'income' | 'expense';

export interface FinancialTransaction {
  id: number;
  farmId: number;
  type: TransactionType;
  category: string;
  amount: number;
  description?: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface DashboardStats {
  totalAnimals: number;
  femaleAnimals: number;
  maleAnimals: number;
  todayMilk: number;
  monthMilk: number;
  activePregnant: number;
  monthIncome: number;
  monthExpense: number;
  monthProfit: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  upcomingBirths: Breeding[];
  recentHealth: HealthRecord[];
  topProducers: { animalId: number; _sum: { quantityLiters: number }; animal?: { name: string; tagNumber: string } }[];
  weeklyTrend: { productionDate: string; _sum: { quantityLiters: number } }[];
  recentTransactions: FinancialTransaction[];
}

export type MarketListingStatus = 'active' | 'pending' | 'sold' | 'expired' | 'removed';

export interface MarketPhoto {
  id: number;
  url: string;
}

export interface MarketListing {
  id: number;
  animalId: number;
  sellerId: number;
  title: string;
  description?: string | null;
  askingPrice: number;
  negotiable: boolean;
  county: string;
  town?: string | null;
  status: MarketListingStatus;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  photos?: MarketPhoto[];
  animal?: Pick<Animal, 'id' | 'name' | 'tagNumber' | 'breed' | 'gender'>;
  seller?: { id: number; name: string };
}

export interface AiChatSession {
  id: number;
  title: string;
  updatedAt: string;
}

export interface AiMessage {
  id: number;
  role: 'user' | 'assistant';
  message: string;
}

export interface AnimalPassport {
  id: number;
  name: string;
  tagNumber: string;
  breed: string;
  gender: AnimalGender;
  dateOfBirth: string;
  agripulseId?: string | null;
  status: AnimalStatus;
  photos: AnimalPhoto[];
  healthRecords: HealthRecord[];
  milkProduction: MilkProduction[];
  breeding: Breeding[];
  farm: { id: number; name: string } | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface ApiErrorShape {
  error: string;
  code?: string;
}
