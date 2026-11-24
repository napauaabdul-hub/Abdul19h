import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BudgetRequest,
  CalcInput,
  CalcResult,
  Budget,
  SavedProject,
  Service,
  ServiceRequest,
  User,
  HousePlan,
  MaterialPrice,
  Obra,
  StageId,
} from './types';
import { CalcParameters } from './parameters';

const KEYS = {
  users: 'cf_users',
  session: 'cf_session',
  projects: 'cf_projects',
  requests: 'cf_requests',
  budgets: 'cf_budgets',
  savedPlans: 'cf_saved_plans',
  services: 'cf_services_v2',
  plans: 'cf_plans_v2',
  prices: 'cf_prices_v2',
  params: 'cf_params_v2',
  admins: 'cf_admins',
  adminSession: 'cf_admin_session',
  obras: 'cf_obras',
} as const;

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function hashSenha(senha: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < senha.length; i++) {
    h1 = Math.imul(h1 ^ senha.charCodeAt(i), 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ senha.charCodeAt(senha.length - 1 - i), 0x85ebca6b) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

export async function getUsers(): Promise<User[]> {
  return readJson<User[]>(KEYS.users, []);
}

export async function saveUsers(users: User[]): Promise<void> {
  await writeJson(KEYS.users, users);
}

export async function updateUser(id: string, patch: Partial<User>): Promise<void> {
  const all = await getUsers();
  await writeJson(
    KEYS.users,
    all.map((u) => (u.id === id ? { ...u, ...patch } : u)),
  );
}

export async function getSession(): Promise<{ userId: string } | { guest: true } | null> {
  return readJson(KEYS.session, null);
}

export async function setSession(session: { userId: string } | { guest: true } | null): Promise<void> {
  if (!session) {
    await AsyncStorage.removeItem(KEYS.session);
  } else {
    await writeJson(KEYS.session, session);
  }
}

export async function getProjects(): Promise<SavedProject[]> {
  return readJson<SavedProject[]>(KEYS.projects, []);
}

export async function saveProject(project: SavedProject): Promise<void> {
  const all = await getProjects();
  await writeJson(KEYS.projects, [project, ...all]);
}

export async function deleteProject(id: string): Promise<void> {
  const all = await getProjects();
  await writeJson(KEYS.projects, all.filter((p) => p.id !== id));
}

export async function updateProject(id: string, patch: Partial<SavedProject>): Promise<void> {
  const all = await getProjects();
  await writeJson(
    KEYS.projects,
    all.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  );
}

export async function getRequests(): Promise<ServiceRequest[]> {
  return readJson<ServiceRequest[]>(KEYS.requests, []);
}

export async function saveRequest(request: ServiceRequest): Promise<void> {
  const all = await getRequests();
  await writeJson(KEYS.requests, [request, ...all]);
}

export async function updateRequestEstado(id: string, estado: ServiceRequest['estado']): Promise<void> {
  const all = await getRequests();
  await writeJson(
    KEYS.requests,
    all.map((r) => (r.id === id ? { ...r, estado } : r)),
  );
}

export async function getBudgetRequests(): Promise<BudgetRequest[]> {
  return readJson<BudgetRequest[]>(KEYS.budgets, []);
}

export async function saveBudgetRequest(budget: BudgetRequest): Promise<void> {
  const all = await getBudgetRequests();
  await writeJson(KEYS.budgets, [budget, ...all]);
}

export async function updateBudgetEstado(id: string, estado: BudgetRequest['estado']): Promise<void> {
  const all = await getBudgetRequests();
  await writeJson(
    KEYS.budgets,
    all.map((b) => (b.id === id ? { ...b, estado } : b)),
  );
}

export async function getSavedPlans(): Promise<string[]> {
  return readJson<string[]>(KEYS.savedPlans, []);
}

export async function toggleSavedPlan(planId: string): Promise<string[]> {
  const all = await getSavedPlans();
  const next = all.includes(planId) ? all.filter((p) => p !== planId) : [planId, ...all];
  await writeJson(KEYS.savedPlans, next);
  return next;
}

export async function getServiceOverrides(): Promise<Service[] | null> {
  return readJson<Service[] | null>(KEYS.services, null);
}

export async function saveServices(services: Service[]): Promise<void> {
  await writeJson(KEYS.services, services);
}

export async function getPlanOverrides(): Promise<HousePlan[] | null> {
  return readJson<HousePlan[] | null>(KEYS.plans, null);
}

export async function savePlans(plans: HousePlan[]): Promise<void> {
  await writeJson(KEYS.plans, plans);
}

export async function getPriceOverrides(): Promise<MaterialPrice[] | null> {
  return readJson<MaterialPrice[] | null>(KEYS.prices, null);
}

export async function savePrices(prices: MaterialPrice[]): Promise<void> {
  await writeJson(KEYS.prices, prices);
}

export async function getParamsOverride(): Promise<Partial<CalcParameters> | null> {
  return readJson<Partial<CalcParameters> | null>(KEYS.params, null);
}

export async function saveParamsOverride(override: Partial<CalcParameters>): Promise<void> {
  await writeJson(KEYS.params, override);
}

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
}

export async function getAdmins(): Promise<AdminUser[]> {
  const existing = await readJson<AdminUser[]>(KEYS.admins, []);
  if (existing.length > 0) return existing;
  const seed: AdminUser = {
    id: 'admin-seed',
    nome: 'Administrador',
    email: 'admin@napauabuild.mz',
    senhaHash: hashSenha('admin123'),
  };
  await writeJson(KEYS.admins, [seed]);
  return [seed];
}

export async function getAdminSession(): Promise<{ adminId: string } | null> {
  return readJson(KEYS.adminSession, null);
}

export async function setAdminSession(session: { adminId: string } | null): Promise<void> {
  if (!session) {
    await AsyncStorage.removeItem(KEYS.adminSession);
  } else {
    await writeJson(KEYS.adminSession, session);
  }
}

export async function getObras(): Promise<Obra[]> {
  return readJson<Obra[]>(KEYS.obras, []);
}

export async function saveObras(obras: Obra[]): Promise<void> {
  await writeJson(KEYS.obras, obras);
}

export async function toggleEtapaObra(obraId: string, etapa: StageId): Promise<void> {
  const all = await getObras();
  await writeJson(
    KEYS.obras,
    all.map((o) =>
      o.id === obraId
        ? {
            ...o,
            etapasFeitas: o.etapasFeitas.includes(etapa)
              ? o.etapasFeitas.filter((e) => e !== etapa)
              : [...o.etapasFeitas, etapa],
          }
        : o,
    ),
  );
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export type { CalcInput, CalcResult, Budget };
