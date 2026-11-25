import type { DB } from "./db.ts";
import { nowStr, round2, todayStr } from "./format.ts";
import { calcTotals, invoiceStatus, saleStatus, aggregateReport, type SaleRow, type ReportAggregate } from "./money.ts";

export interface Product {
  id: number; code: string | null; name: string; category: string; subcategory: string | null;
  unit: string; price: number; cost: number; stock: number; min_stock: number;
}
export interface Client { id: number; name: string; phone: string | null; debt: number; }
export interface Account { id: number; name: string; detail: string | null; kind: string; balance?: number; }
export interface SaleItemIn { product_id: number; qty: number; }
export interface PaymentIn { account_id: number; amount: number; }
export interface SaleResult { sale_id: number; number: number; total: number; pago: number; fiado: number; invoice: { id: number; number: number; saldo: number } | null; }
export interface InvoiceRow { id: number; number: number; sale_id: number | null; client_name: string; created_at: string; original: number; paid: number; saldo: number; status: string; n_items: number; }
export interface InvoiceDetail extends InvoiceRow { client_phone: string | null; items: { name: string; qty: number; price: number }[]; payments: { amount: number; account_name: string | null; created_at: string }[]; }
export interface CashSummary {
  date: string;
  resumo: Record<"ENTRADA" | "SAIDA" | "REEMBOLSO", { total: number; n: number }>;
  accounts: Account[];
  total_geral: number;
  historico: (CashMovement & { account_name: string })[];
}
export interface CashMovement { id: number; type: string; account_id: number; amount: number; description: string | null; sale_id: number | null; created_at: string; cancelled: number; }
export interface SaleRowOut { id: number; number: number; created_at: string; client_id: number | null; client_name: string | null; subtotal: number; discount: number; iva: number; total: number; cost: number; status: string; lucro: number; synced: number; }
export interface StockRow extends Product { abertura: number; entradas: number; saidas: number; fecho: number; }

async function nextNumber(db: DB, table: "sales" | "invoices"): Promise<number> {
  const r = await db.getFirstAsync<{ n: number }>(`SELECT COALESCE(MAX(number),0)+1 AS n FROM ${table}`);
  return (r?.n ?? 1);
}

export async function listCategories(db: DB): Promise<string[]> {
  const rows = await db.getAllAsync<{ category: string }>("SELECT DISTINCT category FROM products ORDER BY category");
  return rows.map((r) => r.category);
}

export async function listProducts(db: DB, opts: { q?: string; category?: string; sub?: string }): Promise<Product[]> {
  let sql = "SELECT * FROM products WHERE 1=1";
  const args: (string | number)[] = [];
  if (opts.q) { sql += " AND (lower(name) LIKE ? OR lower(code) LIKE ?)"; const q = `%${opts.q.toLowerCase()}%`; args.push(q, q); }
  if (opts.category) { sql += " AND category=?"; args.push(opts.category); }
  if (opts.sub) { sql += " AND subcategory=?"; args.push(opts.sub); }
  sql += " ORDER BY category, name";
  return db.getAllAsync<Product>(sql, args);
}

export async function listSubcategories(db: DB, category: string): Promise<string[]> {
  const rows = await db.getAllAsync<{ subcategory: string }>(
    "SELECT DISTINCT subcategory FROM products WHERE category=? AND subcategory IS NOT NULL ORDER BY subcategory", [category]);
  return rows.map((r) => r.subcategory);
}

export async function listAccounts(db: DB): Promise<Account[]> {
  return db.getAllAsync<Account>("SELECT * FROM accounts ORDER BY id");
}

export async function listClients(db: DB, q = ""): Promise<Client[]> {
  let sql = `SELECT c.*, COALESCE((SELECT SUM(original-paid) FROM invoices i WHERE i.client_id=c.id AND i.status IN ('ABERTA','PARCIAL')),0) AS debt
             FROM clients c WHERE 1=1`;
  const args: string[] = [];
  if (q) { sql += " AND lower(c.name) LIKE ?"; args.push(`%${q.toLowerCase()}%`); }
  sql += " ORDER BY c.name";
  return db.getAllAsync<Client>(sql, args);
}

