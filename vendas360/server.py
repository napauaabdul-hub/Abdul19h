#!/usr/bin/env python3
"""Vendas 360 - Sistema de gestao de supermercado/comercial (PDV + Caixa + Credito + Relatorios + Estoque).
Backend em Python puro (stdlib + SQLite), sem dependencias externas.
Uso: python3 server.py [porta]   -> http://localhost:8080
"""
import csv
import io
import json
import os
import re
import sqlite3
from datetime import datetime, date, timedelta
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

BASE = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(BASE, "static")
DB = os.path.join(BASE, "vendas360.db")
IVA_RATE = 0.16  # IVA Moçambique

SCHEMA = """
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
  cost REAL NOT NULL, status TEXT DEFAULT 'CONCLUIDO'
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
  type TEXT NOT NULL,  -- ENTRADA, SAIDA, REEMBOLSO, PAGAMENTO_DIVIDA, ABERTURA
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  amount REAL NOT NULL, description TEXT,
  sale_id INTEGER, created_at TEXT NOT NULL, cancelled INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  type TEXT NOT NULL,  -- ABERTURA, ENTRADA, SAIDA, AJUSTE
  qty REAL NOT NULL, note TEXT, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_cash_created ON cash_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_created ON stock_movements(created_at);
"""


def now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def today():
    return date.today().isoformat()


def db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys=ON")
    return con


def init_db():
    con = db()
    con.executescript(SCHEMA)
    if con.execute("SELECT COUNT(*) c FROM products").fetchone()["c"] == 0:
        seed(con)
    con.commit()
    con.close()


