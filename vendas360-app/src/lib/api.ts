import type { DB } from "./db.ts";
import { listProducts, listClients, listAccounts, unsyncedSales, markSaleSynced, type Product, type Client, type Account } from "./store.ts";

// No emulador Android, o host da máquina local é 10.0.2.2.
// Num dispositivo físico, trocar para o IP do computador na mesma rede (ex.: http://192.168.1.10:8080).
export const BASE_URL = "http://10.0.2.2:8080";

async function req(method: string, path: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Erro ${res.status}`);
  return data;
}

export async function isOnline(): Promise<boolean> {
  try {
    await req("GET", "/api/boot");
    return true;
  } catch {
    return false;
  }
}

export interface SyncResult { online: boolean; pulled: number; pushed: number; errors: string[] }

export async function syncNow(db: DB): Promise<SyncResult> {
  const result: SyncResult = { online: false, pulled: 0, pushed: 0, errors: [] };
  try {
    await req("GET", "/api/boot");
    result.online = true;
  } catch {
    return result;
  }
  const products = (await req("GET", "/api/products")) as Product[];
  const clients = (await req("GET", "/api/clients")) as Client[];
  const accounts = (await req("GET", "/api/accounts")) as Account[];
  await db.withTransactionAsync(async () => {
    for (const p of products) {
      const ex = await db.getFirstAsync<{ id: number }>("SELECT id FROM products WHERE id=?", [p.id]);
      if (ex) await db.runAsync("UPDATE products SET code=?,name=?,category=?,subcategory=?,unit=?,price=?,cost=?,min_stock=? WHERE id=?",
        [p.code, p.name, p.category, p.subcategory, p.unit, p.price, p.cost, p.min_stock, p.id]);
      else await db.runAsync("INSERT INTO products(id,code,name,category,subcategory,unit,price,cost,stock,min_stock) VALUES(?,?,?,?,?,?,?,?,?,?)",
        [p.id, p.code, p.name, p.category, p.subcategory, p.unit, p.price, p.cost, p.stock, p.min_stock]);
      result.pulled++;
    }
    for (const c of clients) {
      const ex = await db.getFirstAsync<{ id: number }>("SELECT id FROM clients WHERE id=?", [c.id]);
      if (ex) await db.runAsync("UPDATE clients SET name=?,phone=? WHERE id=?", [c.name, c.phone, c.id]);
      else await db.runAsync("INSERT INTO clients(id,name,phone) VALUES(?,?,?)", [c.id, c.name, c.phone]);
    }
    for (const a of accounts) {
      const ex = await db.getFirstAsync<{ id: number }>("SELECT id FROM accounts WHERE id=?", [a.id]);
      if (ex) await db.runAsync("UPDATE accounts SET name=?,detail=?,kind=? WHERE id=?", [a.name, a.detail, a.kind, a.id]);
      else await db.runAsync("INSERT INTO accounts(id,name,detail,kind) VALUES(?,?,?,?)", [a.id, a.name, a.detail, a.kind]);
    }
  });
  for (const s of await unsyncedSales(db)) {
    try {
      const items = await db.getAllAsync<{ product_id: number; qty: number }>("SELECT product_id, qty FROM sale_items WHERE sale_id=?", [s.id]);
      const payments = await db.getAllAsync<{ account_id: number; amount: number }>(
        "SELECT account_id, amount FROM cash_movements WHERE sale_id=? AND cancelled=0 AND type='ENTRADA'", [s.id]);
      await req("POST", "/api/sales", { items, discount: s.discount, client_id: s.client_id ?? null, payments });
      await markSaleSynced(db, s.id);
      result.pushed++;
    } catch (e) {
      result.errors.push(`Venda #${s.number}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return result;
}

export async function refreshLocal(db: DB): Promise<{ products: number; clients: number; accounts: number }> {
  const [products, clients, accounts] = await Promise.all([listProducts(db, {}), listClients(db), listAccounts(db)]);
  return { products: products.length, clients: clients.length, accounts: accounts.length };
}
