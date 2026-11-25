import { test } from "node:test";
import assert from "node:assert/strict";
import { fmtMT, fmtQ, fmtDT, round2 } from "../src/lib/format.ts";
import { calcTotals, invoiceStatus, lucroReal, aggregateReport, saleStatus, IVA_RATE } from "../src/lib/money.ts";

test("fmtMT formata em pt-MZ (ponto nas milhares, vírgula nos decimais)", () => {
  assert.equal(fmtMT(0), "0,00 MT");
  assert.equal(fmtMT(350), "350,00 MT");
  assert.equal(fmtMT(16798.32), "16.798,32 MT");
  assert.equal(fmtMT(61224), "61.224,00 MT");
  assert.equal(fmtMT(2299), "2.299,00 MT");
  assert.equal(fmtMT(-500.5), "-500,50 MT");
});

test("fmtQ inclui unidade", () => {
  assert.equal(fmtQ(31.5, "kg"), "31,5 kg");
  assert.equal(fmtQ(455), "455 un");
});

test("fmtDT converte almacenamiento para dd/mm/aaaa hh:mm", () => {
  assert.equal(fmtDT("2026-08-04 15:32:00"), "04/08/2026 15:32");
});

test("round2 arredonda meticais", () => {
  assert.equal(round2(10.005), 10.01);
  assert.equal(round2(0.1 + 0.2), 0.3);
});

test("calcTotals aplica IVA 16% como no backend", () => {
  const t = calcTotals(590, 0);
  assert.equal(t.subtotal, 590);
  assert.equal(t.iva, 94.4);
  assert.equal(t.total, 684.4);
  const t2 = calcTotals(1000, 100);
  assert.equal(t2.iva, 160);
  assert.equal(t2.total, 1060);
  assert.equal(IVA_RATE, 0.16);
});

test("invoiceStatus: ABERTA / PARCIAL / LIQUIDADA", () => {
  assert.equal(invoiceStatus(4499, 0), "ABERTA");
  assert.equal(invoiceStatus(4499, 2200), "PARCIAL");
  assert.equal(invoiceStatus(4499, 4499), "LIQUIDADA");
  assert.equal(invoiceStatus(4499, 4498.99), "PARCIAL");
  assert.equal(invoiceStatus(100, 100.01), "LIQUIDADA");
});

test("saleStatus: fiado zero = CONCLUIDO, resto = PARCIAL", () => {
  assert.equal(saleStatus(0), "CONCLUIDO");
  assert.equal(saleStatus(0.004), "CONCLUIDO");
  assert.equal(saleStatus(132), "PARCIAL");
});

test("lucroReal = total - IVA - CMV", () => {
  assert.equal(lucroReal(232, 32, 110), 90);
  assert.equal(lucroReal(17739, 940.68, 6176.97), 10621.35);
});

test("aggregateReport agrega vendas e calcula ticket médio", () => {
  const agg = aggregateReport([
    { subtotal: 905.17, discount: 0, iva: 144.83, total: 1050, cost: 300 },
    { subtotal: 301.72, discount: 0, iva: 48.28, total: 350, cost: 200 },
    { subtotal: 689.66, discount: 0, iva: 110.34, total: 800, cost: 283.33 },
  ]);
  assert.equal(agg.n_vendas, 3);
  assert.equal(agg.total, 2200);
  assert.equal(agg.iva, 303.45);
  assert.equal(agg.ticket_medio, round2(2200 / 3));
  assert.equal(agg.lucro_real, round2(2200 - 303.45 - 783.33));
  const vazio = aggregateReport([]);
  assert.equal(vazio.n_vendas, 0);
  assert.equal(vazio.ticket_medio, 0);
});
