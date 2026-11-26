export interface CalcParameters {
  escavacao: { larguraVala: number; profundidade: number };
  betao: {
    sacosCimentoPorM3: number;
    areiaM3PorM3: number;
    pedraM3PorM3: number;
    ferroKgPorM3Fundacao: number;
    ferroKgPorM3Estructura: number;
    arameKgPorM3: number;
  };
  vigaFundacao: { largura: number; altura: number };
  pilar: { lado: number; espacamentoMax: number; alturaPadrao: number };
  vigaCinta: { largura: number; altura: number };
  cofragemM2PorM3: number;
  alvenaria: {
    blocosPorM2: Record<'bloco10' | 'bloco15' | 'tijolo', number>;
    argamassaM3PorM2: Record<'bloco10' | 'bloco15' | 'tijolo', number>;
    porta: { largura: number; altura: number };
    janela: { largura: number; altura: number };
  };
  verga: { largura: number; altura: number; ferroKgPorM: number; acrescimoPorta: number; acrescimoJanela: number };
  laje: {
    espessura: number;
    ferroKgPorM3: number;
    espacamentoVigotas: number;
    abobadilhasPorM2: number;
  };
  cobertura: {
    fatorArea: number;
    areaUtilChapa: number;
    telhasPorM2: number;
    ripasMPorM2: number;
    calhaMPorM: number;
  };
  reboco: { argamassaM3PorM2: number; lados: number };
  pavimento: {
    betonilhaM3PorM2: number;
    colaKgPorM2: number;
    fatorCeramica: number;
  };
  hidraulica: {
    pontosPorBanho: number;
    tubo25MPorPonto: number;
    tubo50MPorBanho: number;
    tubo110MPorBanho: number;
    joelhosPorPonto: number;
  };
  eletrica: {
    pontosPorQuarto: number;
    pontosSala: number;
    pontosCozinha: number;
    pontosPorBanho: number;
    pontosExtra: number;
    fio25MPorPonto: number;
    fio15MPorPonto: number;
    eletrodutoMPorM2: number;
    disjuntoresPorPontos: number;
  };
  pintura: { rendementM2PorL: number; demaos: number; seladorM2PorL: number };
  azulejo: { m2PorBanho: number; m2Cozinha: number; colaKgPorM2: number };
  desperdicio: Record<string, number>;
}

export const DEFAULT_PARAMETERS: CalcParameters = {
  escavacao: { larguraVala: 0.5, profundidade: 0.6 },
  betao: {
    sacosCimentoPorM3: 7,
    areiaM3PorM3: 0.5,
    pedraM3PorM3: 0.9,
    ferroKgPorM3Fundacao: 80,
    ferroKgPorM3Estructura: 110,
    arameKgPorM3: 1,
  },
  vigaFundacao: { largura: 0.25, altura: 0.3 },
  pilar: { lado: 0.2, espacamentoMax: 3, alturaPadrao: 2.8 },
  vigaCinta: { largura: 0.15, altura: 0.3 },
  cofragemM2PorM3: 8,
  alvenaria: {
    blocosPorM2: { bloco10: 12.5, bloco15: 12.5, tijolo: 55 },
    argamassaM3PorM2: { bloco10: 0.025, bloco15: 0.03, tijolo: 0.03 },
    porta: { largura: 0.9, altura: 2.1 },
    janela: { largura: 1.2, altura: 1.2 },
  },
  verga: { largura: 0.15, altura: 0.2, ferroKgPorM: 2.5, acrescimoPorta: 0.4, acrescimoJanela: 0.4 },
  laje: { espessura: 0.12, ferroKgPorM3: 110, espacamentoVigotas: 0.5, abobadilhasPorM2: 8 },
  cobertura: { fatorArea: 1.15, areaUtilChapa: 1.9, telhasPorM2: 10, ripasMPorM2: 3.5, calhaMPorM: 4 },
  reboco: { argamassaM3PorM2: 0.02, lados: 2 },
  pavimento: { betonilhaM3PorM2: 0.04, colaKgPorM2: 5, fatorCeramica: 1.05 },
  hidraulica: {
    pontosPorBanho: 3,
    tubo25MPorPonto: 6,
    tubo50MPorBanho: 4,
    tubo110MPorBanho: 2,
    joelhosPorPonto: 4,
  },
  eletrica: {
    pontosPorQuarto: 2,
    pontosSala: 2,
    pontosCozinha: 3,
    pontosPorBanho: 1,
    pontosExtra: 2,
    fio25MPorPonto: 8,
    fio15MPorPonto: 4,
    eletrodutoMPorM2: 1.5,
    disjuntoresPorPontos: 6,
  },
  pintura: { rendementM2PorL: 12, demaos: 2, seladorM2PorL: 15 },
  azulejo: { m2PorBanho: 6, m2Cozinha: 4, colaKgPorM2: 5 },
  desperdicio: {
    'Cimento (saco 50 kg)': 0.05,
    Areia: 0.1,
    'Pedra britada': 0.1,
    'Ferro (kg)': 0.07,
    'Arame recozido (kg)': 0.05,
    'Bloco de 10': 0.05,
    'Bloco de 15': 0.05,
    Tijolo: 0.05,
    Vigota: 0.02,
    Abobadilha: 0.05,
    'Chapa de zinco (3 m)': 0.05,
    Telha: 0.05,
    Cerâmica: 0.08,
    Azulejo: 0.08,
    'Tinta acrílica (L)': 0.1,
    'Fundo selador (L)': 0.1,
    'Cimento cola (kg)': 0.05,
  },
};

export const DESPERDICIO_PADRAO = 0.05;