export async function createSale(db: DB, input: { items: SaleItemIn[]; discount?: number; client_id?: number | null; payments: PaymentIn[]; }): Promise<SaleResult> {
  const discount = input.discount ?? 0;
  if (!input.items.length) throw new Error("Carrinho vazio");
  let subtotal = 0, cost = 0;
  const lines: { p: Product; qty: number }[] = [];
  for (const it of input.items) {
    const p = await db.getFirstAsync<Product>("SELECT * FROM products WHERE id=?", [it.product_id]);
    if (!p) throw new Error(`Produto ${it.product_id} não encontrado`);
    if (it.qty <= 0) throw new Error("Quantidade inválida");
    if (p.stock < it.qty) throw new Error(`Stock insuficiente: ${p.name} (disponível ${p.stock} ${p.unit})`);
    subtotal += it.qty * p.price;
    cost += it.qty * p.cost;
    lines.push({ p, qty: it.qty });
  }
  const t = calcTotals(subtotal, discount);
  const paid = round2(input.payments.reduce((s, p) => s + p.amount, 0));
  if (paid > t.total + 0.001) throw new Error("Valor pago superior ao total");
  const fiado = round2(t.total - paid);
  if (fiado > 0.005 && !input.client_id) throw new Error("Pagamento parcial exige cliente (fiado)");

  let result!: SaleResult;
  await db.withTransactionAsync(async () => {
    const num = await nextNumber(db, "sales");
    const now = nowStr();
    const r = await db.runAsync(
      "INSERT INTO sales(number,created_at,client_id,subtotal,discount,iva,total,cost,status,synced) VALUES(?,?,?,?,?,?,?,?,?,0)",
      [num, now, input.client_id ?? null, t.subtotal, t.discount, t.iva, t.total, round2(cost), saleStatus(fiado)]);
    const sid = r.lastInsertRowId;
    for (const { p, qty } of lines) {
      await db.runAsync("INSERT INTO sale_items(sale_id,product_id,name,qty,price,cost) VALUES(?,?,?,?,?,?)",
        [sid, p.id, p.name, qty, p.price, p.cost]);
      await db.runAsync("UPDATE products SET stock=stock-? WHERE id=?", [qty, p.id]);
      await db.runAsync("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?,?,?,?,?)",
        [p.id, "SAIDA", -qty, `Venda #${num}`, now]);
    }
    for (const pay of input.payments) {
      if (pay.amount <= 0) continue;
      await db.runAsync("INSERT INTO cash_movements(type,account_id,amount,description,sale_id,created_at) VALUES('ENTRADA',?,?,?,?)",
        [pay.account_id, pay.amount, `Venda #${num}`, sid, now]);
    }
    let invoice: SaleResult["invoice"] = null;
    if (fiado > 0.005) {
      const inum = await nextNumber(db, "invoices");
      const ri = await db.runAsync(
        "INSERT INTO invoices(number,sale_id,client_id,created_at,original,paid,status) VALUES(?,?,?,?,?,?,?)",
        [inum, sid, input.client_id ?? null, now, t.total, paid, invoiceStatus(t.total, paid)]);
      invoice = { id: ri.lastInsertRowId, number: inum, saldo: fiado };
    }
    result = { sale_id: sid, number: num, total: t.total, pago: paid, fiado, invoice };
  });
  return result;
}

export async function listInvoices(db: DB, clientId?: number): Promise<InvoiceRow[]> {
  let sql = `SELECT i.*, c.name AS client_name,
             (SELECT COUNT(*) FROM sale_items si WHERE si.sale_id=i.sale_id) AS n_items,
             i.original - i.paid AS saldo
             FROM invoices i JOIN clients c ON c.id=i.client_id
             WHERE i.status IN ('ABERTA','PARCIAL')`;
  const args: number[] = [];
  if (clientId) { sql += " AND i.client_id=?"; args.push(clientId); }
  sql += " ORDER BY i.created_at DESC";
  return db.getAllAsync<InvoiceRow>(sql, args);
}

