import { computeAll, STAGES, StageDef } from './calculator';
import { DEFAULT_PARAMETERS } from './parameters';
import { formatNumber } from './format';
import { CalcInput, CalcResult, StageId } from './types';

export interface AssistantContext {
  draft: CalcInput;
  resultado: CalcResult;
}

const NORMALIZAR = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9çãõ ]/g, ' ');

export function analisarFaltas(draft: CalcInput): string[] {
  const faltas: string[] = [];
  if (draft.comprimento <= 0 || draft.largura <= 0) faltas.push('dimensões da casa (comprimento e largura)');
  if (draft.alturaParedes <= 0) faltas.push('altura das paredes');
  if (draft.quartos <= 0) faltas.push('número de quartos');
  if (draft.banhos <= 0) faltas.push('número de casas de banho');
  if (draft.portas <= 0) faltas.push('número de portas');
  if (draft.janelas <= 0) faltas.push('número de janelas');
  if (draft.pisos <= 0) faltas.push('número de pisos');
  if (draft.etapas.length === 0) faltas.push('seleção das etapas da construção');
  return faltas;
}

function findEtapa(texto: string): StageDef | undefined {
  const t = NORMALIZAR(texto);
  const gatilhos: Record<StageId, string[]> = {
    preparacao: ['terreno', 'limpeza', 'preparacao'],
    escavacao: ['escavacao', 'vala', 'escavar'],
    fundacao: ['fundacao', 'fundação', 'sapata', 'base'],
    'vigas-fundacao': ['viga de fundacao', 'baldrame', 'vigas de fundacao'],
    'pilares-vigas': ['pilar', 'pilares', 'viga', 'vigas', 'estrutura', 'cinta'],
    alvenaria: ['alvenaria', 'parede', 'bloco', 'tijolo', 'levantar paredes'],
    vergas: ['verga', 'contraverga'],
    lajes: ['laje', 'vigota', 'abobadilha', 'piso superior'],
    cobertura: ['cobertura', 'telhado', 'chapa', 'telha', 'teto'],
    reboco: ['reboco', 'rebocar', 'emassamento'],
    pavimento: ['pavimento', 'piso', 'ceramica', 'betonilha', 'chão', 'chao'],
    hidraulica: ['hidraulica', 'canalizacao', 'agua', 'esgoto', 'tubo', 'sanitario'],
    eletrica: ['eletrica', 'luz', 'fio', 'tomada', 'disjuntor', 'instalacao eletrica'],
    esquadrias: ['porta', 'janela', 'esquadria', 'vidro'],
    pintura: ['pintura', 'tinta', 'pintar'],
    acabamentos: ['acabamento', 'azulejo', 'louça', 'louca', 'final'],
  };
  for (const def of STAGES) {
    if (gatilhos[def.id].some((g) => t.includes(g))) return def;
  }
  return undefined;
}

function stageResultado(ctx: AssistantContext, id: StageId) {
  return ctx.resultado.etapas.find((e) => e.id === id);
}

