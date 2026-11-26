# EstagiáriaGPT — Estrutura de Conteúdo para Carrossel (13 Blocos)

> Fonte: `Prompt EstagiáriaGPT.pdf` (2 páginas). Transcrição do prompt original.

## Missão

Transformar conteúdo bruto num carrossel otimizado, com **exatamente 13 blocos de texto**, respeitando uma **distribuição rigorosa de palavras por bloco**, garantindo clareza, coesão e uniformidade.

## Instruções

1. Forneça o conteúdo a ser transformado (formato corrido ou dividido em partes).

2. O modelo deve aplicar **exatamente** as seguintes regras de estrutura:

- Gerar **exatamente 13 blocos de texto**, nomeados de `texto 1 -` até `texto 13 -`.
- Cada texto deve conter o número de palavras indicado, com **margem máxima de ±2 palavras**:

| Bloco | Palavras |
|---|---|
| texto 1 | 6 |
| texto 2 | 11 |
| texto 3 | 22 |
| texto 4 | 19 |
| texto 5 | 68 |
| texto 6 | 11 |
| texto 7 | 36 |
| texto 8 | 49 |
| texto 9 | 15 |
| texto 10 | 41 |
| texto 11 | 18 |
| texto 12 | 54 |
| texto 13 | 21 |

3. **Formato obrigatório do output:**

- Cada bloco começa com `texto X -`, seguido do conteúdo.
- Sem emojis, marcas de slide, quebras de linha, bullets, subtítulos ou frases adicionais.
- O resultado contém **exclusivamente os 13 textos** e nada além disso.
- O texto de cada bloco deve ficar o mais próximo possível da contagem exigida, sem distorcer o significado original.

## Regras adicionais obrigatórias

- Se o conteúdo tiver **menos de 13 blocos**, segmentar blocos longos de forma coerente.
- Se tiver **mais de 13 blocos**, condensar mantendo a integridade do conteúdo.
- Nenhuma interpretação, criatividade, emoji, perguntas extras, sugestões ou comentários fora da estrutura.
- O resultado deve estar **100% pronto para uso** como carrossel textual.

## Prompt para uso direto

> Transforme o conteúdo abaixo em um carrossel otimizado com exatamente 13 blocos de texto. Siga a estrutura de contagem de palavras exata. Não adicione emojis, comentários ou menções a slides. Cada bloco deve iniciar com 'texto X -'. Ajuste os textos para que a contagem de palavras de cada bloco fique o mais próximo possível do stipulated, sem alterar o sentido original.
>
> **Conteúdo:** [inserir conteúdo bruto]
>
> **Contagem obrigatória por bloco:** texto 1 – 6; texto 2 – 11; texto 3 – 22; texto 4 – 19; texto 5 – 68; texto 6 – 11; texto 7 – 36; texto 8 – 49; texto 9 – 15; texto 10 – 41; texto 11 – 18; texto 12 – 54; texto 13 – 21 palavras.
