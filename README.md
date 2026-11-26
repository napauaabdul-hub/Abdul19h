# SkillHub — Marketplace de Agentes de IA

Site estático (HTML + CSS + JavaScript puro, sem dependências) que funciona como uma loja de agentes de IA criados por especialistas: os criadores publicam as suas Skills, definem o preço e ganham a cada subscrição.

## Funcionalidades

- Hero com pesquisa e filtro por categorias (Vídeo, Finanças, Marketing, Design, etc.)
- Grelha de agentes com autor, vendas, avaliação, categoria e preço (grátis ou subscrição)
- Secção "Publica o teu Skill e ganha 24/7" com os 3 passos (Enviar → Definir o preço → Ser pago)
- Secção "Por que SkillHub" e FAQ em acordeão
- Design escuro responsivo, sem necessidade de build

## Como executar

Basta abrir o ficheiro `index.html` no navegador, ou servir a pasta com qualquer servidor estático, por exemplo:

```bash
python3 -m http.server 8000
```

Depois abre http://localhost:8000

Também funciona diretamente no GitHub Pages (basta ativar nas definições do repositório).

## Estrutura

- `index.html` — estrutura da página
- `styles.css` — estilos (tema escuro, responsivo)
- `app.js` — dados dos agentes, filtros de categoria, pesquisa e renderização
- `prompts/` — prompts completos dos agentes publicados (ex.: `fofinho.md`)