def seed(con):
    c = con.cursor()
    products = [
        # name, category, sub, unit, price, cost, stock, min
        ("1/4 de frango", "Restaurante", "Pratos", "un", 350, 200, 455, 20),
        ("Arroz com Feijao", "Restaurante", "Pratos", "un", 250, 140, 128, 15),
        ("Chamuças", "Restaurante", "Entradas", "un", 120, 60, 53, 10),
        ("Bandeja 1 porco", "Talho & Peixaria", "Carnes", "kg", 1000, 650, 31.5, 5),
        ("Peixe fresco", "Talho & Peixaria", "Peixe", "kg", 850, 550, 12, 3),
        ("2M Basuca", "Bar", "Cervejas", "un", 100, 55, 240, 24),
        ("Castle Lite 330ml", "Bar", "Cervejas", "un", 250, 160, 169, 24),
        ("Heineken 350ml", "Bar", "Cervejas", "un", 250, 165, 241, 24),
        ("Caixa Brutas", "Bar", "Cervejas", "cx", 2500, 1800, 25, 4),
        ("Refrigerante 500ml", "Bar", "Bebidas", "un", 80, 45, 310, 30),
        ("Agua 500ml", "Bar", "Bebidas", "un", 50, 25, 500, 50),
        ("Arroz 5kg", "Mercearia", "Mercearia", "un", 450, 320, 60, 10),
        ("Oleo 1L", "Mercearia", "Mercearia", "un", 280, 190, 85, 10),
        ("Acucar 1kg", "Mercearia", "Mercearia", "un", 95, 60, 140, 20),
        ("Sal 1kg", "Mercearia", "Mercearia", "un", 60, 38, 90, 15),
        ("Macarrao 500g", "Mercearia", "Mercearia", "un", 70, 42, 200, 30),
        ("Aspirina Bayer 500mg", "Mercearia", "Farmacia", "un", 150, 80, 120, 20),
        ("Pao", "Padaria", "Padaria", "un", 30, 15, 180, 40),
        ("Bolo de aniversario", "Padaria", "Doces", "un", 900, 500, 8, 2),
    ]
    for i, (name, cat, sub, unit, price, cost, stock, mn) in enumerate(products, 1):
        c.execute(
            "INSERT INTO products(code,name,category,subcategory,unit,price,cost,stock,min_stock) VALUES(?,?,?,?,?,?,?,?,?)",
            (f"P{i:04d}", name, cat, sub, unit, price, cost, stock, mn),
        )
        c.execute(
            "INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?,?,?,?,?)",
            (i, "ABERTURA", stock, "Stock de abertura", "2026-08-01 08:00:00"),
        )
    clients = [
        ("Belmonte montes", "84 100 1001"),
        ("Igor", "84 100 1002"),
        ("Sergio", "84 100 1003"),
        ("Marcelina", "84 100 1004"),
        ("Felizardo Afonso", "84 100 1005"),
        ("Lazaro", "84 100 1006"),
    ]
    for name, phone in clients:
        c.execute("INSERT INTO clients(name,phone) VALUES(?,?)", (name, phone))
    accounts = [
        ("Dinheiro", "Caixa Principal", "dinheiro"),
        ("M-pesa", "842022532", "mpesa"),
        ("e-mola", "871213952", "emola"),
        ("POS", "4548948", "pos"),
        ("uoulouou", "uiou", "outros"),
        ("BCI", "44984", "banco"),
        ("Mpesa do Negocio", "84xxxxxxx", "mpesa"),
    ]
    for name, detail, kind in accounts:
        c.execute("INSERT INTO accounts(name,detail,kind) VALUES(?,?,?)", (name, detail, kind))
    # Saldos de abertura das contas (para espelhar o ecra de caixa)
    opening = {1: 28600.00, 2: 1415.00, 3: 10000.00, 4: 940.00, 5: 14500.00, 6: 0.00, 7: 11000.00}
    for acc_id, amount in opening.items():
        if amount:
            c.execute(
                "INSERT INTO cash_movements(type,account_id,amount,description,created_at) VALUES('ABERTURA',?,?,?,?)",
                (acc_id, amount, "Saldo de abertura", "2026-08-01 08:00:00"),
            )
    # Faturas de fiado (dividas dos clientes, como no ecra)
    invoices = [
        (5, 31866, "2026-08-04 15:32:00", 4499.00, 2200.00, "PARCIAL"),
        (6, 31870, "2026-08-06 19:10:00", 5200.00, 0.00, "ABERTA"),
        (4, 31855, "2026-08-02 12:05:00", 1250.00, 0.00, "ABERTA"),
        (3, 31840, "2026-07-30 18:44:00", 850.00, 0.00, "ABERTA"),
        (2, 31821, "2026-07-28 09:20:00", 300.00, 0.00, "ABERTA"),
        (1, 31802, "2026-07-25 17:00:00", 500.00, 0.00, "ABERTA"),
    ]
    items_f = [
        (31866, [("Bandeja 1 porco", 2.5, 1000, 650), ("2M Basuca", 4, 100, 55), ("Refrigerante 500ml", 3, 80, 45)]),
    ]
    for client_id, num, created, original, paid, status in invoices:
        c.execute(
            "INSERT INTO invoices(number,sale_id,client_id,created_at,original,paid,status) VALUES(?,?,?,?,?,?,?)",
            (num, None, client_id, created, original, paid, status),
        )
        if paid > 0:
            c.execute(
                "INSERT INTO invoice_payments(invoice_id,account_id,amount,created_at) SELECT id,1,?,? FROM invoices WHERE number=?",
                (paid, "2026-08-05 10:00:00", num),
            )
            c.execute(
                "INSERT INTO cash_movements(type,account_id,amount,description,created_at) SELECT 'PAGAMENTO_DIVIDA',1,?, 'Pagamento fatura #'||?, ? FROM invoices WHERE number=?",
                (paid, num, "2026-08-05 10:00:00", num),
            )
    # Vendas historicas (extrato de vendas)
    sales_hist = [
        ("2026-08-19 15:37:00", None, 1050, 0, 300, [("Chamuças", 5, 120, 60), ("1/4 de frango", 1, 350, 200), ("2M Basuca", 2, 100, 55)]),
        ("2026-08-18 13:47:00", None, 350, 0, 200, [("1/4 de frango", 1, 350, 200)]),
        ("2026-08-12 18:12:00", None, 800, 0, 283.33, [("Arroz com Feijao", 2, 250, 140), ("Heineken 350ml", 2, 250, 165)]),
        ("2026-08-10 11:25:00", 5, 4499, 0, 2200, [("Bandeja 1 porco", 2.5, 1000, 650), ("2M Basuca", 4, 100, 55), ("Refrigerante 500ml", 3, 80, 45)]),
    ]
    for created, client_id, total, disc, cost, items in sales_hist:
        subtotal = total / (1 + IVA_RATE)
        iva = total - subtotal
        cur = c.execute(
            "INSERT INTO sales(number,created_at,client_id,subtotal,discount,iva,total,cost,status) VALUES(?,?,?,?,?,?,?,?,?)",
            (36000 + c.execute("SELECT COUNT(*) c FROM sales").fetchone()["c"] + 553, created, client_id, subtotal, disc, iva, total, cost, "CONCLUIDO"),
        )
        sid = cur.lastrowid
        for name, qty, price, pcost in items:
            c.execute("INSERT INTO sale_items(sale_id,product_id,name,qty,price,cost) VALUES(?,?,?,?,?,?)",
                      (sid, c.execute("SELECT id FROM products WHERE name=?", (name,)).fetchone()[0], name, qty, price, pcost))
            pid = c.execute("SELECT id FROM products WHERE name=?", (name,)).fetchone()[0]
            c.execute("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?,?,?,?,?)",
                      (pid, "SAIDA", -qty, f"Venda #{sid}", created))
            c.execute("UPDATE products SET stock=stock-? WHERE id=?", (qty, pid))
        c.execute("INSERT INTO cash_movements(type,account_id,amount,description,sale_id,created_at) VALUES('ENTRADA',1,?,?,?,?)",
                  (total, f"Venda #{sid}", sid, created))
    # Entradas de mercancía (para a posicao de estoque)
    entradas = [("Bandeja 1 porco", 8, "2026-08-15 09:00:00"), ("Cerveja 2M Expresso", 125.5, "2026-08-16 10:30:00")]
    c.execute("INSERT INTO products(code,name,category,subcategory,unit,price,cost,stock,min_stock) VALUES(?,?,?,?,?,?,?,?,?)",
              ("P0100", "Cerveja 2M (Cx)", "Bar", "Cervejas", "un", 2400, 1700, 45, 6))
    c.execute("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES((SELECT id FROM products WHERE name='Cerveja 2M (Cx)'),'ABERTURA',45,'Stock de abertura','2026-08-01 08:00:00')")
    c.execute("INSERT INTO products(code,name,category,subcategory,unit,price,cost,stock,min_stock) VALUES(?,?,?,?,?,?,?,?,?)",
              ("P0101", "Cerveja 2M Expresso", "Bar", "Cervejas", "un", 90, 50, 415.5, 40))
    c.execute("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES((SELECT id FROM products WHERE name='Cerveja 2M Expresso'),'ABERTURA',290,'Stock de abertura','2026-08-01 08:00:00')")
    for name, qty, created in entradas:
        pid = c.execute("SELECT id FROM products WHERE name=?", (name,)).fetchone()[0]
        c.execute("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?, 'ENTRADA', ?, 'Entrada de mercadoria', ?)", (pid, qty, created))
        c.execute("UPDATE products SET stock=stock+? WHERE id=?", (qty, pid))
    # Saidas avulsas para a posicao de estoque (Aspirina -10, Bandeja -2.5)
    for name, qty, created in [("Aspirina Bayer 500mg", 10, "2026-08-17 14:00:00"), ("Bandeja 1 porco", 2.5, "2026-08-18 13:47:00")]:
        pid = c.execute("SELECT id FROM products WHERE name=?", (name,)).fetchone()[0]
        c.execute("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?, 'SAIDA', ?, 'Venda/baixa', ?)", (pid, -qty, created))
        c.execute("UPDATE products SET stock=stock-? WHERE id=?", (qty, pid))
    # Sequencias numericas como no app original (#31866, #36553...)
    c.execute("INSERT OR REPLACE INTO sqlite_sequence(name,seq) VALUES('sales', 36553)")
    c.execute("INSERT OR REPLACE INTO sqlite_sequence(name,seq) VALUES('invoices', 31866)")


