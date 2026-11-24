import {
  CalcInput,
  CalcResult,
  MaterialItem,
  StageId,
  StageResult,
} from './types';
import { CalcParameters, DEFAULT_PARAMETERS, DESPERDICIO_PADRAO } from './parameters';
import { roundForUnit } from './format';

export interface StageDef {
  id: StageId;
  titulo: string;
  descricao: string;
}

export const STAGES: StageDef[] = [
  { id: 'preparacao', titulo: 'Preparação e limpeza do terreno', descricao: 'Limpeza, desmatação e nivelamento da área de construção.' },
  { id: 'escavacao', titulo: 'Escavação', descricao: 'Abertura de valas perimetrais para as vigas de fundação.' },
  { id: 'fundacao', titulo: 'Fundação', descricao: 'Betão ciclópeo/armado das valas de fundação.' },
  { id: 'vigas-fundacao', titulo: 'Vigas de fundação', descricao: 'Vigas baldrame que ligam os elementos da fundação.' },
  { id: 'pilares-vigas', titulo: 'Pilares e vigas', descricao: 'Pilares, vigas de cinta e estrutura vertical.' },
  { id: 'alvenaria', titulo: 'Alvenaria', descricao: 'Levantamento das paredes de vedação.' },
  { id: 'vergas', titulo: 'Vergas e elementos complementares', descricao: 'Vergas sobre portas e janelas e contravergas.' },
  { id: 'lajes', titulo: 'Lajes, vigotas e abobadilhas', descricao: 'Laje entre pisos e laje de cobertura, quando aplicável.' },
  { id: 'cobertura', titulo: 'Cobertura', descricao: 'Chapas, telhas ou impermeabilização da laje.' },
  { id: 'reboco', titulo: 'Reboco', descricao: 'Reboco interno e externo das paredes e tetos.' },
  { id: 'pavimento', titulo: 'Pavimentos', descricao: 'Betonilha de cimento ou assentamento de cerâmica.' },
  { id: 'hidraulica', titulo: 'Canalização e instalação hidráulica', descricao: 'Tubagens de água fria, esgoto e louças.' },
  { id: 'eletrica', titulo: 'Instalação elétrica', descricao: 'Fios, eletrodutos, tomadas, interruptores e quadro.' },
  { id: 'esquadrias', titulo: 'Portas e janelas', descricao: 'Fornecimento e assentamento de portas e janelas.' },
  { id: 'pintura', titulo: 'Pintura', descricao: 'Selador e tinta acrílica em paredes e tetos.' },
  { id: 'acabamentos', titulo: 'Acabamentos finais', descricao: 'Azulejos, louças sanitárias e detalhes finais.' },
];

interface Ctx {
  p: CalcParameters;
  input: CalcInput;
  area: number;
  perimetro: number;
  altura: number;
  areaAberturas: number;
  areaParedes: number;
  pisos: number;
  volEscavacao: number;
  nPilares: number;
}

function makeItem(p: CalcParameters, material: string, base: number, unidade: string, observacao = ''): MaterialItem {
  const desperdicio = p.desperdicio[material] ?? DESPERDICIO_PADRAO;
  const quantidade = roundForUnit(base * (1 + desperdicio), unidade);
  return { material, quantidade, unidade, desperdicio, observacao };
}

function itensBetao(p: Ctx, volumeM3: number, ferroKgPorM3: number, obsBetao: string): MaterialItem[] {
  const b = p.p.betao;
  return [
    makeItem(p.p, 'Cimento (saco 50 kg)', volumeM3 * b.sacosCimentoPorM3, 'saco', 'Dosagem estimada para ' + obsBetao),
    makeItem(p.p, 'Areia', volumeM3 * b.areiaM3PorM3, 'm³', 'Areia média para betão e argamassa'),
    makeItem(p.p, 'Pedra britada', volumeM3 * b.pedraM3PorM3, 'm³', 'Brita 1 para betão'),
    makeItem(p.p, 'Ferro (kg)', volumeM3 * ferroKgPorM3, 'kg', 'Aço CA-50/60 em varão'),
    makeItem(p.p, 'Arame recozido (kg)', volumeM3 * b.arameKgPorM3, 'kg', 'Atar armaduras'),
  ];
}

