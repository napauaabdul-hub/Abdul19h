const CATEGORIES = [
  "Tendência",
  "Pesquisa",
  "Vídeo",
  "Finanças",
  "Imagem",
  "Comércio",
  "Redes sociais",
  "Marketing",
  "Escrita",
  "Educação",
  "Produtividade",
  "Design",
  "Análise",
  "RH",
  "Vendas",
  "Consultoria",
  "Engenharia",
  "Produto",
  "Estilo de vida",
  "Jurídico",
  "Média",
  "Viagem",
  "Jogos",
  "Ciência",
];

const AGENTS = [
  { name: "VideoClipe", icon: "🎬", cat: "Vídeo", author: "ana.silva", sold: "65k", soldNum: 65000, rating: 4.6, price: "US$12.5 / mês", free: false, desc: "Transforma ideias, roteiros e imagens de produto em vídeos curtos prontos a publicar no TikTok, Reels e Shorts." },
  { name: "FinDash", icon: "💹", cat: "Finanças", author: "joao.p", sold: "3,4k", soldNum: 3400, rating: 4.9, price: "US$6.99 / mês", free: false, desc: "Analisa as tuas despesas, cria orçamentos automáticos e deteta padrões de gasto com relatórios claros por mês." },
  { name: "LivroColorir", icon: "🎨", cat: "Imagem", author: "maria.c", sold: "4,1k", soldNum: 4100, rating: 4.7, price: "US$12.5 / mês", free: false, desc: "Cria livros de colorir lindos com IA, sem saber desenhar: desenhos, capas e PDFs prontos a imprimir ou vender." },
  { name: "PostMaster", icon: "📱", cat: "Redes sociais", author: "carlos.m", sold: "2,1k", soldNum: 2100, rating: 4.6, price: "US$8.33 / mês", free: false, desc: "Gera publicações, legendas e hashtags otimizadas para Instagram, TikTok e LinkedIn a partir de uma simples ideia." },
  { name: "ResumoPro", icon: "📄", cat: "Pesquisa", author: "sofia.r", sold: "5,6k", soldNum: 5600, rating: 4.9, price: "Grátis", free: true, desc: "Resume documentos longos, artigos e relatórios em pontos-chave objetivos, com citações das fontes originais." },
  { name: "CopyVenda", icon: "🛒", cat: "Vendas", author: "andre.o", sold: "2,8k", soldNum: 2800, rating: 4.8, price: "US$9.99 / mês", free: false, desc: "Escreve e-mails comerciais, páginas de venda e scripts de vendas que convertem, adaptados ao teu público." },
  { name: "CodeBuddy", icon: "💻", cat: "Engenharia", author: "diogo.m", sold: "6,3k", soldNum: 6300, rating: 4.9, price: "US$11.99 / mês", free: false, desc: "Revê o teu código, encontra bugs, explica erros e gera testes e documentação técnica em segundos." },
  { name: "ShopGenius", icon: "🏪", cat: "Comércio", author: "mariana.c", sold: "3,1k", soldNum: 3100, rating: 4.8, price: "US$8.33 / mês", free: false, desc: "Cria descrições de produtos otimizadas para SEO para a tua loja online, com títulos e bullets prontos a usar." },
  { name: "FotoPro", icon: "🖼️", cat: "Imagem", author: "nuno.s", sold: "2,4k", soldNum: 2400, rating: 4.7, price: "US$10.99 / mês", free: false, desc: "Gera e edita imagens com IA: fotos de produto, avatares e ilustrações, nos formatos certos para cada rede social." },
  { name: "MarketerAI", icon: "📣", cat: "Marketing", author: "sara.l", sold: "1,8k", soldNum: 1800, rating: 4.5, price: "US$12.49 / mês", free: false, desc: "Planeia campanhas de marketing completas: público-alvo, mensagens, canais e calendário de conteúdos." },
  { name: "TradutorPro", icon: "🌍", cat: "Escrita", author: "pedro.a", sold: "1,7k", soldNum: 1700, rating: 4.8, price: "US$3.99 / dia", free: false, desc: "Tradução profissional em mais de 30 idiomas, com tom formal, informal ou técnico consoante o contexto." },
  { name: "EscolaPlus", icon: "📚", cat: "Educação", author: "ines.f", sold: "980", soldNum: 980, rating: 4.9, price: "US$7.99 / mês", free: false, desc: "Cria planos de aula, fichas de exercícios e resumos de estudo adaptados ao ano escolar dos teus alunos." },
  { name: "FocoTotal", icon: "✅", cat: "Produtividade", author: "rui.n", sold: "4,2k", soldNum: 4200, rating: 4.5, price: "Grátis", free: true, desc: "Organiza as tuas tarefas, define prioridades diárias e acompanha o teu progresso com relatórios semanais." },
  { name: "LogoMaker", icon: "✨", cat: "Design", author: "beatriz.l", sold: "760", soldNum: 760, rating: 4.6, price: "US$12.99 / mês", free: false, desc: "Gera logótipos e propostas de identidade visual para a tua marca, com variações de cor e estilo." },
  { name: "AnalyzeX", icon: "📊", cat: "Análise", author: "luis.t", sold: "1,1k", soldNum: 1100, rating: 4.7, price: "US$14.99 / mês", free: false, desc: "Analisa folhas de cálculo e dados de negócio, encontra tendências e entrega relatórios visuais prontos a apresentar." },
  { name: "RecrutaAI", icon: "🤝", cat: "RH", author: "marta.s", sold: "340", soldNum: 340, rating: 4.4, price: "US$19.99 / mês", free: false, desc: "Faz a triagem de CVs, compara candidatos e prepara perguntas de entrevista personalizadas para cada vaga." },
  { name: "ConsultorVirtual", icon: "💼", cat: "Consultoria", author: "hugo.p", sold: "210", soldNum: 210, rating: 4.7, price: "US$29.99 / hora", free: false, desc: "Sessões deaconselhamento estratégico sobre negócio, produto e crescimento, com plano de ação no fim de cada sessão." },
  { name: "ProdutoZen", icon: "🧭", cat: "Produto", author: "laura.b", sold: "450", soldNum: 450, rating: 4.5, price: "US$13.99 / mês", free: false, desc: "Ajuda a definir roadmaps de produto, priorizar funcionalidades e escrever user stories claras para a tua equipa." },
  { name: "BemEstar", icon: "🏃", cat: "Estilo de vida", author: "tiago.f", sold: "1,9k", soldNum: 1900, rating: 4.6, price: "US$5.99 / semana", free: false, desc: "Cria planos de treino e nutrição personalizados conforme os teus objetivos, tempo disponível e preferências." },
  { name: "ContratosClaros", icon: "⚖️", cat: "Jurídico", author: "catarina.v", sold: "620", soldNum: 620, rating: 4.8, price: "US$24.99 / hora", free: false, desc: "Explica contratos e documentos legais em linguagem simples e aponta cláusulas a que deves prestar atenção." },
  { name: "MediaWatch", icon: "📰", cat: "Média", author: "filipe.a", sold: "1,5k", soldNum: 1500, rating: 4.4, price: "Grátis", free: true, desc: "Monitoriza notícias do teu setor e envia um resumo diário com os temas mais relevantes para ti." },
  { name: "ViagemSmart", icon: "✈️", cat: "Viagem", author: "raquel.m", sold: "830", soldNum: 830, rating: 4.7, price: "US$4.99 / dia", free: false, desc: "Planeia viagens completas: itinerários por dia, orçamentos, alojamento e restaurantes recomendados no destino." },
  { name: "GameMaster", icon: "🎮", cat: "Jogos", author: "goncalo.r", sold: "290", soldNum: 290, rating: 4.6, price: "US$7.99 / mês", free: false, desc: "Desenvolve ideias de jogos: conceito, mecânicas, personagens e guiões, prontos para entregar a uma equipa de desenvolvimento." },
  { name: "LabCiencia", icon: "🔬", cat: "Ciência", author: "ines.p", sold: "1,0k", soldNum: 1000, rating: 4.9, price: "Grátis", free: true, desc: "Resume artigos científicos e explica conceitos complexos de forma acessível, com referências às publicações originais." },
];