# ---------- helpers ----------

def rows(con, sql, params=()):
    return [dict(r) for r in con.execute(sql, params).fetchall()]


def one(con, sql, params=()):
    r = con.execute(sql, params).fetchone()
    return dict(r) if r else None


def client_debt(con, client_id):
    r = con.execute(
        "SELECT COALESCE(SUM(original-paid),0) d FROM invoices WHERE client_id=? AND status IN ('ABERTA','PARCIAL')",
        (client_id,),
    ).fetchone()
    return round(r["d"], 2)


def next_number(con, table):
    n = con.execute(f"SELECT COALESCE(MAX(number),0)+1 n FROM {table}").fetchone()["n"]
    return n


def fmt_dt(s):
    try:
        return datetime.strptime(s, "%Y-%m-%d %H:%M:%S").strftime("%d/%m/%Y %H:%M")
    except Exception:
        return s


# ---------- API ----------

def api_get(con, path, qs):
    if path == "/api/products":
        q = (qs.get("q", [""])[0] or "").lower()
        cat = qs.get("category", [""])[0]
        sql = "SELECT * FROM products WHERE 1=1"
        args = []
        if q:
            sql += " AND (lower(name) LIKE ? OR lower(code) LIKE ?)"
            args += [f"%{q}%", f"%{q}%"]
        if cat:
            sql += " AND category=?"
            args.append(cat)
        sql += " ORDER BY category, name"
        return 200, rows(con, sql, args)
    if path == "/api/categories":
        cats = rows(con, "SELECT DISTINCT category FROM products ORDER BY category")
        subs = rows(con, "SELECT DISTINCT category, subcategory FROM products WHERE subcategory IS NOT NULL ORDER BY category, subcategory")
        return 200, {"categories": [c["category"] for c in cats], "subcategories": subs}
    if path == "/api/clients":
        q = (qs.get("q", [""])[0] or "").lower()
        cs = rows(con, "SELECT * FROM clients ORDER BY name")
        for c in cs:
            c["debt"] = client_debt(con, c["id"])
        if q:
            cs = [c for c in cs if q in c["name"].lower()]
        return 200, cs
    if path == "/api/accounts":
        return 200, rows(con, "SELECT * FROM accounts ORDER BY id")
    if path == "/api/sales":
        frm = qs.get("from", [""])[0]
        to = qs.get("to", [""])[0]
        sql = """SELECT s.*, c.name AS client_name FROM sales s LEFT JOIN clients c ON c.id=s.client_id WHERE 1=1"""
        args = []
        if frm:
            sql += " AND s.created_at >= ?"
            args.append(frm + " 00:00:00")
        if to:
            sql += " AND s.created_at <= ?"
            args.append(to + " 23:59:59")
        sql += " ORDER BY s.created_at DESC, s.id DESC"
        out = []
        for s in rows(con, sql, args):
            s["created_at_fmt"] = fmt_dt(s["created_at"])
            s["lucro"] = round(s["total"] - s["iva"] - s["cost"], 2)
            out.append(s)
        return 200, out
    m = re.match(r"^/api/sales/(\d+)$", path)
    if m:
        sid = int(m.group(1))
        s = one(con, "SELECT s.*, c.name AS client_name FROM sales s LEFT JOIN clients c ON c.id=s.client_id WHERE s.id=?", (sid,))
        if not s:
            return 404, {"error": "venda nao encontrada"}
        s["created_at_fmt"] = fmt_dt(s["created_at"])
        s["items"] = rows(con, "SELECT * FROM sale_items WHERE sale_id=?", (sid,))
        s["lucro"] = round(s["total"] - s["iva"] - s["cost"], 2)
        pays = rows(con, """SELECT cm.*, a.name AS account_name FROM cash_movements cm JOIN accounts a ON a.id=cm.account_id WHERE cm.sale_id=? AND cm.cancelled=0""", (sid,))
        s["payments"] = pays
        return 200, s
    if path == "/api/invoices":
        client_id = qs.get("client_id", [None])[0]
        sql = """SELECT i.*, c.name AS client_name,
                 (SELECT COUNT(*) FROM sale_items si WHERE si.sale_id=i.sale_id) AS n_items
                 FROM invoices i JOIN clients c ON c.id=i.client_id WHERE i.status IN ('ABERTA','PARCIAL')"""
        args = []
        if client_id:
            sql += " AND i.client_id=?"
            args.append(int(client_id))
        sql += " ORDER BY i.created_at DESC"
        out = []
        for i in rows(con, sql, args):
            i["saldo"] = round(i["original"] - i["paid"], 2)
            i["created_at_fmt"] = fmt_dt(i["created_at"])
            out.append(i)
        return 200, out
    m = re.match(r"^/api/invoices/(\d+)$", path)
    if m:
        iid = int(m.group(1))
        i = one(con, """SELECT i.*, c.name AS client_name, c.phone AS client_phone FROM invoices i JOIN clients c ON c.id=i.client_id WHERE i.id=?""", (iid,))
        if not i:
            return 404, {"error": "fatura nao encontrada"}
        i["saldo"] = round(i["original"] - i["paid"], 2)
        i["created_at_fmt"] = fmt_dt(i["created_at"])
        i["n_items"] = con.execute("SELECT COUNT(*) c FROM sale_items WHERE sale_id=?", (i["sale_id"],)).fetchone()["c"] if i["sale_id"] else 0
        i["items"] = rows(con, "SELECT * FROM sale_items WHERE sale_id=?", (i["sale_id"],)) if i["sale_id"] else []
        i["payments"] = rows(con, "SELECT p.*, a.name AS account_name FROM invoice_payments p LEFT JOIN accounts a ON a.id=p.account_id WHERE p.invoice_id=? ORDER BY p.created_at", (iid,))
        return 200, i
    if path == "/api/credit/summary":
        total = con.execute("SELECT COALESCE(SUM(original-paid),0) t FROM invoices WHERE status IN ('ABERTA','PARCIAL')").fetchone()["t"]
        clients = rows(con, "SELECT * FROM clients ORDER BY name")
        for c in clients:
            c["debt"] = client_debt(con, c["id"])
        clients = [c for c in clients if c["debt"] > 0]
        clients.sort(key=lambda c: -c["debt"])
        return 200, {"total_debt": round(total, 2), "clients": clients}
    if path == "/api/cash/summary":
        d = qs.get("date", [today()])[0]
        day = rows(con, """SELECT type, COUNT(*) n, COALESCE(SUM(amount),0) total FROM cash_movements
                           WHERE cancelled=0 AND substr(created_at,1,10)=? AND type IN ('ENTRADA','SAIDA','REEMBOLSO')
                           GROUP BY type""", (d,))
        resumo = {t: {"total": 0.0, "n": 0} for t in ("ENTRADA", "SAIDA", "REEMBOLSO")}
        for r in day:
            resumo[r["type"]] = {"total": round(r["total"], 2), "n": r["n"]}
        accounts = rows(con, "SELECT * FROM accounts ORDER BY id")
        for a in accounts:
            r = con.execute("""SELECT COALESCE(SUM(CASE WHEN type IN ('ENTRADA','PAGAMENTO_DIVIDA','ABERTURA') THEN amount ELSE -amount END),0) s
                               FROM cash_movements WHERE account_id=? AND cancelled=0""", (a["id"],)).fetchone()
            a["balance"] = round(r["s"], 2)
        total_geral = round(sum(a["balance"] for a in accounts), 2)
        hist = rows(con, """SELECT cm.*, a.name AS account_name FROM cash_movements cm JOIN accounts a ON a.id=cm.account_id
                            WHERE substr(cm.created_at,1,10)=? ORDER BY cm.created_at DESC, cm.id DESC LIMIT 200""", (d,))
        for h in hist:
            h["created_at_fmt"] = fmt_dt(h["created_at"])
        return 200, {"date": d, "resumo": resumo, "accounts": accounts, "total_geral": total_geral, "historico": hist}
    if path == "/api/reports/sales":
        frm = qs.get("from", [""])[0] or (today())
        to = qs.get("to", [""])[0] or (today())
        s = one(con, """SELECT COUNT(*) n, COALESCE(SUM(subtotal),0) subtotal, COALESCE(SUM(discount),0) discounts,
                        COALESCE(SUM(iva),0) iva, COALESCE(SUM(total),0) total, COALESCE(SUM(cost),0) cost
                        FROM sales WHERE created_at >= ? AND created_at <= ?""",
                (frm + " 00:00:00", to + " 23:59:59"))
        vendas = rows(con, """SELECT s.*, c.name AS client_name FROM sales s LEFT JOIN clients c ON c.id=s.client_id
                              WHERE s.created_at >= ? AND s.created_at <= ? ORDER BY s.created_at DESC, s.id DESC""",
                      (frm + " 00:00:00", to + " 23:59:59"))
        for v in vendas:
            v["created_at_fmt"] = fmt_dt(v["created_at"])
            v["lucro"] = round(v["total"] - v["iva"] - v["cost"], 2)
        lucro_real = round(s["total"] - s["iva"] - s["cost"], 2)
        return 200, {
            "from": frm, "to": to,
            "subtotal": round(s["subtotal"], 2), "descontos": round(s["discounts"], 2),
            "iva": round(s["iva"], 2), "total": round(s["total"], 2), "lucro_real": lucro_real,
            "n_vendas": s["n"], "ticket_medio": round(s["total"] / s["n"], 2) if s["n"] else 0,
            "vendas": vendas,
        }
    if path == "/api/reports/items":
        frm = qs.get("from", [today()])[0]
        to = qs.get("to", [today()])[0]
        items = rows(con, """SELECT si.name, si.product_id, SUM(si.qty) qty, SUM(si.qty*si.price) total, SUM(si.qty*si.cost) cost,
                             p.category FROM sale_items si JOIN sales s ON s.id=si.sale_id LEFT JOIN products p ON p.id=si.product_id
                             WHERE s.created_at >= ? AND s.created_at <= ?
                             GROUP BY si.product_id ORDER BY total DESC""",
                     (frm + " 00:00:00", to + " 23:59:59"))
        for it in items:
            it["lucro"] = round(it["total"] - it["cost"], 2)
        return 200, items
    if path == "/api/reports/export":
        frm = qs.get("from", [today()])[0]
        to = qs.get("to", [today()])[0]
        vendas = rows(con, """SELECT s.*, c.name AS client_name FROM sales s LEFT JOIN clients c ON c.id=s.client_id
                              WHERE s.created_at >= ? AND s.created_at <= ? ORDER BY s.created_at""",
                      (frm + " 00:00:00", to + " 23:59:59"))
        buf = io.StringIO()
        w = csv.writer(buf, delimiter=";")
        w.writerow(["ID", "DATA", "CLIENTE", "SUBTOTAL", "DESCONTO", "IVA", "TOTAL", "CUSTO", "LUCRO", "STATUS"])
        for v in vendas:
            w.writerow([f"#{v['number']}", fmt_dt(v["created_at"]), v["client_name"] or "Consumidor Final",
                        f"{v['subtotal']:.2f}".replace(".", ","), f"{v['discount']:.2f}".replace(".", ","),
                        f"{v['iva']:.2f}".replace(".", ","), f"{v['total']:.2f}".replace(".", ","),
                        f"{v['cost']:.2f}".replace(".", ","),
                        f"{(v['total']-v['iva']-v['cost']):.2f}".replace(".", ","), v["status"]])
        return 200, {"csv": buf.getvalue()}
    if path == "/api/stock/position":
        d = qs.get("date", [today()])[0]
        prods = rows(con, "SELECT * FROM products ORDER BY category, name")
        out = []
        for p in prods:
            abertura = con.execute("""SELECT COALESCE(SUM(qty),0) s FROM stock_movements
                                      WHERE product_id=? AND created_at < ?""", (p["id"], d + " 00:00:00")).fetchone()["s"]
            entradas = con.execute("""SELECT COALESCE(SUM(qty),0) s FROM stock_movements
                                      WHERE product_id=? AND type='ENTRADA' AND substr(created_at,1,10)=?""", (p["id"], d)).fetchone()["s"]
            saidas = con.execute("""SELECT COALESCE(SUM(qty),0) s FROM stock_movements
                                    WHERE product_id=? AND type='SAIDA' AND substr(created_at,1,10)=?""", (p["id"], d)).fetchone()["s"]
            fecho = con.execute("""SELECT COALESCE(SUM(qty),0) s FROM stock_movements
                                   WHERE product_id=? AND created_at <= ?""", (p["id"], d + " 23:59:59")).fetchone()["s"]
            out.append({**p, "abertura": abertura, "entradas": entradas, "saidas": saidas, "fecho": fecho})
        return 200, {"date": d, "items": out}
    if path == "/api/boot":
        return 200, {
            "user": {"name": "Montes Chipire", "role": "Gestor"},
            "iva_rate": IVA_RATE, "currency": "MT",
        }
    return 404, {"error": "rota nao encontrada"}


