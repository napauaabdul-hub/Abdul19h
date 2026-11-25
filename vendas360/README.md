# Vendas 360 — Sistema de Gestão de Supermercado / Comercial

Sistema completo estilo PDV (ponto de venda) para supermercado, bar, restaurante e mercearia,
inspirado nas melhores práticas dos players do setor (TOTVS/Consinco, Linx, VR Software, RP Info):
PDV integrado a estoque e caixa, múltiplas formas de pagamento (Dinheiro, M-Pesa, e-Mola, POS, banco),
crediário/fiado com liquidação de faturas, relatórios com IVA e lucro real, e posição de estoque (PEPS).

## Módulos (espelham as telas do produto)

| Tela | Funcionalidades |
|---|---|
| **PDV** | Categorias (Restaurante, Bar, Mercearia, Talho & Peixaria, Padaria) + subcategorias, grade de produtos com stock e preço em MT, carrinho ("a mesma venda continua"), seleção de cliente, pagamento à vista ou fiado (total/parcial → fatura PARCIAL), baixa automática de stock |
| **Caixa** | Nova Entrada / Nova Saída / Quebra-Reembolso, resumo diário (entradas, saídas, reembolsos com nº de transações), saldo por conta de pagamento com TOTAL GERAL, histórico de movimentos com anulação |
| **Crédito** | Busca de clientes ("Procurar cliente..."), lista com dívida em MT, DÍVIDA TOTAL ACUMULADA + Liquidar Tudo, detalhe de fatura (#número, status PARCIAL, saldo devedor, data, original, já pago, nº produtos), "Liquidar Fatura" (valor a pagar + conta destino) com confirmação verde |
| **Relatórios** | Extrato de Vendas (Subtotal, Descontos, Total IVA 16%, Total Geral, Lucro Real, ticket médio), tabela ID/DATA, CLIENTE, TOTAL, LUCRO, STATUS, aba Itens Vendidos, exportação CSV e PDF (impressão) |
| **Estoque** | Posição de Estoque: PRODUTO, ABERTURA, ENTRADAS, SAÍDAS, FECHO por dia, alerta de ruptura, entrada de mercadoria |
| **Cadastros** | Produtos, clientes e contas de pagamento |

## Como correr

Requisitos: Python 3.10+ (apenas biblioteca padrão — SQLite embutido, zero dependências).

```bash
cd vendas360
python3 server.py        # http://localhost:8080
# ou noutra porta:
python3 server.py 9000
```

A base de dados `vendas360.db` é criada e semeada automaticamente na primeira execução
com produtos, clientes, faturas, contas e vendas de exemplo (moeda MT, IVA 16% de Moçambique).

## API REST

- `GET /api/products?q=&category=` · `POST /api/products` · `PUT /api/products/:id`
- `GET /api/clients?q=` · `POST /api/clients`
- `GET /api/accounts`
- `POST /api/sales` — `{items:[{product_id,qty}], discount, client_id, payments:[{account_id,amount}]}` → cria venda, baixa stock, gera movimentos de caixa e fatura se houver resto fiado
- `GET /api/sales?from=&to=` · `GET /api/sales/:id`
- `GET /api/invoices?client_id=` · `GET /api/invoices/:id` · `POST /api/invoices/:id/payments` · `POST /api/clients/:id/pay-all`
- `GET /api/credit/summary`
- `GET /api/cash/summary?date=YYYY-MM-DD` · `POST /api/cash/movements` · `POST /api/cash/movements/:id/cancel`
- `GET /api/reports/sales?from=&to=` · `GET /api/reports/items?from=&to=` · `GET /api/reports/export?from=&to=` (CSV)
- `GET /api/stock/position?date=YYYY-MM-DD` · `POST /api/stock/entries`

## Estrutura

```
vendas360/
├── server.py          # API REST + servidor estático + esquema SQLite + seed (stdlib puro)
├── static/
│   ├── index.html     # shell da aplicação
│   ├── styles.css     # tema visual
│   └── app.js         # SPA (PDV, Caixa, Crédito, Relatórios, Estoque, Cadastros)
└── vendas360.db       # criada automaticamente
```

## Notas de negócio implementadas

- Venda não baixa stock insuficiente (validação no servidor).
- Pagamento parcial sem cliente é recusado; com cliente gera fatura `PARCIAL`, liquidada ao pagar o saldo.
- IVA de 16% (Moçambique) calculado sobre o subtotal; lucro real = total − IVA − CMV (custo dos itens).
- Saldos das contas de pagamento são derivados dos movimentos (abertura + entradas + pagamentos de dívida − saídas − reembolsos), como num fecho de caixa real.
- Posição de estoque recomputada a partir dos movimentos (abertura/entradas/saídas/fecho), suportando produtos a peso (kg).
