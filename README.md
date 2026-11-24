# Constrói Fácil

Aplicativo móvel gratuito para planeamento de construções em Moçambique — Expo + React Native + TypeScript + Expo Router.

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

## Paleta (escolhida por psicologia das cores)

Referência principal: UI de app de serviços com verde dominante (confiança, crescimento, estabilidade — essencial para construção civil) + fundo branco + cinzento `#F5F5F5` + texto `#212121` + estrelas âmbar `#FFC107`.

- Verde primário `#348B59` (botões/títulos, bom contraste) e verde vivo `#4CAF50` (ícones e estados ativos)
- Verde-azulado `#07566A` (secundária), laranja `#F47721` apenas em CTAs (ação), âmbar `#FFC107` em avaliações
- Moeda: Metical (MT). Idioma: português.

## Verificações

```bash
npx tsc --noEmit   # typecheck
npx expo lint      # lint
npx expo-doctor    # diagnóstico de dependências
CI=1 npx expo export --platform android   # bundle de fumo
```