def api_post(con, path, body):
    if path == "/api/sales":
        items = body.get("items") or []
        if not items:
            return 400, {"error": "carrinho vazio"}
        discount = float(body.get("discount") or 0)
        client_id = body.get("client_id")
        payments = body.get("payments") or []  # [{account_id, amount}]
        subtotal = 0.0
        cost = 0.0
        lines = []
        for it in items:
            p = one(con, "SELECT * FROM products WHERE id=?", (int(it["product_id"]),))
            if not p:
                return 400, {"error": f"produto {it['product_id']} nao encontrado"}
            qty = float(it["qty"])
            if qty <= 0:
                return 400, {"error": "quantidade invalida"}
            if p["stock"] < qty:
                return 400, {"error": f"stock insuficiente: {p['name']} (disponivel {p['stock']} {p['unit']})"}
            subtotal += qty * p["price"]
            cost += qty * p["cost"]
            lines.append((p, qty))
        subtotal = round(subtotal, 2)
        iva = round(subtotal * IVA_RATE, 2)
        total = round(subtotal - discount + iva, 2)
        paid = round(sum(float(p["amount"]) for p in payments), 2)
        if paid > total + 0.001:
            return 400, {"error": "valor pago superior ao total"}
        fiado = round(total - paid, 2)
        if fiado > 0.005 and not client_id:
            return 400, {"error": "pagamento parcial exige cliente (fiado)"}
        if client_id and not one(con, "SELECT id FROM clients WHERE id=?", (client_id,)):
            return 400, {"error": "cliente nao encontrado"}
        num = next_number(con, "sales")
        cur = con.execute(
            "INSERT INTO sales(number,created_at,client_id,subtotal,discount,iva,total,cost,status) VALUES(?,?,?,?,?,?,?,?,?)",
            (num, now_str(), client_id, subtotal, discount, iva, total, round(cost, 2),
             "CONCLUIDO" if fiado <= 0.005 else "PARCIAL"),
        )
        sid = cur.lastrowid
        for p, qty in lines:
            con.execute("INSERT INTO sale_items(sale_id,product_id,name,qty,price,cost) VALUES(?,?,?,?,?,?)",
                        (sid, p["id"], p["name"], qty, p["price"], p["cost"]))
            con.execute("UPDATE products SET stock=stock-? WHERE id=?", (qty, p["id"]))
            con.execute("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?,?,?,?,?)",
                        (p["id"], "SAIDA", -qty, f"Venda #{num}", now_str()))
        for pay in payments:
            amt = float(pay["amount"])
            if amt <= 0:
                continue
            con.execute("INSERT INTO cash_movements(type,account_id,amount,description,sale_id,created_at) VALUES('ENTRADA',?,?,?,?,?)",
                        (int(pay["account_id"]), amt, f"Venda #{num}", sid, now_str()))
        invoice = None
        if fiado > 0.005:
            inum = next_number(con, "invoices")
            cur2 = con.execute("INSERT INTO invoices(number,sale_id,client_id,created_at,original,paid,status) VALUES(?,?,?,?,?,?,?)",
                               (inum, sid, client_id, now_str(), total, paid, "PARCIAL" if paid > 0 else "ABERTA"))
            invoice = {"id": cur2.lastrowid, "number": inum, "saldo": fiado}
        con.commit()
        return 201, {"sale_id": sid, "number": num, "total": total, "pago": paid, "fiado": fiado, "invoice": invoice}
    m = re.match(r"^/api/invoices/(\d+)/payments$", path)
    if m:
        iid = int(m.group(1))
        inv = one(con, "SELECT * FROM invoices WHERE id=?", (iid,))
        if not inv:
            return 404, {"error": "fatura nao encontrada"}
        if inv["status"] == "LIQUIDADA":
            return 400, {"error": "fatura ja liquidada"}
        amount = round(float(body.get("amount") or 0), 2)
        account_id = int(body.get("account_id"))
        saldo = round(inv["original"] - inv["paid"], 2)
        if amount <= 0:
            return 400, {"error": "valor invalido"}
        if amount > saldo + 0.005:
            return 400, {"error": f"valor superior ao saldo devedor ({saldo:.2f} MT)"}
        if not one(con, "SELECT id FROM accounts WHERE id=?", (account_id,)):
            return 400, {"error": "conta destino invalida"}
        con.execute("INSERT INTO invoice_payments(invoice_id,account_id,amount,created_at) VALUES(?,?,?,?)",
                    (iid, account_id, amount, now_str()))
        new_paid = round(inv["paid"] + amount, 2)
        status = "LIQUIDADA" if new_paid >= inv["original"] - 0.005 else "PARCIAL"
        con.execute("UPDATE invoices SET paid=?, status=? WHERE id=?", (new_paid, status, iid))
        con.execute("INSERT INTO cash_movements(type,account_id,amount,description,created_at) VALUES('PAGAMENTO_DIVIDA',?,?,?,?)",
                    (account_id, amount, f"Pagamento fatura #{inv['number']}", now_str()))
        con.commit()
        return 201, {"invoice_id": iid, "number": inv["number"], "pago": new_paid, "saldo": round(inv["original"] - new_paid, 2), "status": status}
    m = re.match(r"^/api/clients/(\d+)/pay-all$", path)
    if m:
        cid = int(m.group(1))
        account_id = int(body.get("account_id"))
        invs = rows(con, "SELECT * FROM invoices WHERE client_id=? AND status IN ('ABERTA','PARCIAL') ORDER BY created_at", (cid,))
        if not invs:
            return 400, {"error": "cliente sem dividas"}
        total = round(sum(i["original"] - i["paid"] for i in invs), 2)
        for i in invs:
            amt = round(i["original"] - i["paid"], 2)
            con.execute("INSERT INTO invoice_payments(invoice_id,account_id,amount,created_at) VALUES(?,?,?,?)",
                        (i["id"], account_id, amt, now_str()))
            con.execute("UPDATE invoices SET paid=original, status='LIQUIDADA' WHERE id=?", (i["id"],))
            con.execute("INSERT INTO cash_movements(type,account_id,amount,description,created_at) VALUES('PAGAMENTO_DIVIDA',?,?,?,?)",
                        (account_id, amt, f"Liquidacao total fatura #{i['number']}", now_str()))
        con.commit()
        return 201, {"client_id": cid, "pago": total, "faturas": len(invs)}
    if path == "/api/cash/movements":
        t = body.get("type")
        if t not in ("ENTRADA", "SAIDA", "REEMBOLSO"):
            return 400, {"error": "tipo invalido (ENTRADA, SAIDA, REEMBOLSO)"}
        amount = round(float(body.get("amount") or 0), 2)
        if amount <= 0:
            return 400, {"error": "valor invalido"}
        account_id = int(body.get("account_id"))
        if not one(con, "SELECT id FROM accounts WHERE id=?", (account_id,)):
            return 400, {"error": "conta invalida"}
        desc = body.get("description") or ""
        cur = con.execute("INSERT INTO cash_movements(type,account_id,amount,description,created_at) VALUES(?,?,?,?,?)",
                          (t, account_id, amount, desc, now_str()))
        con.commit()
        return 201, {"id": cur.lastrowid, "type": t, "amount": amount}
    m = re.match(r"^/api/cash/movements/(\d+)/cancel$", path)
    if m:
        mid = int(m.group(1))
        mv = one(con, "SELECT * FROM cash_movements WHERE id=?", (mid,))
        if not mv:
            return 404, {"error": "movimento nao encontrado"}
        con.execute("UPDATE cash_movements SET cancelled=1 WHERE id=?", (mid,))
        con.commit()
        return 200, {"id": mid, "cancelled": True}
    if path == "/api/stock/entries":
        pid = int(body.get("product_id"))
        qty = float(body.get("qty") or 0)
        if qty <= 0:
            return 400, {"error": "quantidade invalida"}
        if not one(con, "SELECT id FROM products WHERE id=?", (pid,)):
            return 400, {"error": "produto invalido"}
        con.execute("INSERT INTO stock_movements(product_id,type,qty,note,created_at) VALUES(?,'ENTRADA',?,?,?)",
                    (pid, qty, body.get("note") or "Entrada de mercadoria", now_str()))
        con.execute("UPDATE products SET stock=stock+? WHERE id=?", (qty, pid))
        con.commit()
        return 201, {"product_id": pid, "qty": qty}
    if path == "/api/products":
        name = (body.get("name") or "").strip()
        if not name:
            return 400, {"error": "nome obrigatorio"}
        cur = con.execute(
            "INSERT INTO products(code,name,category,subcategory,unit,price,cost,stock,min_stock) VALUES(?,?,?,?,?,?,?,?,?)",
            (body.get("code") or None, name, body.get("category") or "Mercearia", body.get("subcategory"),
             body.get("unit") or "un", float(body.get("price") or 0), float(body.get("cost") or 0),
             float(body.get("stock") or 0), float(body.get("min_stock") or 0)),
        )
        con.commit()
        return 201, {"id": cur.lastrowid}
    m = re.match(r"^/api/products/(\d+)$", path)
    if m and path.startswith("/api/products/"):
        pid = int(m.group(1))
        con.execute("UPDATE products SET name=?, category=?, subcategory=?, unit=?, price=?, cost=?, min_stock=? WHERE id=?",
                    (body.get("name"), body.get("category"), body.get("subcategory"), body.get("unit"),
                     float(body.get("price") or 0), float(body.get("cost") or 0), float(body.get("min_stock") or 0), pid))
        con.commit()
        return 200, {"id": pid}
    if path == "/api/clients":
        name = (body.get("name") or "").strip()
        if not name:
            return 400, {"error": "nome obrigatorio"}
        cur = con.execute("INSERT INTO clients(name,phone,note) VALUES(?,?,?)",
                          (name, body.get("phone"), body.get("note")))
        con.commit()
        return 201, {"id": cur.lastrowid, "name": name}
    return 404, {"error": "rota nao encontrada"}


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _json(self, code, obj):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _body(self):
        ln = int(self.headers.get("Content-Length") or 0)
        if not ln:
            return {}
        return json.loads(self.rfile.read(ln).decode("utf-8"))

    def do_GET(self):
        u = urlparse(self.path)
        if u.path.startswith("/api/"):
            con = db()
            try:
                code, obj = api_get(con, u.path, parse_qs(u.query))
            except Exception as e:
                code, obj = 500, {"error": str(e)}
            finally:
                con.close()
            return self._json(code, obj)
        return self._static(u.path)

    def do_POST(self):
        u = urlparse(self.path)
        if u.path.startswith("/api/"):
            con = db()
            try:
                code, obj = api_post(con, u.path, self._body())
            except Exception as e:
                con.rollback()
                code, obj = 500, {"error": str(e)}
            finally:
                con.close()
            return self._json(code, obj)
        self._json(404, {"error": "nao encontrado"})

    def do_PUT(self):
        u = urlparse(self.path)
        if u.path.startswith("/api/"):
            con = db()
            try:
                body = self._body()
                m = re.match(r"^/api/products/(\d+)$", u.path)
                if m:
                    code, obj = api_post(con, u.path, body)
                else:
                    code, obj = 404, {"error": "rota nao encontrada"}
            except Exception as e:
                code, obj = 500, {"error": str(e)}
            finally:
                con.close()
            return self._json(code, obj)
        self._json(404, {"error": "nao encontrado"})

    def _static(self, path):
        if path in ("/", ""):
            path = "/index.html"
        fp = os.path.normpath(os.path.join(STATIC, path.lstrip("/")))
        if not fp.startswith(STATIC) or not os.path.isfile(fp):
            self.send_response(404)
            self.end_headers()
            return
        ext = os.path.splitext(fp)[1]
        ctype = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
                 ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml"}.get(ext, "application/octet-stream")
        with open(fp, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main():
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    init_db()
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Vendas 360 a correr em http://localhost:{port}")
    srv.serve_forever()


if __name__ == "__main__":
    main()
