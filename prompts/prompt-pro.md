# PromptPRO — Manual Avançado de Prompts Eficazes

> Fonte: `PromptEngineeringPRO.pdf` — artigo público "How to write an effective GPT prompt" (Reid Robinson, Zapier, 14/06/2024). Este ficheiro contém um **resumo original** das 8 dicas; o texto integral pertence à Zapier.

## As 8 dicas (resumo)

1. **Dá contexto** — indica o tipo de conteúdo e os detalhes do que queres (ex.: post de blog sobre X para pequenas empresas, em vez de "escreve sobre produtividade"). Inclui também o estilo de escrita pretendido.
2. **Coloca a informação útil logo no início** — cola o teu CV, artigo ou dados antes do pedido para a IA os usar diretamente.
3. **Dá exemplos** — exemplos positivos mostram o resultado pretendido; exemplos negativos (ou resultados anteriores que não gostaste) dizem o que evitar. Usa "Agent:" no fim para indicar onde a IA deve começar.
4. **Define o comprimento da resposta** — pede um intervalo de palavras (ex.: "resumo de 500–750 palavras").
5. **Define os formatos esperados** — de entrada e de saída (CSV, HTML, gráfico, JSON...).
6. **Pede à IA para te ajudar a criar o prompt** — descreve as tuas necessidades com o máximo de detalhe e pede-lhe o prompt ideal; depois reutiliza-o nela própria.
7. **Usa expressões úteis** — "vamos pensar passo a passo", "pensar de trás para a frente", "no estilo de [pessoa]", "como [profissão]", "explica para [idade]", "para a publicação da [empresa]".
8. **Dá um papel ao modelo** — no playground, altera o system prompt (ex.: "és um padeiro especialista..."); no ChatGPT, usa instruções personalizadas.

## Dica extra

Testa, refina e volta a testar. Ajusta variáveis como **temperature** (criatividade: 0–2; padrão 1) e **max tokens** (comprimento máximo da resposta).
