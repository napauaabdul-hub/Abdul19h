# Vendas 360 — App Android (Expo / React Native)

Versão mobile do sistema de gestão de supermercado **Vendas 360**, com as mesmas telas do app das imagens:
**PDV** (categorias, produtos com stock e preço em MT, carrinho, cliente, venda à vista ou fiado parcial),
**Caixa** (entradas/saídas/reembolso, saldo por conta + total geral, histórico com anulação),
**Crédito** (clientes com dívida, dívida total acumulada + Liquidar Tudo, fatura com saldo devedor e liquidação),
**Relatórios** (extrato de vendas com subtotal, descontos, IVA 16%, total geral, lucro real, ticket médio, export CSV/PDF),
**Estoque** (posição abertura/entradas/saídas/fecho, entrada de mercadoria, alerta de ruptura) e **Cadastros**.

## Stack

- **Expo SDK 58 + React Native + TypeScript + Expo Router** (mesma stack do app NAPAUA deste repositório)
- **expo-sqlite**: banco local (funciona **offline** — o PDV continua a vender sem internet)
- **Sincronização opcional** com o backend `../vendas360/server.py` (botão "⇅ Sync" no topo): recebe catálogo e envia vendas pendentes
- Regras de negócio em `src/lib/money.ts` (IVA 16%, lucro real, status de fatura) — idênticas ao backend web

## Como correr

```bash
cd vendas360-app
npm install
npx expo start          # QR → Expo Go no telemóvel Android
# ou
npm run android         # abre no emulador Android
# APK de desenvolvimento:
npx eas-cli@latest build --profile development --platform android
```

Para sincronizar com o backend Python (`python3 ../vendas360/server.py`):
- **Emulador Android:** usa `http://10.0.2.2:8080` (já configurado em `src/lib/api.ts`)
- **Telemóvel físico:** trocar `BASE_URL` para o IP do computador na mesma rede Wi-Fi

## Testes e qualidade

```bash
npm test          # testes unitários (node --test) de formatação e regras de negócio
npm run typecheck # tsc --noEmit
npm run lint      # expo lint
```

## Estrutura

```
vendas360-app/
├── app.json / package.json / tsconfig.json / babel.config.js
├── src/
│   ├── app/               # Expo Router: (tabs)/ pdv, caixa, credito, relatorios, estoque, cadastros
│   ├── components/ui.tsx  # Screen (topbar VENDAS 360 + Sync + utilizador), Card, Button, Chip, Badge, Input...
│   ├── context/ToastContext.tsx
│   └── lib/
│       ├── format.ts      # fmtMT pt-MZ, datas (puro, testado)
│       ├── money.ts       # IVA 16%, calcTotals, invoiceStatus, lucroReal, aggregateReport (puro, testado)
│       ├── db.ts          # esquema SQLite + seed (mesmos dados do backend)
│       ├── store.ts       # operações de negócio (vendas, fiado, faturas, caixa, relatórios, estoque)
│       └── api.ts         # sync com o backend (BASE_URL 10.0.2.2:8080 no emulador)
└── tests/logic.test.ts
```