function buildCtx(input: CalcInput, p: CalcParameters): Ctx {
  const area = Math.max(0, input.comprimento * input.largura);
  const perimetro = 2 * (input.comprimento + input.largura);
  const altura = input.alturaParedes > 0 ? input.alturaParedes : p.pilar.alturaPadrao;
  const areaAberturas =
    input.portas * p.alvenaria.porta.largura * p.alvenaria.porta.altura +
    input.janelas * p.alvenaria.janela.largura * p.alvenaria.janela.altura;
  const areaParedes = Math.max(0, perimetro * altura - areaAberturas) * input.pisos;
  const volEscavacao = perimetro * p.escavacao.larguraVala * p.escavacao.profundidade;
  const nx = Math.max(2, Math.ceil(input.comprimento / p.pilar.espacamentoMax) + 1);
  const ny = Math.max(2, Math.ceil(input.largura / p.pilar.espacamentoMax) + 1);
  const nPilares = nx * ny * input.pisos;
  return { p, input, area, perimetro, altura, areaAberturas, areaParedes, pisos: input.pisos, volEscavacao, nPilares };
}

function stageItens(ctx: Ctx): Record<StageId, MaterialItem[]> {
  const { p, input } = ctx;
  const lajeArea =
    ctx.area * (ctx.pisos > 1 ? ctx.pisos - 1 : 0) + (input.cobertura === 'laje' ? ctx.area : 0);
  const areaReboco =
    ctx.areaParedes * p.reboco.lados + (input.cobertura === 'laje' || ctx.pisos > 1 ? lajeArea : 0);
  const pontosHidraulicos = ctx.input.banhos * p.hidraulica.pontosPorBanho + 1;
  const pontosEletricos =
    input.quartos * p.eletrica.pontosPorQuarto +
    input.sala * p.eletrica.pontosSala +
    input.cozinha * p.eletrica.pontosCozinha +
    input.banhos * p.eletrica.pontosPorBanho +
    p.eletrica.pontosExtra;
  const areaCobertura = ctx.area * p.cobertura.fatorArea;

  const itens: Record<StageId, MaterialItem[]> = {
    preparacao: [
      makeItem(p, 'Limpeza do terreno', ctx.area, 'm²', 'Desmatação e nivelamento da área'),
      makeItem(p, 'Mão de obra especializada (dia)', Math.ceil(ctx.area / 30), 'dia', 'Equipa de limpeza e preparação'),
    ],
    escavacao: [
      makeItem(p, 'Escavação de valas', ctx.volEscavacao, 'm³', `${p.escavacao.larguraVala} m de largura x ${p.escavacao.profundidade} m de profundidade, no perímetro`),
      makeItem(p, 'Mão de obra especializada (dia)', Math.ceil(ctx.volEscavacao / 4), 'dia', 'Escavação manual ou mecanizada'),
    ],
    fundacao: itensBetao(ctx, ctx.volEscavacao, p.betao.ferroKgPorM3Fundacao, 'betão da fundação'),
    'vigas-fundacao': (() => {
      const vol = ctx.perimetro * p.vigaFundacao.largura * p.vigaFundacao.altura;
      return [
        ...itensBetao(ctx, vol, p.betao.ferroKgPorM3Estructura, 'betão das vigas de fundação (baldrame)'),
        makeItem(p, 'Cofragem', vol * p.cofragemM2PorM3, 'm²', 'Tábuas para cofragem das vigas'),
      ];
    })(),
    'pilares-vigas': (() => {
      const volPilares = ctx.nPilares * p.pilar.lado * p.pilar.lado * ctx.altura;
      const volVigas = ctx.perimetro * ctx.pisos * p.vigaCinta.largura * p.vigaCinta.altura;
      const vol = volPilares + volVigas;
      return [
        ...itensBetao(ctx, vol, p.betao.ferroKgPorM3Estructura, 'betão de pilares e vigas de cinta'),
        makeItem(p, 'Cofragem', vol * p.cofragemM2PorM3, 'm²', `Inclui ${ctx.nPilares} pilares de ${p.pilar.lado} m x ${p.pilar.lado} m`),
      ];
    })(),
    alvenaria: (() => {
      const blocos = ctx.areaParedes * p.alvenaria.blocosPorM2[input.alvenaria];
      const argamassa = ctx.areaParedes * p.alvenaria.argamassaM3PorM2[input.alvenaria];
      const nomeBloco = input.alvenaria === 'bloco10' ? 'Bloco de 10' : input.alvenaria === 'bloco15' ? 'Bloco de 15' : 'Tijolo';
      return [
        makeItem(p, nomeBloco, blocos, 'un', `Área de paredes: ${ctx.areaParedes.toFixed(1)} m² (descontadas ${ctx.areaAberturas.toFixed(1)} m² de portas e janelas)`),
        makeItem(p, 'Cimento (saco 50 kg)', argamassa * p.betao.sacosCimentoPorM3, 'saco', 'Argamassa de assentamento'),
        makeItem(p, 'Areia', argamassa * 1.0, 'm³', 'Areia fina para argamassa'),
      ];
    })(),
    vergas: (() => {
      const comp = input.portas * (p.alvenaria.porta.largura + p.verga.acrescimoPorta) + input.janelas * (p.alvenaria.janela.largura + p.verga.acrescimoJanela);
      const vol = comp * p.verga.largura * p.verga.altura;
      return [
        ...itensBetao(ctx, vol, 0, 'betão das vergas'),
        makeItem(p, 'Ferro (kg)', comp * p.verga.ferroKgPorM, 'kg', 'Ferro adicional das vergas, para além do incluído no betão'),
      ].filter((it) => it.quantidade > 0);
    })(),
    lajes: (() => {
      if (lajeArea <= 0) return [];
      const volBetão = lajeArea * p.laje.espessura;
      const span = Math.min(input.comprimento, input.largura);
      const nVigotas = Math.ceil(span / p.laje.espacamentoVigotas) + 1;
      const abobadilhas = lajeArea * p.laje.abobadilhasPorM2;
      return [
        makeItem(p, 'Vigota', nVigotas * ctx.pisos, 'un', `Vigotas pré-fabricadas ao longo do vão de ${span.toFixed(1)} m`),
        makeItem(p, 'Abobadilha', abobadilhas, 'un', 'Abobadilhas entre vigotas'),
        makeItem(p, 'Cimento (saco 50 kg)', volBetão * p.betao.sacosCimentoPorM3, 'saco', 'Betão da laje'),
        makeItem(p, 'Areia', volBetão * p.betao.areiaM3PorM3, 'm³', ''),
        makeItem(p, 'Pedra britada', volBetão * p.betao.pedraM3PorM3, 'm³', ''),
        makeItem(p, 'Ferro (kg)', volBetão * p.laje.ferroKgPorM3, 'kg', 'Armadura negativa e positiva da laje'),
        makeItem(p, 'Cofragem', lajeArea, 'm²', 'Chapa/escoramento da laje'),
      ];
    })(),
    cobertura: (() => {
      if (input.cobertura === 'chapas') {
        return [
          makeItem(p, 'Chapa de zinco (3 m)', Math.ceil(areaCobertura / p.cobertura.areaUtilChapa), 'un', `Área de cobertura considerada: ${areaCobertura.toFixed(1)} m²`),
          makeItem(p, 'Ripa de madeira', areaCobertura * p.cobertura.ripasMPorM2, 'm', 'Estrutura de apoio das chapas'),
          makeItem(p, 'Calha', ctx.perimetro * p.cobertura.calhaMPorM * 0.25, 'm', 'Calhas e rufos'),
        ];
      }
      if (input.cobertura === 'telhas') {
        return [
          makeItem(p, 'Telha', areaCobertura * p.cobertura.telhasPorM2, 'un', `Área de cobertura considerada: ${areaCobertura.toFixed(1)} m²`),
          makeItem(p, 'Ripa de madeira', areaCobertura * p.cobertura.ripasMPorM2, 'm', 'Estrutura de apoio das telhas'),
          makeItem(p, 'Calha', ctx.perimetro * p.cobertura.calhaMPorM * 0.25, 'm', 'Calhas e rufos'),
        ];
      }
      return [
        makeItem(p, 'Impermeabilizante', ctx.area, 'm²', 'Impermeabilização da laje de cobertura'),
        makeItem(p, 'Calha', ctx.perimetro * p.cobertura.calhaMPorM * 0.25, 'm', 'Calhas e rufos'),
      ];
    })(),
    reboco: (() => {
      const argamassa = areaReboco * p.reboco.argamassaM3PorM2;
      return [
        makeItem(p, 'Cimento (saco 50 kg)', argamassa * p.betao.sacosCimentoPorM3, 'saco', `Área rebocada: ${areaReboco.toFixed(1)} m² (interior e exterior)`),
        makeItem(p, 'Areia', argamassa * 1.0, 'm³', 'Areia fina para reboco'),
      ];
    })(),
    pavimento: (() => {
      if (input.pavimento === 'ceramica') {
        return [
          makeItem(p, 'Cerâmica', ctx.area * ctx.pisos * p.pavimento.fatorCeramica, 'm²', 'Cerâmica para piso, incluindo cortes'),
          makeItem(p, 'Cimento cola (kg)', ctx.area * ctx.pisos * p.pavimento.colaKgPorM2, 'kg', 'Cola para assentamento da cerâmica'),
          makeItem(p, 'Cimento (saco 50 kg)', ctx.area * ctx.pisos * p.pavimento.betonilhaM3PorM2 * 0.5 * p.betao.sacosCimentoPorM3, 'saco', 'Betonilha de base'),
          makeItem(p, 'Areia', ctx.area * ctx.pisos * p.pavimento.betonilhaM3PorM2 * 0.5, 'm³', 'Areia da betonilha'),
        ];
      }
      const vol = ctx.area * ctx.pisos * p.pavimento.betonilhaM3PorM2;
      return [
        makeItem(p, 'Cimento (saco 50 kg)', vol * p.betao.sacosCimentoPorM3, 'saco', 'Betonilha de regularização'),
        makeItem(p, 'Areia', vol * 1.0, 'm³', 'Areia para betonilha'),
      ];
    })(),
    hidraulica: [
      makeItem(p, 'Tubo PVC 25 mm', pontosHidraulicos * p.hidraulica.tubo25MPorPonto, 'm', 'Água fria'),
      makeItem(p, 'Tubo PVC 50 mm', input.banhos * p.hidraulica.tubo50MPorBanho, 'm', 'Esgoto e descargas'),
      makeItem(p, 'Tubo PVC 110 mm', input.banhos * p.hidraulica.tubo110MPorBanho, 'm', 'Ramal de esgoto principal'),
      makeItem(p, 'Joelho PVC', pontosHidraulicos * p.hidraulica.joelhosPorPonto, 'un', 'Conexões e curvas'),
      makeItem(p, 'Torneira', input.banhos + 1, 'un', 'Casas de banho e cozinha'),
    ],
    eletrica: [
      makeItem(p, 'Fio 2,5 mm²', pontosEletricos * p.eletrica.fio25MPorPonto, 'm', 'Tomadas e pontos de força'),
      makeItem(p, 'Fio 1,5 mm²', pontosEletricos * p.eletrica.fio15MPorPonto, 'm', 'Iluminação e interruptores'),
      makeItem(p, 'Eletroduto', ctx.area * ctx.pisos * p.eletrica.eletrodutoMPorM2, 'm', 'Tubagem de proteção dos fios'),
      makeItem(p, 'Tomada', pontosEletricos, 'un', ''),
      makeItem(p, 'Interruptor', input.quartos + input.sala + input.cozinha + input.banhos, 'un', ''),
      makeItem(p, 'Disjuntor', Math.ceil(pontosEletricos / p.eletrica.disjuntoresPorPontos) + 1, 'un', 'Quadro de disjuntores'),
      makeItem(p, 'Quadro elétrico', 1, 'un', 'Caixa de disjuntores'),
    ],
    esquadrias: [
      makeItem(p, 'Porta de madeira', input.portas, 'un', 'Portas internas e externa'),
      makeItem(p, 'Janela de alumínio', input.janelas, 'un', 'Janelas de correr ou batente'),
      makeItem(p, 'Vidro', input.janelas * p.alvenaria.janela.largura * p.alvenaria.janela.altura, 'm²', 'Vidro das janelas'),
    ],
    pintura: (() => {
      const areaPintura = ctx.areaParedes * 1.1 + (input.cobertura === 'laje' || ctx.pisos > 1 ? lajeArea : 0);
      const litros = (areaPintura * p.pintura.demaos) / p.pintura.rendementM2PorL;
      return [
        makeItem(p, 'Tinta acrílica (L)', litros, 'L', `${p.pintura.demaos} demãos, rendimento ${p.pintura.rendementM2PorL} m²/L`),
        makeItem(p, 'Fundo selador (L)', areaPintura / p.pintura.seladorM2PorL, 'L', 'Uma demão de selador'),
        makeItem(p, 'Lixa', Math.ceil(areaPintura / 20), 'un', 'Lixamento antes da pintura'),
      ];
    })(),
    acabamentos: (() => {
      const areaAzulejo = input.banhos * p.azulejo.m2PorBanho + input.cozinha * p.azulejo.m2Cozinha;
      return [
        makeItem(p, 'Azulejo', areaAzulejo, 'm²', 'Cozinhas e casas de banho'),
        makeItem(p, 'Cimento cola (kg)', areaAzulejo * p.azulejo.colaKgPorM2, 'kg', 'Cola para azulejos'),
        makeItem(p, 'Sanita (louça)', input.banhos, 'un', 'Sanitas completos'),
        makeItem(p, 'Lavatório', input.banhos, 'un', ''),
        makeItem(p, 'Lava-loiça inox', input.cozinha, 'un', 'Cozinha'),
      ];
    })(),
  };
  return itens;
}