export async function getInvoice(db: DB, id: number): Promise<InvoiceDetail | null> {
  const i = await db.getFirstAsync<InvoiceRow & { client_phone: string | null }>(
    `SELECT i.*, c.name AS client_name, c.phone AS client_phone,
            (SELECT COUNT(*) FROM sale_items si WHERE si.sale_id=i.sale_id) AS n_items,
            i.original - i.paid AS saldo
     FROM invoices i JOIN clients c ON c.id=i.client_id WHERE i.id=?`, [id]);
  if (!i) return null;
  const items = await db.getAllAsync<{ name: string; qty: number; price: number }>(
    "SELECT name, qty, price FROM sale_items WHERE sale_id=?", [i.sale_id ?? 0]);
  const payments = await db.getAllAsync<{ amount: number; account_name: string | null; created_at: string }>(
    `SELECT p.amount, a.name AS account_name, p.created_at FROM invoice_payments p
     LEFT JOIN accounts a ON a.id=p.account_id WHERE p.invoice_id=? ORDER BY p.created_at`, [id]);
  return { ...i, items, payments };
}

export async function payInvoice(db: DB, id: number, amount: number, accountId: number): Promise<{ number: number; pago: number; saldo: number; status: string }> {
  const inv = await db.getFirstAsync<{ id: number; number: number; original: number; paid: number; status: string }>(
    "SELECT * FROM invoices WHERE id=?", [id]);
  if (!inv) throw new Error("Fatura não encontrada");
  if (inv.status === "LIQUIDADA") throw new Error("Fatura já liquidada");
  const saldo = round2(inv.original - inv.paid);
  const amt = round2(amount);
  if (amt <= 0) throw new Error("Valor inválido");
  if (amt > saldo + 0.005) throw new Error(`Valor superior ao saldo devedor (${saldo.toFixed(2)} MT)`);
  const newPaid = round2(inv.paid + amt);
  const status = invoiceStatus(inv.original, newPaid);
  await db.withTransactionAsync(async () => {
    await db.runAsync("INSERT INTO invoice_payments(invoice_id,account_id,amount,created_at) VALUES(?,?,?,?)",
      [id, accountId, amt, nowStr()]);
    await db.runAsync("UPDATE invoices SET paid=?, status=? WHERE id=?", [newPaid, status, id]);
    await db.runAsync("INSERT INTO cash_movements(type,account_id,amount,description,created_at) VALUES('PAGAMENTO_DIVIDA',?,?,?,?)",
      [accountId, amt, `Pagamento fatura #${inv.number}`, nowStr()]);
  });
  return { number: inv.number, pago: newPaid, saldo: round2(inv.original - newPaid), status };
}

export async function payAllClient(db: DB, clientId: number, accountId: number): Promise<{ pago: number; faturas: number }> {
  const invs = await db.getAllAsync<{ id: number; number: number; original: number; paid: number }>(
    "SELECT * FROM invoices WHERE client_id=? AND status IN ('ABERTA','PARCIAL') ORDER BY created_at", [clientId]);
  if (!invs.length) throw new Error("Cliente sem dívidas");
  let total = 0;
  await db.withTransactionAsync(async () => {
    const now = nowStr();
    for (const i of invs) {
      const amt = round2(i.original - i.paid);
      total = round2(total + amt);
      await db.runAsync("INSERT INTO invoice_payments(invoice_id,account_id,amount,created_at) VALUES(?,?,?,?)", [i.id, accountId, amt, now]);
      await db.runAsync("UPDATE invoices SET paid=original, status='LIQUIDADA' WHERE id=?", [i.id]);
      await db.runAsync("INSERT INTO cash_movements(type,account_id,amount,description,created_at) VALUES('PAGAMENTO_DIVIDA',?,?,?,?)",
        [accountId, amt, `Liquidação total fatura #${i.number}`, now]);
    }
  });
  return { pago: total, faturas: invs.length };
}

export async function creditSummary(db: DB): Promise<{ total_debt: number; clients: Client[] }> {
  const clients = (await listClients(db)).filter((c) => c.debt > 0).sort((a, b) => b.debt - a.debt);
  return { total_debt: round2(clients.reduce((s, c) => s + c.debt, 0)), clients };
}