let activeCategory = "Tendência";

const chipsEl = document.getElementById("chips");
const gridEl = document.getElementById("grid");
const countEl = document.getElementById("agent-count");
const emptyEl = document.getElementById("empty");
const searchEl = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

function renderChips() {
  chipsEl.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (cat === activeCategory ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      activeCategory = cat;
      renderChips();
      renderAgents();
    });
    chipsEl.appendChild(btn);
  });
}

function matchesSearch(agent, query) {
  if (!query) return true;
  const haystack = `${agent.name} ${agent.desc} ${agent.cat} ${agent.author}`.toLowerCase();
  return haystack.includes(query);
}

function renderAgents() {
  const query = searchEl.value.trim().toLowerCase();
  let list = AGENTS.filter(
    (a) =>
      (activeCategory === "Tendência" || a.cat === activeCategory) &&
      matchesSearch(a, query)
  );
  list = [...list].sort((a, b) => b.soldNum - a.soldNum);

  gridEl.innerHTML = "";
  list.forEach((a) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card-icon">${a.icon}</div>
      <h3>${a.name}</h3>
      <p class="desc">${a.desc}</p>
      <span class="by">by: ${a.author}</span>
      <div class="stats">
        <span>🛒 ${a.sold} vendidos</span>
        <span>⭐ ${a.rating.toFixed(1)}</span>
      </div>
      <div class="card-foot">
        <span class="cat-tag">${a.cat}</span>
        <span class="price${a.free ? " free" : ""}">${a.price}</span>
      </div>
    `;
    gridEl.appendChild(card);
  });

  countEl.textContent = `${list.length} agente${list.length === 1 ? "" : "s"}`;
  emptyEl.hidden = list.length !== 0;
}

searchEl.addEventListener("input", renderAgents);
searchBtn.addEventListener("click", () => {
  document.getElementById("agentes").scrollIntoView({ behavior: "smooth" });
});
searchEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("agentes").scrollIntoView({ behavior: "smooth" });
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

renderChips();
renderAgents();
