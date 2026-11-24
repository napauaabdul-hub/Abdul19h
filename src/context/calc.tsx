import React, { createContext, useContext, useMemo, useState } from 'react';
import { CalcInput, CalcResult } from '../lib/types';
import { computeAll, STAGES } from '../lib/calculator';

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
  reset: () => void;
}

const CalcContext = createContext<CalcContextValue | null>(null);

export function CalcProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraftState] = useState<CalcInput>(defaultInput());

  const setDraft = (patch: Partial<CalcInput>) => setDraftState((d) => ({ ...d, ...patch }));

  const toggleEtapa = (id: CalcInput['etapas'][number]) =>
    setDraftState((d) => ({
      ...d,
      etapas: d.etapas.includes(id) ? d.etapas.filter((e) => e !== id) : [...d.etapas, id],
    }));

  const resultado = useMemo(() => computeAll(draft), [draft]);

  const reset = () => setDraftState(defaultInput());

  const value = useMemo(
    () => ({ draft, setDraft, toggleEtapa, resultado, reset }),
    [draft, resultado],
  );

  return <CalcContext.Provider value={value}>{children}</CalcContext.Provider>;
}

export function useCalc(): CalcContextValue {
  const ctx = useContext(CalcContext);
  if (!ctx) throw new Error('useCalc fora do CalcProvider');
  return ctx;
}
