# Testes em dispositivos Android (Fase 7)

Sem emulador na sandbox, a verificação automática cobre: `npm test` (47 testes do motor), `npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor` (20/20), smoke test do bundle Android via Metro (HTTP 200, 6,0 MB dev) e `CI=1 npx expo export --platform android` (bundle Hermes 3,3 MB — todas as rotas compilam).

## 0. Codespaces no telemóvel (sem PC e sem login Expo)

O `--tunnel` pede login Expo e o callback vai para `localhost` do Codespace (inacessível do telemóvel). **Não use `--tunnel`**:

1. No Codespace (branch `vibe/napaua-entrega`), no terminal: `npx expo start --port 8081`
2. Aba **Ports** (ao lado do Terminal) → porta **8081** → confirmar visibilidade **Public** (o `.devcontainer` já a configura) → copiar o URL público, ex.: `https://abc123-8081.app.github.dev`
3. No Expo Go no telemóvel: **Enter URL manually** → colar `exp://abc123-8081.app.github.dev` (trocar `https://` por `exp://`)
4. A app carrega. Sem conta Expo necessária.

Se um dia precisar de login Expo (ex.: EAS build), faça-o **dentro do navegador do próprio Codespace**: `npx expo login`, abrir o URL impresso no navegador interno do VS Code (Simple Browser), aprovar, e o terminal fica autenticado.

### Troubleshooting "Something went wrong" no Expo Go

1. Atualize o **Expo Go** na Play Store (tem de suportar SDK 58) e no app faça *shake* → **Reload** (ou limpe a cache nas definições do Expo Go).
2. No Codespace, pare e volte a iniciar com cache limpa: `npx expo start --port 8081 --clear`.
3. Use o URL **exato** que aparece no terminal na linha `Metro waiting on exp://...` — não monte o URL à mão. Se mostrar um IP de rede local (172.x/192.168.x), isso não é alcançável do telemóvel: nesse caso copie o **Forwarded Address** da aba **Ports** (8081, Public), ex. `https://abc123-8081.app.github.dev`, e no Expo Go use `exp://abc123-8081.app.github.dev`.
4. Se continuar a falhar, envie: (a) o conteúdo de **View error log** no Expo Go e (b) o output do terminal do Codespace depois de o telemóvel tentar abrir — um deles mostra o erro real.
5. Alternativa fiável: login dentro do Codespace (ponto acima) e depois `npx expo start --tunnel` — o URL `exp://....exp.direct` é feito para telemóvel.

### Erro específico: `Uncaught Error: java.io.IOException: Failed to download remote update`

O Expo Go não conseguiu descarregar o bundle → é o URL/rede, não o código. Por ordem:

1. No terminal do Codespace, copie o URL **exatamente** como aparece em `Metro waiting on exp://...` (se for IP local 172.x/192.168.x, não serve para o telemóvel).
2. Aba **Ports** → 8081 → **Public** → copie o *Forwarded Address* `https://NOME-8081.app.github.dev` e no Expo Go use `exp://NOME-8081.app.github.dev` (Enter URL manually). Expo Go atualizado.
3. Se falhar outra vez: faça login **dentro do navegador do Codespace** (`npx expo login` → abrir o URL no Simple Browser do VS Code → aprovar; o callback `localhost:44309` só funciona lá dentro) e depois `npx expo start --tunnel` → ler o QR `exp://....exp.direct:80` com o Expo Go.
4. Fallback sem Expo Go: `npx expo start --web --port 8081` e abra `https://NOME-8081.app.github.dev` no **navegador do telemóvel** — testa toda a UI no browser (PDF usa print do navegador, voz/ficheiros têm limitações web).

## 1. Preparar o telemóvel

Opção A — Expo Go (rápido, para testes de UI):

```bash
npx expo start          # no computador, na mesma rede Wi-Fi
```

