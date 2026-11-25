#!/usr/bin/env python3
"""Smoke test do Vendas 360: sobe o servidor numa porta local e valida os fluxos principais.
Uso: python3 test_smoke.py   (exit 0 = OK)
"""
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

BASE = os.path.dirname(os.path.abspath(__file__))
PORT = 8123


def req(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(r, timeout=5) as res:
            return res.status, json.loads(res.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def main():
    db = os.path.join(BASE, "vendas360.db")
    if os.path.exists(db):
        os.remove(db)
    proc = subprocess.Popen([sys.executable, os.path.join(BASE, "server.py"), str(PORT)],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        base = f"http://127.0.0.1:{PORT}"
        for _ in range(50):
            try:
                if req("GET", base + "/api/boot")[0] == 200:
                    break
            except Exception:
                time.sleep(0.2)
        else:
            raise SystemExit("servidor nao subiu")

        s, boot = req("GET", base + "/api/boot")
        assert s == 200 and boot["currency"] == "MT", boot

        s, cs = req("GET", base + "/api/credit/summary")
        assert s == 200 and cs["total_debt"] > 0, cs

        s, sale = req("POST", base + "/api/sales",
                      {"items": [{"product_id": 6, "qty": 2}], "client_id": 5,
                       "payments": [{"account_id": 1, "amount": 100}]})
        assert s == 201 and sale["invoice"] and sale["fiado"] > 0, sale

        s, err = req("POST", base + "/api/sales",
                     {"items": [{"product_id": 6, "qty": 99999}], "payments": [{"account_id": 1, "amount": 1}]})
        assert s == 400, err

        s, rep = req("GET", base + "/api/reports/sales")
        assert s == 200 and rep["n_vendas"] >= 1, rep

        s, st = req("GET", base + "/api/stock/position")
        assert s == 200 and st["items"], st

        with urllib.request.urlopen(base + "/", timeout=5) as r:
            assert r.status == 200
        print("SMOKE OK")
    finally:
        proc.terminate()
        try:
            proc.wait(5)
        except Exception:
            proc.kill()
        if os.path.exists(db):
            os.remove(db)


if __name__ == "__main__":
    main()
