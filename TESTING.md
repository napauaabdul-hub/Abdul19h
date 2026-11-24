# Testes em dispositivos Android (Fase 7)

Sem emulador na sandbox, a verificação automática cobre: `npm test` (47 testes do motor), `npx tsc --noEmit`, `npx expo lint`, `npx expo-doctor` (20/20), smoke test do bundle Android via Metro (HTTP 200, 6,0 MB dev) e `CI=1 npx expo export --platform android` (bundle Hermes 3,3 MB — todas as rotas compilam).

## 1. Preparar o telemóvel

Opção A — Expo Go (rápido, para testes de UI):

```bash
npx expo start          # no computador, na mesma rede Wi-Fi
```

No telemóvel: instalar **Expo Go** (Play Store) → ler o QR do terminal. Nota: expo-print/expo-sharing/expo-speech/AsyncStorage native precisam de **dev build** em vez do Expo Go; para testar essas funções usar a Opção B.

Opção B — APK de desenvolvimento (recomendado para testar tudo):

```bash
npx eas-cli@latest login            # conta Expo (gratuita)
npx eas-cli@latest build --profile development --platform android
```

ou build de produção/preview para instalar como app normal. Depois instalar o APK no telemóvel (`adb install app.apk` ou enviar o ficheiro).

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
