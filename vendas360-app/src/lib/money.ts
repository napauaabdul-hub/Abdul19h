import { round2 } from "./format.ts";

export const IVA_RATE = 0.16;
export const CURRENCY = "MT";

export interface SaleTotals {
  subtotal: number;
  discount: number;
  iva: number;
  total: number;
}

export function calcTotals(subtotalRaw: number, discount = 0): SaleTotals {
  const subtotal = round2(subtotalRaw);
  const iva = round2(subtotal * IVA_RATE);
  const total = round2(subtotal - discount + iva);
  return { subtotal, discount: round2(discount), iva, total };
}

export type InvoiceStatus = "ABERTA" | "PARCIAL" | "LIQUIDADA";

export function invoiceStatus(original: number, paid: number): InvoiceStatus {
  if (paid >= original - 0.005) return "LIQUIDADA";
  if (paid > 0.005) return "PARCIAL";
  return "ABERTA";
}

export function lucroReal(total: number, iva: number, cost: number): number {
  return round2(total - iva - cost);
}

export interface SaleRow {
  subtotal: number;
  discount: number;
  iva: number;
  total: number;
  cost: number;
}

export interface ReportAggregate {
  subtotal: number;
  descontos: number;
  iva: number;
  total: number;
  lucro_real: number;
  n_vendas: number;
  ticket_medio: number;
}

export function aggregateReport(rows: SaleRow[]): ReportAggregate {
  const subtotal = round2(rows.reduce((s, r) => s + r.subtotal, 0));
  const descontos = round2(rows.reduce((s, r) => s + r.discount, 0));
  const iva = round2(rows.reduce((s, r) => s + r.iva, 0));
  const total = round2(rows.reduce((s, r) => s + r.total, 0));
  const cost = round2(rows.reduce((s, r) => s + r.cost, 0));
  const n = rows.length;
  return {
    subtotal,
    descontos,
    iva,
    total,
    lucro_real: lucroReal(total, iva, cost),
    n_vendas: n,
    ticket_medio: n ? round2(total / n) : 0,
  };
}

export function saleStatus(fiado: number): "CONCLUIDO" | "PARCIAL" {
  return fiado <= 0.005 ? "CONCLUIDO" : "PARCIAL";
}
