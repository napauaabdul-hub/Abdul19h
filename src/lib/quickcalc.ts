import { DEFAULT_PARAMETERS as P } from './parameters';
import { roundForUnit } from './format';

export interface QCField {
  key: string;
  label: string;
  tipo: 'num' | 'sel';
  opcoes?: { id: string; label: string }[];
  padrao: string;
  unidade?: string;
  hint?: string;
}

export interface QCLine {
  material: string;
  quantidade: number;
  unidade: string;
  obs: string;
}

export interface QCResult {
  linhas: QCLine[];
  destaques: string[];
}

export interface QuickCalcDef {
  id: string;
  titulo: string;
  icon: string;
  descricao: string;
  campos: QCField[];
  calcular: (v: Record<string, string>) => QCResult;
}

const num = (v: Record<string, string>, key: string, fallback = 0): number => {
  const n = Number((v[key] ?? '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

function item(material: string, base: number, unidade: string, obs = ''): QCLine {
  const desp = P.desperdicio[material] ?? 0.05;
  return { material, quantidade: roundForUnit(base * (1 + desp), unidade), unidade, obs: obs + (desp > 0 ? ` (incl. ${Math.round(desp * 100)}% desperdício)` : '') };
}

function betaoLinhas(volumeM3: number, ferroKgPorM3: number): QCLine[] {
  return [
    item('Cimento (saco 50 kg)', volumeM3 * P.betao.sacosCimentoPorM3, 'saco', 'Betão'),
    item('Areia', volumeM3 * P.betao.areiaM3PorM3, 'm³', ''),
    item('Pedra britada', volumeM3 * P.betao.pedraM3PorM3, 'm³', ''),
    item('Ferro (kg)', volumeM3 * ferroKgPorM3, 'kg', ''),
  ];
}

const SEL_ALVENARIA: QCField = {
  key: 'alvenaria',
  label: 'Tipo de alvenaria',
  tipo: 'sel',
  padrao: 'bloco15',
  opcoes: [
    { id: 'bloco10', label: 'Bloco 10' },
    { id: 'bloco15', label: 'Bloco 15' },
    { id: 'tijolo', label: 'Tijolo' },
  ],
};

export const QUICK_CALCS: QuickCalcDef[] = [
  {
    id: 'muros',
    titulo: 'Calculadora de muros',
    icon: 'albums',
    descricao: 'Blocos, argamassa e mão de obra para um muro de vedação ou divisória.',
    campos: [
      { key: 'comp', label: 'Comprimento do muro (m)', tipo: 'num', padrao: '10', unidade: 'm' },
      { key: 'alt', label: 'Altura do muro (m)', tipo: 'num', padrao: '2', unidade: 'm' },
      SEL_ALVENARIA,
    ],
    calcular: (v) => {
      const comp = num(v, 'comp', 10);
      const alt = num(v, 'alt', 2);
      const area = comp * alt;
      const tipo = v.alvenaria || 'bloco15';
      const nomeBloco = tipo === 'bloco10' ? 'Bloco de 10' : tipo === 'bloco15' ? 'Bloco de 15' : 'Tijolo';
      const blocos = area * P.alvenaria.blocosPorM2[tipo as 'bloco10' | 'bloco15' | 'tijolo'];
      const arg = area * P.alvenaria.argamassaM3PorM2[tipo as 'bloco10' | 'bloco15' | 'tijolo'];
      return {
        destaques: [`Área do muro: ${area.toFixed(1)} m²`, `Paletes estimadas: ${Math.ceil(blocos / 120)}`],
        linhas: [
          item(nomeBloco, blocos, 'un', 'Assentamento'),
          item('Cimento (saco 50 kg)', arg * P.betao.sacosCimentoPorM3, 'saco', 'Argamassa'),
          item('Areia', arg, 'm³', 'Argamassa'),
          item('Mão de obra especializada (dia)', area / 8, 'dia', 'Levantamento do muro'),
        ],
      };
    },
  },
  {
    id: 'lajes',
    titulo: 'Calculadora de lajes',
    icon: 'layers',
    descricao: 'Laje de vigotas e abobadilhas ou laje maciça: betão, ferro, vigotas e cofragem.',
    campos: [
      { key: 'area', label: 'Área da laje (m²)', tipo: 'num', padrao: '40', unidade: 'm²' },
      { key: 'vao', label: 'Vão (menor dimensão, m)', tipo: 'num', padrao: '4', unidade: 'm' },
      { key: 'esp', label: 'Espessura (m)', tipo: 'num', padrao: String(P.laje.espessura), unidade: 'm' },
      {
        key: 'tipo',
        label: 'Tipo de laje',
        tipo: 'sel',
        padrao: 'vigotas',
        opcoes: [
          { id: 'vigotas', label: 'Vigotas + abobadilhas' },
          { id: 'macica', label: 'Maciça' },
        ],
      },
    ],
    calcular: (v) => {
      const area = num(v, 'area', 40);
      const vao = num(v, 'vao', 4);
      const esp = num(v, 'esp', P.laje.espessura);
      const tipo = v.tipo || 'vigotas';
      const vol = area * esp;
      const linhas: QCLine[] = [...betaoLinhas(vol, P.laje.ferroKgPorM3), item('Cofragem', area, 'm²', 'Escoramento')];
      const destaques = [`Betão: ${vol.toFixed(2)} m³`];
      if (tipo === 'vigotas') {
        const nVig = Math.ceil(vao / P.laje.espacamentoVigotas) + 1;
        linhas.unshift(item('Vigota', nVig, 'un', `Vão de ${vao.toFixed(1)} m`), item('Abobadilha', area * P.laje.abobadilhasPorM2, 'un', ''));
        destaques.push(`${nVig} vigotas`);
      }
      return { destaques, linhas };
    },
  },
  {
    id: 'escadas',
    titulo: 'Calculadora de escadas',
    icon: 'git-commit',
    descricao: 'Degraus, betão e ferro para uma escada de betão entre pisos.',
    campos: [
      { key: 'alt', label: 'Altura total a vencer (m)', tipo: 'num', padrao: '2.8', unidade: 'm' },
      { key: 'largDeg', label: 'Largura do degrau (m)', tipo: 'num', padrao: '0.28', unidade: 'm' },
      { key: 'largEsc', label: 'Largura da escada (m)', tipo: 'num', padrao: '1', unidade: 'm' },
    ],
    calcular: (v) => {
      const alt = num(v, 'alt', 2.8);
      const largDeg = num(v, 'largDeg', 0.28);
      const largEsc = num(v, 'largEsc', 1);
      const degraus = Math.ceil(alt / 0.17);
      const vol = (degraus * largDeg * 0.17 * 0.5 * largEsc * 1.15);
      return {
        destaques: [`${degraus} degraus`, `Espelho ≈ ${(alt / degraus).toFixed(2)} m`, `Desenvolvimento ≈ ${((degraus - 1) * largDeg).toFixed(2)} m`],
        linhas: [
          item('Degraus', degraus, 'un', 'Contagem calculada'),
          ...betaoLinhas(vol, 90),
          item('Cofragem', degraus * largDeg * largEsc * 0.6, 'm²', ''),
        ],
      };
    },
  },
  {
    id: 'vigas-pilares',
    titulo: 'Calculadora de vigas e pilares',
    icon: 'bonfire',
    descricao: 'Betão, ferro e cofragem de pilares e vigas de uma estrutura.',
    campos: [
      { key: 'nPilares', label: 'Número de pilares', tipo: 'num', padrao: '6', unidade: 'un' },
      { key: 'lado', label: 'Lado do pilar (m)', tipo: 'num', padrao: '0.2', unidade: 'm' },
      { key: 'altP', label: 'Altura dos pilares (m)', tipo: 'num', padrao: '2.8', unidade: 'm' },
      { key: 'compViga', label: 'Comprimento total de vigas (m)', tipo: 'num', padrao: '12', unidade: 'm' },
      { key: 'largV', label: 'Largura da viga (m)', tipo: 'num', padrao: '0.15', unidade: 'm' },
      { key: 'altV', label: 'Altura da viga (m)', tipo: 'num', padrao: '0.3', unidade: 'm' },
    ],
    calcular: (v) => {
      const n = num(v, 'nPilares', 6);
      const lado = num(v, 'lado', 0.2);
      const altP = num(v, 'altP', 2.8);
      const compV = num(v, 'compViga', 12);
      const largV = num(v, 'largV', 0.15);
      const altV = num(v, 'altV', 0.3);
      const volP = n * lado * lado * altP;
      const volV = compV * largV * altV;
      const vol = volP + volV;
      return {
        destaques: [`Pilares: ${volP.toFixed(2)} m³`, `Vigas: ${volV.toFixed(2)} m³`, `Total: ${vol.toFixed(2)} m³`],
        linhas: [...betaoLinhas(vol, P.betao.ferroKgPorM3Estructura), item('Cofragem', vol * P.cofragemM2PorM3, 'm²', '')],
      };
    },
  },
  {
    id: 'reboco',
    titulo: 'Calculadora de reboco',
    icon: 'brush',
    descricao: 'Argamassa de reboco para paredes e tetos.',
    campos: [
      { key: 'area', label: 'Área a rebocar (m²)', tipo: 'num', padrao: '80', unidade: 'm²' },
      {
        key: 'lados',
        label: 'Lados',
        tipo: 'sel',
        padrao: '2',
        opcoes: [
          { id: '1', label: 'Um lado' },
          { id: '2', label: 'Dois lados' },
        ],
      },
    ],
    calcular: (v) => {
      const area = num(v, 'area', 80);
      const lados = v.lados === '1' ? 1 : 2;
      const arg = area * lados * P.reboco.argamassaM3PorM2;
      return {
        destaques: [`Argamassa: ${arg.toFixed(2)} m³`, `Área total: ${(area * lados).toFixed(1)} m²`],
        linhas: [
          item('Cimento (saco 50 kg)', arg * P.betao.sacosCimentoPorM3, 'saco', 'Argamassa de reboco'),
          item('Areia', arg, 'm³', 'Areia fina'),
        ],
      };
    },
  },
  {
    id: 'pintura',
    titulo: 'Calculadora de pintura',
    icon: 'color-palette',
    descricao: 'Tinta, selador e lixa para pintar paredes e tetos.',
    campos: [
      { key: 'area', label: 'Área a pintar (m²)', tipo: 'num', padrao: '80', unidade: 'm²' },
      { key: 'demaos', label: 'Demãos', tipo: 'num', padrao: String(P.pintura.demaos), unidade: 'un' },
    ],
    calcular: (v) => {
      const area = num(v, 'area', 80);
      const demaos = num(v, 'demaos', 2);
      const litros = (area * demaos) / P.pintura.rendementM2PorL;
      return {
        destaques: [`Tinta necessária: ${litros.toFixed(1)} L`, `Rendimento: ${P.pintura.rendementM2PorL} m²/L por demão`],
        linhas: [
          item('Tinta acrílica (L)', litros, 'L', `${demaos} demãos`),
          item('Fundo selador (L)', area / P.pintura.seladorM2PorL, 'L', ''),
          item('Lixa', area / 20, 'un', ''),
        ],
      };
    },
  },
  {
    id: 'pavimentos',
    titulo: 'Calculadora de pavimentos',
    icon: 'grid',
    descricao: 'Cerâmica e cola, ou betonilha de cimento, para o piso.',
    campos: [
      { key: 'area', label: 'Área do piso (m²)', tipo: 'num', padrao: '40', unidade: 'm²' },
      {
        key: 'tipo',
        label: 'Acabamento',
        tipo: 'sel',
        padrao: 'ceramica',
        opcoes: [
          { id: 'ceramica', label: 'Cerâmica' },
          { id: 'cimento', label: 'Cimento' },
        ],
      },
    ],
    calcular: (v) => {
      const area = num(v, 'area', 40);
      if (v.tipo === 'cimento') {
        const vol = area * P.pavimento.betonilhaM3PorM2;
        return {
          destaques: [`Betonilha: ${vol.toFixed(2)} m³`],
          linhas: [item('Cimento (saco 50 kg)', vol * P.betao.sacosCimentoPorM3, 'saco', ''), item('Areia', vol, 'm³', '')],
        };
      }
      return {
        destaques: [`Cerâmica: ${(area * P.pavimento.fatorCeramica).toFixed(1)} m² (com cortes)`],
        linhas: [
          item('Cerâmica', area * P.pavimento.fatorCeramica, 'm²', ''),
          item('Cimento cola (kg)', area * P.pavimento.colaKgPorM2, 'kg', ''),
          item('Cimento (saco 50 kg)', area * P.pavimento.betonilhaM3PorM2 * 0.5 * P.betao.sacosCimentoPorM3, 'saco', 'Betonilha de base'),
          item('Areia', area * P.pavimento.betonilhaM3PorM2 * 0.5, 'm³', 'Betonilha'),
        ],
      };
    },
  },
  {
    id: 'blocos',
    titulo: 'Calculadora de blocos',
    icon: 'cube',
    descricao: 'Quantidade de blocos, argamassa e paletes para uma área de parede.',
    campos: [
      { key: 'area', label: 'Área de parede (m²)', tipo: 'num', padrao: '30', unidade: 'm²' },
      SEL_ALVENARIA,
    ],
    calcular: (v) => {
      const area = num(v, 'area', 30);
      const tipo = v.alvenaria || 'bloco15';
      const nomeBloco = tipo === 'bloco10' ? 'Bloco de 10' : tipo === 'bloco15' ? 'Bloco de 15' : 'Tijolo';
      const blocos = area * P.alvenaria.blocosPorM2[tipo as 'bloco10' | 'bloco15' | 'tijolo'];
      const arg = area * P.alvenaria.argamassaM3PorM2[tipo as 'bloco10' | 'bloco15' | 'tijolo'];
      return {
        destaques: [`${blocos.toFixed(0)} blocos`, `≈ ${Math.ceil(blocos / 120)} paletes (120 un/palete)`],
        linhas: [
          item(nomeBloco, blocos, 'un', ''),
          item('Cimento (saco 50 kg)', arg * P.betao.sacosCimentoPorM3, 'saco', 'Argamassa'),
          item('Areia', arg, 'm³', ''),
        ],
      };
    },
  },
  {
    id: 'vigotas-abobadilhas',
    titulo: 'Calculadora de vigotas e abobadilhas',
    icon: 'reorder-four',
    descricao: 'Vigotas, abobadilhas, betão e ferro para uma laje de vigotas.',
    campos: [
      { key: 'vao', label: 'Vão da laje (m)', tipo: 'num', padrao: '4', unidade: 'm' },
      { key: 'comp', label: 'Comprimento da laje (m)', tipo: 'num', padrao: '6', unidade: 'm' },
    ],
    calcular: (v) => {
      const vao = num(v, 'vao', 4);
      const comp = num(v, 'comp', 6);
      const area = vao * comp;
      const nVig = Math.ceil(vao / P.laje.espacamentoVigotas) + 1;
      const vol = area * P.laje.espessura;
      return {
        destaques: [`${nVig} vigotas de ${comp.toFixed(1)} m`, `Área: ${area.toFixed(1)} m²`, `Abobadilhas: ${(area * P.laje.abobadilhasPorM2).toFixed(0)}`],
        linhas: [
          item('Vigota', nVig, 'un', ''),
          item('Abobadilha', area * P.laje.abobadilhasPorM2, 'un', ''),
          ...betaoLinhas(vol, P.laje.ferroKgPorM3),
          item('Cofragem', area, 'm²', ''),
        ],
      };
    },
  },
];

export function getQuickCalc(id: string): QuickCalcDef | undefined {
  return QUICK_CALCS.find((q) => q.id === id);
}
