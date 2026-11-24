import { HOUSE_PLANS } from './data/plans';
import { SERVICES } from './data/services';
import { MATERIAL_PRICES } from './materials';
import { CalcParameters, DEFAULT_PARAMETERS } from './parameters';
import {
  getParamsOverride,
  getPlanOverrides,
  getPriceOverrides,
  getServiceOverrides,
} from './storage';
import { HousePlan, MaterialPrice, Service } from './types';

export async function getServices(): Promise<Service[]> {
  return (await getServiceOverrides()) ?? SERVICES;
}

export async function getServiceById(id: string): Promise<Service | undefined> {
  const all = await getServices();
  return all.find((s) => s.id === id);
}

export async function getPlans(): Promise<HousePlan[]> {
  return (await getPlanOverrides()) ?? HOUSE_PLANS;
}

export async function getPlanById(id: string): Promise<HousePlan | undefined> {
  const all = await getPlans();
  return all.find((p) => p.id === id);
}

export async function getPrices(): Promise<MaterialPrice[]> {
  return (await getPriceOverrides()) ?? MATERIAL_PRICES;
}

export async function precoDe(nome: string, unidade: string): Promise<number> {
  const all = await getPrices();
  const encontrado = all.find((m) => m.nome === nome && m.unidade === unidade);
  return encontrado ? encontrado.precoMT : 0;
}

export async function getParams(): Promise<CalcParameters> {
  const override = await getParamsOverride();
  if (!override) return DEFAULT_PARAMETERS;
  const merged: CalcParameters = { ...DEFAULT_PARAMETERS, ...override };
  if (override.desperdicio) {
    merged.desperdicio = { ...DEFAULT_PARAMETERS.desperdicio, ...override.desperdicio };
  }
  if (override.betao) merged.betao = { ...DEFAULT_PARAMETERS.betao, ...override.betao };
  if (override.alvenaria) {
    merged.alvenaria = {
      ...DEFAULT_PARAMETERS.alvenaria,
      ...override.alvenaria,
      blocosPorM2: { ...DEFAULT_PARAMETERS.alvenaria.blocosPorM2, ...override.alvenaria.blocosPorM2 },
      argamassaM3PorM2: { ...DEFAULT_PARAMETERS.alvenaria.argamassaM3PorM2, ...override.alvenaria.argamassaM3PorM2 },
    };
  }
  if (override.laje) merged.laje = { ...DEFAULT_PARAMETERS.laje, ...override.laje };
  if (override.pintura) merged.pintura = { ...DEFAULT_PARAMETERS.pintura, ...override.pintura };
  return merged;
}