export async function cashSummary(db: DB, date = todayStr()): Promise<CashSummary> {
  const resumoRows = await db.getAllAsync<{ type: string; n: number; total: number }>(
    `SELECT type, COUNT(*) n, COALESCE(SUM(amount),0) total FROM cash_movements
     WHERE cancelled=0 AND substr(created_at,1,10)=? AND type IN ('ENTRADA','SAIDA','REEMBOLSO') GROUP BY type`, [date]);
  const resumo = { ENTRADA: { total: 0, n: 0 }, SAIDA: { total: 0, n: 0 }, REEMBOLSO: { total: 0, n: 0 } };
  for (const r of resumoRows) resumo[r.type as keyof typeof resumo] = { total: round2(r.total), n: r.n };
  const accounts = await db.getAllAsync<Account>("SELECT * FROM accounts ORDER BY id");
  let totalGeral = 0;
  for (const a of accounts) {
    const r = await db.getFirstAsync<{ s: number }>(
      `SELECT COALESCE(SUM(CASE WHEN type IN ('ENTRADA','PAGAMENTO_DIVIDA','ABERTURA') THEN amount ELSE -amount END),0) AS s
       FROM cash_movements WHERE account_id=? AND cancelled=0`, [a.id]);
    a.balance = round2(r?.s ?? 0);
    totalGeral += a.balance;
  }
  const historico = await db.getAllAsync<CashMovement & { account_name: string }>(
    `SELECT cm.*, a.name AS account_name FROM cash_movements cm JOIN accounts a ON a.id=cm.account_id
     WHERE substr(cm.created_at,1,10)=? ORDER BY cm.created_at DESC, cm.id DESC LIMIT 200`, [date]);
  return { date, resumo, accounts, total_geral: round2(totalGeral), historico };
}

export async function addCashMovement(db: DB, type: "ENTRADA" | "SAIDA" | "REEMBOLSO", accountId: number, amount: number, description: string): Promise<number> {
  const amt = round2(amount);
  if (!(amt > 0)) throw new Error("Valor inválido");
  const r = await db.runAsync("INSERT INTO cash_movements(type,account_id,amount,description,created_at) VALUES(?,?,?,?,?)",
    [type, accountId, amt, description, nowStr()]);
  return r.lastInsertRowId;
}

export async function cancelMovement(db: DB, id: number): Promise<void> {
  await db.runAsync("UPDATE cash_movements SET cancelled=1 WHERE id=?", [id]);
}

export async function listSales(db: DB, from?: string, to?: string): Promise<SaleRowOut[]> {
  let sql = `SELECT s.*, c.name AS client_name FROM sales s LEFT JOIN clients c ON c.id=s.client_id WHERE 1=1`;
  const args: string[] = [];
  if (from) { sql += " AND s.created_at >= ?"; args.push(`${from} 00:00:00`); }
  if (to) { sql += " AND s.created_at <= ?"; args.push(`${to} 23:59:59`); }
  sql += " ORDER BY s.created_at DESC, s.id DESC";
  const rows = await db.getAllAsync<SaleRowOut>(sql, args);
  return rows.map((r) => ({ ...r, lucro: round2(r.total - r.iva - r.cost) }));
}

export async function salesReport(db: DB, from: string, to: string): Promise<{ agg: ReportAggregate; vendas: SaleRowOut[] }> {
  const rows = await db.getAllAsync<SaleRow>(
    "SELECT subtotal, discount, iva, total, cost FROM sales WHERE created_at >= ? AND created_at <= ?",
    [`${from} 00:00:00`, `${to} 23:59:59`]);
  const vendas = await listSales(db, from, to);
  return { agg: aggregateReport(rows), vendas };
}

export async function itemsReport(db: DB, from: string, to: string): Promise<{ name: string; category: string | null; qty: number; total: number; lucro: number }[]> {
  const rows = await db.getAllAsync<{ name: string; product_id: number; qty: number; total: number; cost: number; category: string | null }>(
    `SELECT si.name, si.product_id, SUM(si.qty) qty, SUM(si.qty*si.price) total, SUM(si.qty*si.cost) cost, p.category
     FROM sale_items si JOIN sales s ON s.id=si.sale_id LEFT JOIN products p ON p.id=si.product_id
     WHERE s.created_at >= ? AND s.created_at <= ? GROUP BY si.product_id ORDER BY total DESC`,
    [`${from} 00:00:00`, `${to} 23:59:59`]);
  return rows.map((r) => ({ name: r.name, category: r.category, qty: r.qty, total: round2(r.total), lucro: round2(r.total - r.cost) }));
}