export function stageAplicavel(id: StageId, input: CalcInput): boolean {
  if (id === 'lajes') return input.cobertura === 'laje' || input.pisos > 1;
  return true;
}

export function computeStage(
  input: CalcInput,
  stageId: StageId,
  params: CalcParameters = DEFAULT_PARAMETERS,
): StageResult | null {
  if (!stageAplicavel(stageId, input)) return null;
  if (!input.etapas.includes(stageId)) return null;
  const ctx = buildCtx(input, params);
  const def = STAGES.find((s) => s.id === stageId)!;
  const itens = stageItens(ctx)[stageId].filter((it) => it.quantidade > 0);
  return { id: stageId, titulo: def.titulo, descricao: def.descricao, itens };
}

export function computeAll(
  input: CalcInput,
  params: CalcParameters = DEFAULT_PARAMETERS,
): CalcResult {
  const ctx = buildCtx(input, params);
  const etapas: StageResult[] = [];
  for (const def of STAGES) {
    if (!input.etapas.includes(def.id)) continue;
    if (!stageAplicavel(def.id, input)) continue;
    const itens = stageItens(ctx)[def.id].filter((it) => it.quantidade > 0);
    if (itens.length === 0) continue;
    etapas.push({ id: def.id, titulo: def.titulo, descricao: def.descricao, itens });
  }
  const mapa = new Map<string, MaterialItem>();
  for (const etapa of etapas) {
    for (const item of etapa.itens) {
      const key = item.material + '|' + item.unidade;
      const atual = mapa.get(key);
      if (atual) {
        atual.quantidade = roundForUnit(atual.quantidade + item.quantidade, item.unidade);
      } else {
        mapa.set(key, { ...item });
      }
    }
  }
  return {
    area: ctx.area,
    perimetro: ctx.perimetro,
    areaParedes: ctx.areaParedes,
    etapas,
    resumo: [...mapa.values()],
  };
}
