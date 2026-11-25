import * as SQLite from "expo-sqlite";

export type DB = SQLite.SQLiteDatabase;

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT, name TEXT NOT NULL, category TEXT NOT NULL, subcategory TEXT,
  unit TEXT DEFAULT 'un', price REAL NOT NULL, cost REAL DEFAULT 0,
  stock REAL DEFAULT 0, min_stock REAL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, phone TEXT, note TEXT
);
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, detail TEXT, kind TEXT DEFAULT 'caixa'
);
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number INTEGER NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  subtotal REAL NOT NULL, discount REAL DEFAULT 0, iva REAL NOT NULL, total REAL NOT NULL,
  cost REAL NOT NULL, status TEXT DEFAULT 'CONCLUIDO', synced INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL REFERENCES sales(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  name TEXT NOT NULL, qty REAL NOT NULL, price REAL NOT NULL, cost REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number INTEGER NOT NULL UNIQUE,
  sale_id INTEGER REFERENCES sales(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  created_at TEXT NOT NULL, original REAL NOT NULL, paid REAL DEFAULT 0,
  status TEXT DEFAULT 'ABERTA'
);
CREATE TABLE IF NOT EXISTS invoice_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id),
  account_id INTEGER REFERENCES accounts(id),
  amount REAL NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cash_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  amount REAL NOT NULL, description TEXT,
  sale_id INTEGER, created_at TEXT NOT NULL, cancelled INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  type TEXT NOT NULL,
  qty REAL NOT NULL, note TEXT, created_at TEXT NOT NULL
);
`;

let dbPromise: Promise<DB> | null = null;

export function openDb(): Promise<DB> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("vendas360.db");
      await db.execAsync(SCHEMA);
      await seedIfEmpty(db);
      return db;
    })();
  }
  return dbPromise;
}

async function seedIfEmpty(db: DB): Promise<void> {
  const row = await db.getFirstAsync<{ c: number }>("SELECT COUNT(*) AS c FROM products");
  if (row && row.c > 0) return;
  await db.withTransactionAsync(async () => {
    const products: [string, string, string, string, number, number, number, number][] = [
      ["1/4 de frango", "Restaurante", "Pratos", "un", 350, 200, 455, 20],
      ["Arroz com Feijao", "Restaurante", "Pratos", "un", 250, 140, 128, 15],
      ["Chamuças", "Restaurante", "Entradas", "un", 120, 60, 53, 10],
      ["Bandeja 1 porco", "Talho & Peixaria", "Carnes", "kg", 1000, 650, 31.5, 5],
      ["Peixe fresco", "Talho & Peixaria", "Peixe", "kg", 850, 550, 12, 3],
      ["2M Basuca", "Bar", "Cervejas", "un", 100, 55, 240, 24],
      ["Castle Lite 330ml", "Bar", "Cervejas", "un", 250, 160, 169, 24],
      ["Heineken 350ml", "Bar", "Cervejas", "un", 250, 165, 241, 24],
      ["Caixa Brutas", "Bar", "Cervejas", "cx", 2500, 1800, 25, 4],
      ["Refrigerante 500ml", "Bar", "Bebidas", "un", 80, 45, 310, 30],
      ["Agua 500ml", "Bar", "Bebidas", "un", 50, 25, 500, 50],
      ["Arroz 5kg", "Mercearia", "Mercearia", "un", 450, 320, 60, 10],
      ["Oleo 1L", "Mercearia", "Mercearia", "un", 280, 190, 85, 10],
      ["Acucar 1kg", "Mercearia", "Mercearia", "un", 95, 60, 140, 20],
      ["Sal 1kg", "Mercearia", "Mercearia", "un", 60, 38, 90, 15],
      ["Macarrao 500g", "Mercearia", "Mercearia", "un", 70, 42, 200, 30],
      ["Aspirina Bayer 500mg", "Mercearia", "Farmacia", "un", 150, 80, 120, 20],
      ["Pao", "Padaria", "Padaria", "un", 30, 15, 180, 40],
      ["Bolo de aniversario", "Padaria", "Doces", "un", 900, 500, 8, 2],
      ["Cerveja 2M (Cx)", "Bar", "Cervejas", "un", 2400, 1700, 45, 6],
      ["Cerveja 2M Expresso", "Bar", "Cervejas", "un", 90, 50, 415.5, 40],
    ];
    const opening = "2026-08-01 08:00:00";
    for (let i = 0; i < products.length; i++) {
      const [name, cat, sub, unit, price, cost, stock, mn] = products[i];
      const r = await db.runAsync(
        "INSERT INTO products(code,name,category,subcategory,unit,price,cost,stock,min_stock) VALUES(?,?,?,?,?,?,?,?,?)",
        [`P${String(i + 1).padStart(4, "0")}`, name, cat, sub, unit, price, cost, stock, mn]
      );
      await db.runAsync("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?,?,?,?,?)",
        [r.lastInsertRowId, "ABERTURA", stock, "Stock de abertura", opening]);
    }
    const clients: [string, string][] = [
      ["Belmonte montes", "84 100 1001"], ["Igor", "84 100 1002"], ["Sergio", "84 100 1003"],
      ["Marcelina", "84 100 1004"], ["Felizardo Afonso", "84 100 1005"], ["Lazaro", "84 100 1006"],
    ];
    for (const [name, phone] of clients) {
      await db.runAsync("INSERT INTO clients(name,phone) VALUES(?,?)", [name, phone]);
    }
    const accounts: [string, string, string][] = [
      ["Dinheiro", "Caixa Principal", "dinheiro"], ["M-pesa", "842022532", "mpesa"],
      ["e-mola", "871213952", "emola"], ["POS", "4548948", "pos"],
      ["uoulouou", "uiou", "outros"], ["BCI", "44984", "banco"], ["Mpesa do Negocio", "84xxxxxxx", "mpesa"],
    ];
    for (const [name, detail, kind] of accounts) {
      await db.runAsync("INSERT INTO accounts(name,detail,kind) VALUES(?,?,?)", [name, detail, kind]);
    }
    const openingBalances: [number, number][] = [[1, 28600], [2, 1415], [3, 10000], [4, 940], [5, 14500], [6, 0], [7, 11000]];
    for (const [accId, amount] of openingBalances) {
      if (amount > 0) {
        await db.runAsync("INSERT INTO cash_movements(type,account_id,amount,description,created_at) VALUES('ABERTURA',?,?,?,?)",
          [accId, amount, "Saldo de abertura", opening]);
      }
    }
    const invoices: [number, number, string, number, number, string][] = [
      [5, 31866, "2026-08-04 15:32:00", 4499, 2200, "PARCIAL"],
      [6, 31870, "2026-08-06 19:10:00", 5200, 0, "ABERTA"],
      [4, 31855, "2026-08-02 12:05:00", 1250, 0, "ABERTA"],
      [3, 31840, "2026-07-30 18:44:00", 850, 0, "ABERTA"],
      [2, 31821, "2026-07-28 09:20:00", 300, 0, "ABERTA"],
      [1, 31802, "2026-07-25 17:00:00", 500, 0, "ABERTA"],
    ];
    for (const [clientId, num, created, original, paid, status] of invoices) {
      const r = await db.runAsync(
        "INSERT INTO invoices(number,sale_id,client_id,created_at,original,paid,status) VALUES(?,?,?,?,?,?,?)",
        [num, null, clientId, created, original, paid, status]);
      if (paid > 0) {
        await db.runAsync("INSERT INTO invoice_payments(invoice_id,account_id,amount,created_at) VALUES(?,?,?,?)",
          [r.lastInsertRowId, 1, paid, "2026-08-05 10:00:00"]);
        await db.runAsync("INSERT INTO cash_movements(type,account_id,amount,description,created_at) VALUES('PAGAMENTO_DIVIDA',?,?,?,?)",
          [1, paid, `Pagamento fatura #${num}`, "2026-08-05 10:00:00"]);
      }
    }
    const salesHist: [string, number | null, number, number, [string, number, number, number][]][] = [
      ["2026-08-19 15:37:00", null, 1050, 300, [["Chamuças", 5, 120, 60], ["1/4 de frango", 1, 350, 200], ["2M Basuca", 2, 100, 55]]],
      ["2026-08-18 13:47:00", null, 350, 200, [["1/4 de frango", 1, 350, 200]]],
      ["2026-08-12 18:12:00", null, 800, 283.33, [["Arroz com Feijao", 2, 250, 140], ["Heineken 350ml", 2, 250, 165]]],
      ["2026-08-10 11:25:00", 5, 4499, 2200, [["Bandeja 1 porco", 2.5, 1000, 650], ["2M Basuca", 4, 100, 55], ["Refrigerante 500ml", 3, 80, 45]]],
    ];
    let n = 36553;
    for (const [created, clientId, total, cost, items] of salesHist) {
      n += 1;
      const subtotal = total / 1.16;
      const iva = total - subtotal;
      const r = await db.runAsync(
        "INSERT INTO sales(number,created_at,client_id,subtotal,discount,iva,total,cost,status,synced) VALUES(?,?,?,?,?,?,?,?,?,1)",
        [n, created, clientId, subtotal, 0, iva, total, cost, "CONCLUIDO"]);
      const sid = r.lastInsertRowId;
      for (const [name, qty, price, pcost] of items) {
        const p = await db.getFirstAsync<{ id: number }>("SELECT id FROM products WHERE name=?", [name]);
        if (!p) continue;
        await db.runAsync("INSERT INTO sale_items(sale_id,product_id,name,qty,price,cost) VALUES(?,?,?,?,?,?)",
          [sid, p.id, name, qty, price, pcost]);
        await db.runAsync("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?,?,?,?,?)",
          [p.id, "SAIDA", -qty, `Venda #${n}`, created]);
        await db.runAsync("UPDATE products SET stock=stock-? WHERE id=?", [qty, p.id]);
      }
      await db.runAsync("INSERT INTO cash_movements(type,account_id,amount,description,sale_id,created_at) VALUES('ENTRADA',?,?,?,?)",
        [1, total, `Venda #${n}`, sid, created]);
    }
    const entradas: [string, number, string][] = [
      ["Bandeja 1 porco", 8, "2026-08-15 09:00:00"],
      ["Cerveja 2M Expresso", 125.5, "2026-08-16 10:30:00"],
    ];
    for (const [name, qty, created] of entradas) {
      const p = await db.getFirstAsync<{ id: number }>("SELECT id FROM products WHERE name=?", [name]);
      if (!p) continue;
      await db.runAsync("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?,'ENTRADA',?, 'Entrada de mercadoria', ?)",
        [p.id, qty, created]);
      await db.runAsync("UPDATE products SET stock=stock+? WHERE id=?", [qty, p.id]);
    }
    for (const [name, qty, created] of [["Aspirina Bayer 500mg", 10, "2026-08-17 14:00:00"], ["Bandeja 1 porco", 2.5, "2026-08-18 13:47:00"]] as [string, number, string][]) {
      const p = await db.getFirstAsync<{ id: number }>("SELECT id FROM products WHERE name=?", [name]);
      if (!p) continue;
      await db.runAsync("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?,'SAIDA',?,'Venda/baixa',?)",
        [p.id, -qty, created]);
      await db.runAsync("UPDATE products SET stock=stock-? WHERE id=?", [qty, p.id]);
    }
  });
}
