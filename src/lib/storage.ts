import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BudgetRequest,
  CalcInput,
  CalcResult,
  Budget,
  SavedProject,
  ServiceRequest,
  User,
} from './types';

const KEYS = {
  users: 'cf_users',
  session: 'cf_session',
  projects: 'cf_projects',
  requests: 'cf_requests',
  budgets: 'cf_budgets',
  savedPlans: 'cf_saved_plans',
} as const;

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function write(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getUsers(): Promise<User[]> {
  return read<User[]>(KEYS.users, []);
}

export async function saveUsers(users: User[]): Promise<void> {
  await write(KEYS.users, users);
}

export async function getSession(): Promise<{ userId: string } | { guest: true } | null> {
  return read(KEYS.session, null);
}

export async function setSession(session: { userId: string } | { guest: true } | null): Promise<void> {
  if (!session) {
    await AsyncStorage.removeItem(KEYS.session);
  } else {
    await write(KEYS.session, session);
  }
}

export async function getProjects(): Promise<SavedProject[]> {
  return read<SavedProject[]>(KEYS.projects, []);
}

export async function saveProject(project: SavedProject): Promise<void> {
  const all = await getProjects();
  await write(KEYS.projects, [project, ...all]);
}

export async function deleteProject(id: string): Promise<void> {
  const all = await getProjects();
  await write(KEYS.projects, all.filter((p) => p.id !== id));
}

export async function updateProject(id: string, patch: Partial<SavedProject>): Promise<void> {
  const all = await getProjects();
  await write(
    KEYS.projects,
    all.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  );
}

export async function getRequests(): Promise<ServiceRequest[]> {
  return read<ServiceRequest[]>(KEYS.requests, []);
}

export async function saveRequest(request: ServiceRequest): Promise<void> {
  const all = await getRequests();
  await write(KEYS.requests, [request, ...all]);
}

export async function getBudgetRequests(): Promise<BudgetRequest[]> {
  return read<BudgetRequest[]>(KEYS.budgets, []);
}

export async function saveBudgetRequest(budget: BudgetRequest): Promise<void> {
  const all = await getBudgetRequests();
  await write(KEYS.budgets, [budget, ...all]);
}

export async function getSavedPlans(): Promise<string[]> {
  return read<string[]>(KEYS.savedPlans, []);
}

export async function toggleSavedPlan(planId: string): Promise<string[]> {
  const all = await getSavedPlans();
  const next = all.includes(planId) ? all.filter((p) => p !== planId) : [planId, ...all];
  await write(KEYS.savedPlans, next);
  return next;
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export type { CalcInput, CalcResult, Budget };