export function responder(pergunta: string, ctx: AssistantContext): string {
  const t = NORMALIZAR(pergunta);
  const { draft, resultado } = ctx;

  if (/\b(ola|olá|bom dia|boa tarde|boa noite|oi)\b/.test(t)) {
    return 'Olá! Sou o assistente de obra da NAPAUA BUILD. Posso explicar materiais e etapas, ajudar a preencher a calculadora e indicar dados em falta. Experimente: "O que falta no meu projeto?" ou "Explique a fundação".';
  }

  if (t.includes('falta') || t.includes('em falta') || t.includes('pendente') || t.includes('verificar')) {
    const faltas = analisarFaltas(draft);
    if (faltas.length === 0) {
      return 'O seu projeto não tem dados em falta. Pode calcular os resultados na calculadora — todas as 16 etapas estão contempladas.';
    }
    return `Encontrei dados em falta no projeto atual: ${faltas.join('; ')}. Abra a Calculadora e preencha esses campos na etapa "Características da construção".`;
  }

  if (t.includes('preencher') || t.includes('como usar') || t.includes('ajuda') || t.includes('como funciona')) {
    return 'Como usar: 1) Calculadora → escolha o tipo (T1–T4 ou personalizada); 2) indique dimensões, quartos, casas de banho, portas, janelas e pisos; 3) escolha alvenaria, estrutura, cobertura e pavimento; 4) selecione as etapas; 5) veja os resultados por etapa e o orçamento em MT. Os cálculos usam fórmulas verificáveis — eu não invento quantidades.';
  }

  if (t.includes('desperdicio') || t.includes('perda')) {
    const exemplos = Object.entries(DEFAULT_PARAMETERS.desperdicio)
      .slice(0, 6)
      .map(([m, d]) => `${m}: ${Math.round(d * 100)}%`)
      .join(', ');
    return `O desperdício já está incluído em cada quantidade (ex.: ${exemplos}). O administrador pode ajustar estas percentagens no painel administrativo, em "Parâmetros da calculadora".`;
  }

  if (t.includes('area') || t.includes('tamanho') || t.includes('dimensao')) {
    const area = draft.comprimento * draft.largura;
    return `Área do projeto atual: ${formatNumber(area)} m² (${formatNumber(draft.comprimento)} m x ${formatNumber(draft.largura)} m), perímetro ${formatNumber(resultado.perimetro)} m, área de paredes ${formatNumber(resultado.areaParedes)} m².`;
  }

  const etapa = findEtapa(pergunta);
  if (etapa) {
    let resposta = `${etapa.titulo}: ${etapa.descricao}`;
    const res = stageResultado(ctx, etapa.id);
    if (res && res.itens.length > 0) {
      resposta += '\n\nMateriais calculados nesta etapa:\n' +
        res.itens.map((i) => `• ${i.material}: ${formatNumber(i.quantidade)} ${i.unidade} (+${Math.round(i.desperdicio * 100)}% desperdício)`).join('\n');
    } else if (!draft.etapas.includes(etapa.id)) {
      resposta += '\n\nEsta etapa não está selecionada no projeto atual.';
    } else {
      resposta += '\n\nAinda não calculei esta etapa — selecione-a na tela "Etapas da construção" e prima "Calcular resultados".';
    }
    return resposta;
  }

  const materialMatch = resultado.resumo.find((i) => t.includes(NORMALIZAR(i.material).slice(0, 8)));
  if (t.includes('quanto') || t.includes('quantidade') || t.includes('preciso')) {
    if (materialMatch) {
      return `No resumo geral do projeto atual: ${materialMatch.material} = ${formatNumber(materialMatch.quantidade)} ${materialMatch.unidade} (já com ${Math.round(materialMatch.desperdicio * 100)}% de desperdício). Consulte a etapa correspondente para ver a decomposição.`;
    }
    if (resultado.resumo.length > 0) {
      return 'Resumo geral do projeto atual:\n' +
        resultado.resumo.map((i) => `• ${i.material}: ${formatNumber(i.quantidade)} ${i.unidade}`).join('\n');
    }
    return 'Ainda não há resultados calculados. Termine o fluxo da calculadora (tipo → características → métodos → etapas) para eu apresentar as quantidades.';
  }

  if (t.includes('custo') || t.includes('preco') || t.includes('orcamento') || t.includes('mt') || t.includes('metical')) {
    return 'Os preços em MT aparecem no ecrã "Orçamento" da calculadora: cada material tem preço unitário editável, mais transporte, com total estimado. Os preços de referência são geridos pelo administrador. Estas são estimativas de planeamento, não projetos de execução.';
  }

  if (t.includes('etapa') || t.includes('fase') || t.includes('obra')) {
    return 'A calculadora cobre 16 etapas, do terreno aos acabamentos:\n' +
      STAGES.map((s, i) => `${i + 1}. ${s.titulo}`).join('\n');
  }

  if (t.includes('planta') || t.includes('modelo') || t.includes('t1') || t.includes('t2') || t.includes('t3') || t.includes('t4')) {
    return 'Temos plantas T1 (36 m², 1 quarto), T2 (54 m², 2 quartos), T3 (81 m², 3 quartos), T4 (120 m², 4 quartos), além de modelos modernos, económicos e de dois pisos. Veja a galeria em "Plantas" no Início. As plantas devem ser adaptadas ao terreno e às normas legais.';
  }

  if (t.includes('profissional') || t.includes('contratar') || t.includes('servico')) {
    return 'Em "Serviços" encontra construção de casas, fabrico de vigotas e abobadilhas, blocos, plantas e orçamentos — com botão para solicitar ou contactar pelo WhatsApp.';
  }

  return 'Posso ajudar com: explicar uma etapa da obra (ex.: "Explique a fundação"), materiais e quantidades do seu projeto ("Quanto cimento preciso?"), dados em falta ("O que falta no meu projeto?"), desperdício, área, custos em MT, plantas e serviços. Diga o que precisa.';
}

export function sugestoes(): string[] {
  return [
    'O que falta no meu projeto?',
    'Explique a etapa de fundação',
    'Quanto cimento preciso?',
    'Como funciona o desperdício?',
    'Quanto custa a obra em MT?',
    'Quais as 16 etapas da construção?',
  ];
}

export function computeResultado(draft: CalcInput): CalcResult {
  return computeAll(draft, DEFAULT_PARAMETERS);
}
