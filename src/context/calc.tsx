import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CalcInput, CalcResult } from '../lib/types';
import { computeAll, STAGES } from '../lib/calculator';
import { getParams } from '../lib/catalog';
import { CalcParameters, DEFAULT_PARAMETERS } from '../lib/parameters';

export const ALL_STAGE_IDS = STAGES.map((s) => s.id);

export function defaultInput(): CalcInput {
  return {
    tipo: 'T2',
    comprimento: 9,
    largura: 6,
    quartos: 2,
    banhos: 1,
    sala: 1,
    cozinha: 1,
    alturaParedes: 2.8,
    espessuraParedes: 0.15,
    portas: 4,
    janelas: 4,
    pisos: 1,
    alvenaria: 'bloco15',
    estrutura: 'betaoArmado',
    cobertura: 'chapas',
    pavimento: 'cimento',
    etapas: [...ALL_STAGE_IDS],
  };
}

interface CalcContextValue {
  draft: CalcInput;
  setDraft: (patch: Partial<CalcInput>) => void;
  toggleEtapa: (id: CalcInput['etapas'][number]) => void;
  resultado: CalcResult;
  params: CalcParameters;
  reset: () => void;
}

const CalcContext = createContext<CalcContextValue | null>(null);

export function CalcProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraftState] = useState<CalcInput>(defaultInput());
  const [params, setParams] = useState<CalcParameters>(DEFAULT_PARAMETERS);

  useEffect(() => {
    getParams().then(setParams).catch(() => setParams(DEFAULT_PARAMETERS));
  }, []);

  const setDraft = (patch: Partial<CalcInput>) => setDraftState((d) => ({ ...d, ...patch }));

  const toggleEtapa = (id: CalcInput['etapas'][number]) =>
    setDraftState((d) => ({
      ...d,
      etapas: d.etapas.includes(id) ? d.etapas.filter((e) => e !== id) : [...d.etapas, id],
    }));

  const resultado = useMemo(() => computeAll(draft, params), [draft, params]);

  const reset = () => setDraftState(defaultInput());

  const value = useMemo(
    () => ({ draft, setDraft, toggleEtapa, resultado, params, reset }),
    [draft, resultado, params],
  );

  return <CalcContext.Provider value={value}>{children}</CalcContext.Provider>;
}

export function useCalc(): CalcContextValue {
  const ctx = useContext(CalcContext);
  if (!ctx) throw new Error('useCalc fora do CalcProvider');
  return ctx;
}
