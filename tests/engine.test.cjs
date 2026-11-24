const assert = require('node:assert');
const OUT = process.env.CF_TEST_OUT || '/tmp/cf-test-build';

const { computeAll, STAGES, stageAplicavel } = require(`${OUT}/calculator.js`);
const { QUICK_CALCS, getQuickCalc } = require(`${OUT}/quickcalc.js`);
const { responder, analisarFaltas } = require(`${OUT}/assistant.js`);
const { formatMT, parseNumber, roundForUnit } = require(`${OUT}/format.js`);

const base = {
  tipo: 'T2', comprimento: 9, largura: 6, quartos: 2, banhos: 1, sala: 1, cozinha: 1,
  alturaParedes: 2.8, espessuraParedes: 0.15, portas: 4, janelas: 4, pisos: 1,
  alvenaria: 'bloco15', estrutura: 'betaoArmado', cobertura: 'chapas', pavimento: 'cimento',
  etapas: STAGES.map((s) => s.id),
};

let testes = 0;
function ok(cond, nome) {
  assert(cond, nome);
  testes++;
  console.log('  ✓', nome);
}

console.log('format:');
ok(formatMT(1234567.5) === 'MT 1.234.567,50', 'formatMT agrupa milhares e usa vírgula');
ok(parseNumber('1.234,5') === 1234.5, 'parseNumber aceita formato pt');
ok(roundForUnit(9.18, 'un') === 10 && roundForUnit(9.18, 'm') === 9.18, 'roundForUnit');

console.log('calculadora principal:');
const r = computeAll(base);
ok(r.area === 54 && r.perimetro === 30, 'área e perímetro T2 9x6');
ok(Math.abs(r.areaParedes - 70.68) < 0.01, 'área de paredes desconta vãos');
ok(r.etapas.length === 15 && !r.etapas.find((e) => e.id === 'lajes'), 'lajes excluída com chapas + 1 piso');
ok(stageAplicavel('lajes', { ...base, cobertura: 'laje' }), 'lajes aplicável com cobertura laje');
ok(computeAll({ ...base, cobertura: 'laje' }).etapas.find((e) => e.id === 'lajes'), 'lajes incluída com laje');
ok(computeAll({ ...base, pisos: 2 }).etapas.find((e) => e.id === 'lajes'), 'lajes incluída com 2 pisos');
const fund = r.etapas.find((e) => e.id === 'fundacao');
ok(fund.itens.find((i) => i.material.startsWith('Cimento')).quantidade === Math.ceil(9 * 7 * 1.05), 'fundação: 9 m³ → 67 sacos');
const alv = r.etapas.find((e) => e.id === 'alvenaria');
ok(alv.itens.find((i) => i.material === 'Bloco de 15').quantidade === Math.ceil(70.68 * 12.5 * 1.05), 'alvenaria: 928 blocos');
const resumoCim = r.resumo.find((i) => i.material.startsWith('Cimento'));
ok(resumoCim.quantidade > fund.itens.find((i) => i.material.startsWith('Cimento')).quantidade, 'resumo agrega todas as etapas');
ok(computeAll({ ...base, etapas: ['fundacao'] }).etapas.length === 1, 'cálculo de etapa individual');
for (const s of STAGES) {
  const so = computeAll({ ...base, etapas: [s.id] });
  ok(so.etapas.length <= 1, `etapa ${s.id} isolada`);
}

console.log('calculadoras dedicadas:');
ok(QUICK_CALCS.length === 9, '9 calculadoras dedicadas disponíveis');
const muros = getQuickCalc('muros').calcular({ comp: '10', alt: '2', alvenaria: 'bloco15' });
ok(muros.linhas.find((l) => l.material === 'Bloco de 15').quantidade === 263, 'muros 10x2 → 263 blocos');
const laje = getQuickCalc('lajes').calcular({ area: '40', vao: '4', esp: '0.12', tipo: 'vigotas' });
ok(laje.linhas.find((l) => l.material === 'Vigota').quantidade === 10, 'laje 40 m² vão 4 → 10 vigotas');
ok(laje.linhas.find((l) => l.material === 'Abobadilha').quantidade === 336, 'laje → 336 abobadilhas');
const esc = getQuickCalc('escadas').calcular({ alt: '2.8', largDeg: '0.28', largEsc: '1' });
ok(esc.destaques[0].startsWith('17 degraus'), 'escada 2,8 m → 17 degraus');
const vp = getQuickCalc('vigas-pilares').calcular({ nPilares: '6', lado: '0.2', altP: '2.8', compViga: '12', largV: '0.15', altV: '0.3' });
ok(Math.abs(parseFloat(vp.destaques[2].match(/[\d.]+/)[0]) - 1.21) < 0.01, 'vigas+pilares → 1,21 m³');
const reb = getQuickCalc('reboco').calcular({ area: '80', lados: '2' });
ok(reb.linhas.find((l) => l.material.startsWith('Cimento')).quantidade === Math.ceil(80 * 2 * 0.02 * 7 * 1.05), 'reboco 160 m² → sacos');
const pint = getQuickCalc('pintura').calcular({ area: '80', demaos: '2' });
ok(Math.abs(pint.linhas[0].quantidade - Math.round((80 * 2 / 12) * 1.1 * 100) / 100) < 0.01, 'pintura 2 demãos → litros com desperdício');
const pav = getQuickCalc('pavimentos').calcular({ area: '40', tipo: 'ceramica' });
ok(pav.linhas.find((l) => l.material === 'Cerâmica').quantidade === Math.round(40 * 1.05 * 1.08 * 100) / 100, 'pavimento cerâmica com cortes+desperdício');
const bl = getQuickCalc('blocos').calcular({ area: '30', alvenaria: 'bloco10' });
ok(bl.destaques[1].includes('paletes'), 'blocos → paletes estimadas');
const vig = getQuickCalc('vigotas-abobadilhas').calcular({ vao: '4', comp: '6' });
ok(vig.linhas.find((l) => l.material === 'Abobadilha').quantidade === Math.ceil(24 * 8 * 1.05), 'vigotas/abobadilhas 24 m²');

console.log('assistente:');
const ctx = { draft: base, resultado: r };
ok(responder('olá', ctx).includes('assistente'), 'saudação');
ok(responder('o que falta no meu projeto?', ctx).includes('não tem dados em falta'), 'sem dados em falta');
ok(analisarFaltas({ ...base, portas: 0, janelas: 0 }).length === 2, 'deteta portas/janelas em falta');
ok(responder('explique a fundação', ctx).includes('Cimento'), 'explica etapa com materiais calculados');
ok(responder('quanto cimento preciso?', ctx).includes('160'), 'cita quantidade real do resumo');
ok((responder('quais as etapas?', ctx).match(/\d+\./g) || []).length === 16, 'lista as 16 etapas');
ok(responder('xyz abc', ctx).includes('Posso ajudar'), 'fallback com sugestões');

console.log(`\n${testes} testes passaram.`);