No telemóvel: instalar **Expo Go** (Play Store) → ler o QR do terminal. Nota: expo-print/expo-sharing/expo-speech/AsyncStorage native precisam de **dev build** em vez do Expo Go; para testar essas funções usar a Opção B.

Opção B — APK de desenvolvimento (recomendado para testar tudo):

```bash
npx eas-cli@latest login            # conta Expo (gratuita) — se não tiver, crie em expo.dev/signup
npx eas-cli@latest build --profile development --platform android
```

Na primeira build, responda **sim** quando pedir para criar o projeto no expo.dev e para o EAS gerar o keystore (credenciais geridas). O `eas.json` já vem no repositório com os perfis `development` (APK), `preview` (APK) e `production` (AAB). A build demora ~10–20 min e no fim dá um **link/QR para descarregar o APK**. Depois instalar o APK no telemóvel (`adb install app.apk` ou enviar o ficheiro e tocar nele, autorizando "fontes desconhecidas").

## 2. Matriz de dispositivos sugerida (realidade de Moçambique)

| Classe | Exemplos | O que verificar |
|---|---|---|
| Entrada (2 GB RAM, Android 8–10) | Tecno Spark, Samsung Galaxy A12, Itel | Fluidez, memória, fontes legíveis |
| Médio (Android 11–13) | Samsung A33/A54, Redmi Note | Todos os fluxos abaixo |
| Ecrã grande/tablet | Galaxy Tab | Layouts não quebram |

Testar com **dados móveis (3G/4G lentos)** e com **Wi-Fi**, e pelo menos um teste **offline** (app abre, calculadora funciona sem internet; login/IA precisam de internet — esperado segundo o documento).

## 3. Checklist de fluxos (critérios de conclusão do documento, §19)

- [ ] Registo (telefone/email/palavra-passe) e login funcionam; palavra-passe errada dá erro; "Explorar sem conta" entra como convidado.
- [ ] Recuperar acesso mostra mensagem correta para conta existente.
- [ ] Home: banner, categorias (incl. Ferramentas), serviços recomendados com estrelas, pesquisa abre resultados.
- [ ] Calculadora: T2 → características → métodos (chapas) → 16 etapas → resultados por etapa (ex.: fundação ≈ 67 sacos para 9×6 m) → resumo geral → orçamento em MT com preços editáveis → guardar projeto.
- [ ] Exportar PDF e Excel (CSV) abrem e partilham; partilha WhatsApp abre o WhatsApp.
- [ ] Ferramentas: cada uma das 9 calculadoras dá resultado coerente; comparador mostra o mais barato; fornecedores ligam/WhatsApp; obra nova marca etapas com progresso; galeria abre.
- [ ] Assistente: responde a "explique a fundação", "quanto cimento preciso?", "o que falta no meu projeto?"; botão "ouvir" fala a resposta.
- [ ] Serviços: detalhe; "Aluguer de prumos" aparece com selo **Indisponível** e não deja solicitar; pedido de serviço fica "Recebido".
- [ ] Orçamentos: novo pedido → aparece na aba com estados; detalhe mostra linha do tempo.
- [ ] Conta: dados, projetos guardados, pedidos, plantas guardadas, notificações; terminar sessão volta ao ecrã de boas-vindas.
- [ ] Admin: entrar com `admin@napauabuild.mz` / `admin123`; alterar preço de um material e confirmar que o orçamento usa o novo preço; mudar desperdício; adicionar/remover serviço e planta; mudar estado de pedido; suspender utilizador e confirmar que o login fica bloqueado; sair.
- [ ] Performance: app abre em < 5 s em 4G; bundle ~3,3 MB; sem crashes ao rodar todas as telas.
- [ ] Segurança: palavras-passe não aparecem em claro no armazenamento; painel admin não abre sem login.

## 4. Reportar bugs

Anotar: dispositivo + Android, pasos, captura de ecrã e se havia internet. Abrir issue no repositório com a etiqueta `fase-7`.