export function salesToCsv(vendas: SaleRowOut[], from: string, to: string): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const f = (v: number) => v.toFixed(2).replace(".", ",");
  const lines = ["ID;DATA;CLIENTE;SUBTOTAL;DESCONTO;IVA;TOTAL;CUSTO;LUCRO;STATUS"];
  for (const v of vendas) {
    lines.push([`#${v.number}`, v.created_at, esc(v.client_name || "Consumidor Final"), f(v.subtotal), f(v.discount), f(v.iva), f(v.total), f(v.cost), f(v.lucro), v.status].join(";"));
  }
  return `Período: ${from} a ${to}\n` + lines.join("\n");
}

export async function stockPosition(db: DB, date = todayStr()): Promise<StockRow[]> {
  const prods = await db.getAllAsync<Product>("SELECT * FROM products ORDER BY category, name");
  const out: StockRow[] = [];
  for (const p of prods) {
    const ab = await db.getFirstAsync<{ s: number }>("SELECT COALESCE(SUM(qty),0) s FROM stock_movements WHERE product_id=? AND created_at < ?", [p.id, `${date} 00:00:00`]);
    const en = await db.getFirstAsync<{ s: number }>("SELECT COALESCE(SUM(qty),0) s FROM stock_movements WHERE product_id=? AND type='ENTRADA' AND substr(created_at,1,10)=?", [p.id, date]);
    const sa = await db.getFirstAsync<{ s: number }>("SELECT COALESCE(SUM(qty),0) s FROM stock_movements WHERE product_id=? AND type='SAIDA' AND substr(created_at,1,10)=?", [p.id, date]);
    const fe = await db.getFirstAsync<{ s: number }>("SELECT COALESCE(SUM(qty),0) s FROM stock_movements WHERE product_id=? AND created_at <= ?", [p.id, `${date} 23:59:59`]);
    out.push({ ...p, abertura: ab?.s ?? 0, entradas: en?.s ?? 0, saidas: sa?.s ?? 0, fecho: fe?.s ?? 0 });
  }
  return out;
}

export async function addStockEntry(db: DB, productId: number, qty: number, note: string): Promise<void> {
  if (!(qty > 0)) throw new Error("Quantidade inválida");
  await db.withTransactionAsync(async () => {
    await db.runAsync("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?,'ENTRADA',?,?,?)",
      [productId, qty, note || "Entrada de mercadoria", nowStr()]);
    await db.runAsync("UPDATE products SET stock=stock+? WHERE id=?", [qty, productId]);
  });
}

export async function addProduct(db: DB, p: Omit<Product, "id" | "stock"> & { stock?: number }): Promise<number> {
  const r = await db.runAsync(
    "INSERT INTO products(code,name,category,subcategory,unit,price,cost,stock,min_stock) VALUES(?,?,?,?,?,?,?,?,?)",
    [p.code, p.name, p.category, p.subcategory, p.unit, p.price, p.cost, p.stock ?? 0, p.min_stock]);
  return r.lastInsertRowId;
}

export async function addClient(db: DB, name: string, phone: string): Promise<number> {
  if (!name.trim()) throw new Error("Nome obrigatório");
  const r = await db.runAsync("INSERT INTO clients(name,phone) VALUES(?,?)", [name.trim(), phone]);
  return r.lastInsertRowId;
}

export async function unsyncedSales(db: DB): Promise<SaleRowOut[]> {
  return db.getAllAsync<SaleRowOut>("SELECT * FROM sales WHERE synced=0 ORDER BY id");
}

export async function markSaleSynced(db: DB, id: number): Promise<void> {
  await db.runAsync("UPDATE sales SET synced=1 WHERE id=?", [id]);
}
