# NAPAUA BUILD

Aplicativo móvel gratuito para planeamento de construções em Moçambique — Expo + React Native + TypeScript + Expo Router.

**Marca:** logo "N" formada por martelo (diagonal laranja) e chave inglesa (barras brancas) sobre teal `#07566A`.

**Slogan:** Planeie melhor. Calcule os materiais. Construa com confiança.

## Como executar

```bash
npm install
npx expo start          # Expo Go (QR code)
npx expo start --android
npx expo start --ios
```

## Estrutura

- `src/app/` — rotas (Expo Router): `(auth)` (boas-vindas, entrar, criar conta, recuperar acesso), `(tabs)` (Início, Calculadora, Serviços, Orçamentos, Conta), fluxo `calculadora/` (tipo → características → métodos/materiais → etapas → resultados → orçamento), `servicos/`, `plantas/`, `orcamentos/`, `projeto/[id]`, `busca`, `notificacoes`.
- `src/lib/calculator.ts` — motor da calculadora: 16 etapas da construção com fórmulas verificáveis (`src/lib/parameters.ts` concentra todos os parâmetros técnicos e desperdícios).
- `src/lib/materials.ts` — catálogo de materiais com preços de referência em MT (editáveis no ecrã de orçamento).
- `src/lib/export.ts` — exportação PDF (expo-print), Excel/CSV (expo-file-system) e partilha WhatsApp.
- `src/lib/storage.ts` + `src/context/` — persistência local (AsyncStorage): utilizadores, projetos, pedidos, plantas guardadas. Funciona offline; autenticação local de demonstração (a integração Supabase entra como fase seguinte, sem mudar as telas).

## Paleta (alinhada à logo NAPAUA BUILD)

Fundo branco + cinzento `#F5F5F5` + texto `#212121` + estrelas âmbar `#FFC107` (prova social).

- Teal `#07566A` como cor primária (confiança/estabilidade, da logo) e teal vivo `#1296B0` em ícones/estados ativos
- Laranja `#F47721` apenas em CTAs (ação/energia), âmbar `#FFC107` em avaliações
- Moeda: Metical (MT). Idioma: português.

## Verificações

```bash
npx tsc --noEmit   # typecheck
npx expo lint      # lint
npx expo-doctor    # diagnóstico de dependências
CI=1 npx expo export --platform android   # bundle de fumo
```
