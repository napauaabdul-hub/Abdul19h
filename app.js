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
  { name: "PaperFinder", icon: "🔎", cat: "Pesquisa", author: "sofia.r", sold: "1,8k", soldNum: 1800, rating: 4.8, price: "US$7.99 / mês", free: false, desc: "Encontra e compara artigos científicos sobre um tema, com resumo de conclusiones e links para as fontes originais." },
  { name: "FactCheck", icon: "🕵️", cat: "Pesquisa", author: "filipe.r", sold: "940", soldNum: 940, rating: 4.6, price: "Grátis", free: true, desc: "Verifica factos de uma notícia ou afirmação e indica as fontes públicas que confirmam ou desmentem." },
  { name: "CorteFacil", icon: "✂️", cat: "Vídeo", author: "icarus", sold: "812", soldNum: 812, rating: 4.3, price: "US$6.67 / mês", free: false, desc: "Envia um vídeo longo e recebe clipes curtos com legendas, título recomendado e hashtags — só os melhores excertos." },
  { name: "AnimaKids", icon: "🧸", cat: "Vídeo", author: "jsj.studios", sold: "224", soldNum: 224, rating: 4.5, price: "US$6.99 / dia", free: false, desc: "Transforma uma ideia ou guião num desenho animado 3D para crianças, com personagens consistentes entre clips." },
  { name: "InvestidorClaro", icon: "📈", cat: "Finanças", author: "lucas", sold: "2,3k", soldNum: 2300, rating: 4.8, price: "US$8.33 / mês", free: false, desc: "Explica conceitos de investimento em linguagem simples e ajuda a organizar a tua carteira por objetivos e prazo." },
  { name: "ImpostosSimples", icon: "🧾", cat: "Finanças", author: "ana.g", sold: "540", soldNum: 540, rating: 4.7, price: "US$9.99 / hora", free: false, desc: "Ajuda a organizar faturas e documentos para o IRS e explica prazos e deduções em Portugal." },
  { name: "AvatarTu", icon: "🙂", cat: "Imagem", author: "cutieai", sold: "1,1k", soldNum: 1100, rating: 4.8, price: "Grátis", free: true, desc: "Carrega uma foto tua e recebe um avatar chibi que continua a parecer-te, em 3 estilos diferentes. Sem prompts." },
  { name: "PosterPro", icon: "🖨️", cat: "Imagem", author: "ricardo.v", sold: "670", soldNum: 670, rating: 4.6, price: "US$5.99 / semana", free: false, desc: "Cria cartazes, flyers e convites para eventos com o texto e as datas que lhe deres, prontos a imprimir." },
  { name: "ThumbForge", icon: "🖼️", cat: "Imagem", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Gera templates de thumbnails para YouTube no formato 16:9 (1280×720): título em texto grande e bold com contorno/sombra, alto contraste, fundo por imagem ou cor sólida, setas, círculos e emojis — exporta como PNG pronto a usar." },
  { name: "HashtagMax", icon: "#️⃣", cat: "Redes sociais", author: "marta.o", sold: "1,3k", soldNum: 1300, rating: 4.5, price: "Grátis", free: true, desc: "Analisa o teu nicho e devolve as melhores hashtags por categoria (viral, nicho e marca), atualizadas semanalmente." },
  { name: "ReelsVirais", icon: "🎯", cat: "Redes sociais", author: "saya", sold: "105", soldNum: 105, rating: 3.8, price: "US$3.99 / dia", free: false, desc: "Gera guiões virais para TikTok e Reels com hook nos primeiros 3 segundos, estrutura de retenção e CTA final." },
  { name: "Fofinho", icon: "🎭", cat: "Redes sociais", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Estrategista de perceção visual com persona teatral: analisa o teu feed (mín. 6 posts) com os 6 cortes — Arquétipo de Posicionamento, Arquitetura de Formato, Engenharia de Hooks, Matriz Temática Oculta, Gatilhos Psicológicos e Diagnóstico de Perceção — com notas de 1 a 10 e um bloco 'Aplicação Direta' de ideias. Prompt completo em prompts/fofinho.md." },
  { name: "LojaBoost", icon: "🛍️", cat: "Comércio", author: "lay", sold: "430", soldNum: 430, rating: 4.8, price: "US$8.33 / mês", free: false, desc: "Otimiza a tua loja online: páginas de produto, e-mails automáticos e estrutura de navegação que converte." },
  { name: "AvaliacaoPro", icon: "⭐", cat: "Comércio", author: "tomas.r", sold: "980", soldNum: 980, rating: 4.6, price: "US$4.99 / mês", free: false, desc: "Responde a avaliações de clientes de forma profissional e personalizada, protegendo a reputação da tua loja." },
  { name: "AnunciosIA", icon: "🎬", cat: "Marketing", author: "launchcraft", sold: "530", soldNum: 530, rating: 4.4, price: "Teste grátis", free: true, desc: "Planeia anúncios de vídeo pagos: hook, storyboard, locução, legendas e prompts para ferramentas de vídeo com IA." },
  { name: "EmailPro", icon: "✉️", cat: "Escrita", author: "carla.m", sold: "2,2k", soldNum: 2200, rating: 4.7, price: "US$6.99 / mês", free: false, desc: "Escreve e-mails profissionais, formais ou de vendas, com o tom certo e chamada para ação clara." },
  { name: "BlogWriter", icon: "📝", cat: "Escrita", author: "miguel.a", sold: "1,6k", soldNum: 1600, rating: 4.6, price: "US$9.99 / mês", free: false, desc: "Escreve artigos de blog otimizados para SEO a partir de uma palavra-chave, com estrutura, links internos e meta descrição." },
  { name: "StoryBook", icon: "📖", cat: "Educação", author: "optimate", sold: "530", soldNum: 530, rating: 3.7, price: "Teste grátis", free: true, desc: "Transforma uma ideia num projeto de livro infantil completo: texto, capa, estilo visual e guião de ilustrações por página." },
  { name: "ReuniaoMin", icon: "🗓️", cat: "Produtividade", author: "paulo.s", sold: "3,3k", soldNum: 3300, rating: 4.8, price: "US$5.99 / mês", free: false, desc: "A partir das tuas notas de reunião, gera uma ata estruturada com decisões, responsáveis e prazos." },
  { name: "AgendaZen", icon: "🧘", cat: "Produtividade", author: "ines.b", sold: "720", soldNum: 720, rating: 4.5, price: "Grátis", free: true, desc: "Organiza a tua semana em blocos de tempo focado, pausas e revisões, adaptando-se aos teus hábitos." },
  { name: "UIKitPro", icon: "🧩", cat: "Design", author: "sofia.d", sold: "890", soldNum: 890, rating: 4.7, price: "US$11.99 / mês", free: false, desc: "Gera componentes de interface — botões, cards, dashboards e formulários — consistentes com a tua identidade visual." },
  { name: "SentimentoX", icon: "💬", cat: "Análise", author: "luis.f", sold: "410", soldNum: 410, rating: 4.4, price: "US$7.99 / mês", free: false, desc: "Analisa comentários, reviews e inquéritos e agrupa por sentimento (positivo, negativo, neutro) com temas principais." },
  { name: "NBAStats", icon: "🏀", cat: "Análise", author: "dominic.h", sold: "177", soldNum: 177, rating: 4.8, price: "US$8.33 / mês", free: false, desc: "Análise de jogos da NBA baseada em dados: minutos, estatísticas avançadas e leitura defensável de cada número." },
  { name: "OnboardingBot", icon: "🚪", cat: "RH", author: "marta.s", sold: "260", soldNum: 260, rating: 4.6, price: "US$14.99 / mês", free: false, desc: "Cria planos de integração de 30/60/90 dias para novos colaboradores, com checklists e formações recomendadas." },
  { name: "PropostasGanha", icon: "📑", cat: "Vendas", author: "andre.l", sold: "380", soldNum: 380, rating: 4.7, price: "US$12.99 / mês", free: false, desc: "Gera propostas comerciais personalizadas a partir do brief do cliente: âmbito, prazos, preço e condições." },
  { name: "StartupAdvisor", icon: "🚀", cat: "Consultoria", author: "hugo.m", sold: "190", soldNum: 190, rating: 4.8, price: "US$39.99 / hora", free: false, desc: "Valida a tua ideia de negócio, testa o mercado-alvo e entrega um plano go-to-market numa sessão." },
  { name: "TestGen", icon: "🧪", cat: "Engenharia", author: "diogo.f", sold: "2,9k", soldNum: 2900, rating: 4.7, price: "US$9.99 / mês", free: false, desc: "Gera testes unitários e de integração para o teu código, cobrindo casos limite que normalmente esqueces." },
  { name: "DocTech", icon: "📚", cat: "Engenharia", author: "beatriz.t", sold: "1,4k", soldNum: 1400, rating: 4.6, price: "Grátis", free: true, desc: "Escreve documentação técnica, README e comentários de código claros a partir do teu repositório." },
  { name: "FeedbackLoop", icon: "🔄", cat: "Produto", author: "laura.p", sold: "310", soldNum: 310, rating: 4.5, price: "US$10.99 / mês", free: false, desc: "Organiza feedback de utilizadores em temas, conta recorrências e sugere o que priorizar no próximo sprint." },
  { name: "SonoBem", icon: "🌙", cat: "Estilo de vida", author: "tiago.s", sold: "640", soldNum: 640, rating: 4.4, price: "Grátis", free: true, desc: "Cria rotinas de sono personalizadas: horários, hábitos à noite e plano de 7 dias para dormir melhor." },
  { name: "MultasClaras", icon: "🚦", cat: "Jurídico", author: "catarina.l", sold: "290", soldNum: 290, rating: 4.5, price: "US$19.99 / hora", free: false, desc: "Explica multas e coimas em linguagem simples, diz o que podes contestar e prepara os argumentos da defesa." },
  { name: "PodcastClips", icon: "🎙️", cat: "Média", author: "anicca", sold: "2,9k", soldNum: 2900, rating: 5.0, price: "Grátis", free: true, desc: "Analisa a transcrição de um podcast e devolve até 10 melhores momentos para cortar, com citações exatas e títulos." },
  { name: "Escapadinha", icon: "🏕️", cat: "Viagem", author: "raquel.s", sold: "510", soldNum: 510, rating: 4.6, price: "US$3.99 / dia", free: false, desc: "Sugere escapadinhas de fim de semana low-cost perto de ti, com alojamento, transporte e atividades incluídas." },
  { name: "RPGMaster", icon: "🐉", cat: "Jogos", author: "goncalo.p", sold: "150", soldNum: 150, rating: 4.9, price: "US$6.99 / semana", free: false, desc: "Mestre de RPG virtual para as tuas sessões: cria mundos, NPCs e improvisa em tempo real durante o jogo." },
  { name: "EspacioNews", icon: "🛰️", cat: "Ciência", author: "ines.c", sold: "880", soldNum: 880, rating: 4.8, price: "Grátis", free: true, desc: "Resumo semanal das últimas descobertas em astronomia e espaço, explicado sem jargão técnico." },
  { name: "Furacão", icon: "🌀", cat: "Redes sociais", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Jornalista criativo e trendhunter de carrosséis: transforma uma ideia vaga num conceito — entrega 5 narrativas criativas e depois 5 headlines de capa em caixa alta, investigativas e provocativas. Prompt em prompts/furacao.md." },
  { name: "Brandão", icon: "🧵", cat: "Redes sociais", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Especialista em threads virais para X/Twitter: 9–10 slides com títulos-gancho, uma ideia por tweet, CTA final e planilha de apoio automática com hora e data de publicação. Prompt em prompts/brandao-gpt.md." },
  { name: "EstagiáriaGPT", icon: "📋", cat: "Escrita", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Estrutura qualquer conteúdo num carrossel de exatamente 13 blocos ('texto 1' a 'texto 13') com contagem rigorosa de palavras por bloco (±2), 100% pronto a copiar. Prompt em prompts/estagiaria-gpt.md." },
  { name: "MurtaGPT", icon: "✍️", cat: "Marketing", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Yuri, copywriter lendário de carrosséis virais: hook no slide 1, problema nos slides 2–5, solução nos 6–8 e CTA nos 9–10, com gatilhos mentais e parágrafos densos sem listas. Prompt em prompts/murta-gpt.md." },
  { name: "SupremoGPT", icon: "🧠", cat: "Engenharia", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Agente supremo de engenharia de prompts: diagnostica qualquer prompt com 100 perguntas estratégicas, atribui score de 0 a 100 e só otimiza quando pedires, com tabela comparativa antes/depois. Prompt em prompts/supremo-gpt.md." },
  { name: "FoundationsGPT", icon: "🎓", cat: "Educação", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Guia de fundamentos de prompts para IA generativa: seja específico, define papel e formato de saída, usa exemplos e tom/audiência, e itera com feedback. Resumo em prompts/foundations-gpt.md." },
  { name: "PromptPRO", icon: "📘", cat: "Engenharia", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Manual avançado de prompts eficazes: contexto, exemplos positivos e negativos, tamanho e formato de saída, 'pensar passo a passo' e dar um papel ao modelo. Resumo em prompts/prompt-pro.md." },
  { name: "Playbook234", icon: "📚", cat: "Pesquisa", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Catálogo com 234 prompts de exemplo por setor (marketing, vendas, código, educação...): copia, adapta e testa no teu caso de uso. Resumo em prompts/playbook234.md." },
  { name: "Iconoclasta", icon: "🗿", cat: "Consultoria", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Agente provocador de posicionamento (BrandsDecoded): não dá respostas prontas — provoca até encontrares um posicionamento que o mercado respeite. Ensaio interativo sobre o fim do marketing genérico. Resumo em prompts/iconoclasta.md." },
  { name: "Adaptador de Nicho", icon: "🎯", cat: "Escrita", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Agente 01 (BrandsDecoded): adapta qualquer texto ao vocabulário, tom e referências culturais do teu nicho e entrega um briefing estratégico de adaptação cultural. Resumo em prompts/adaptador-de-nicho.md." },
  { name: "Roteirista Reels", icon: "🎬", cat: "Vídeo", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Agente 02 (BrandsDecoded): transforma conteúdo num roteiro de Reels até 60s em 6 blocos (hook 0–5s, contexto, conflito, virada, concretização, encerramento), com o tema nomeado no hook. Resumo em prompts/roteirista-reels.md." },
  { name: "VisualPrompt Pro", icon: "🪄", cat: "Imagem", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Agente visual de impacto: gera artes prontas com IA a partir de comandos simples, com prompts testados por nicho e objetivo (social media, tráfego, vendas). Nota em prompts/visualprompt-pro.md." },
  { name: "Mestre dos Anúncios", icon: "📢", cat: "Comércio", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "GPT 'Mestre dos Anúncios Estáticos': cria anúncios estáticos otimizados para conversão. Link direto em prompts/mestre-dos-anuncios.md." },
  { name: "ContentMachine 3.0", icon: "⚙️", cat: "Redes sociais", author: "abdul19h", sold: "Novo", soldNum: 0, rating: 5.0, price: "Grátis", free: true, desc: "Acesso antecipado ao agente ContentMachine 3.0: máquina de produção de conteúdo em escala. Link direto em prompts/contentmachine-3.md." },
];

const AGENT_EXTRAS = {
  "ThumbForge": { prompt: "thumbforge.md" },
  "Fofinho": { prompt: "fofinho.md" },
  "Furacão": { prompt: "furacao.md" },
  "Brandão": { prompt: "brandao-gpt.md" },
  "EstagiáriaGPT": { prompt: "estagiaria-gpt.md" },
  "MurtaGPT": { prompt: "murta-gpt.md" },
  "SupremoGPT": { prompt: "supremo-gpt.md" },
  "FoundationsGPT": { prompt: "foundations-gpt.md" },
  "PromptPRO": { prompt: "prompt-pro.md" },
  "Playbook234": { prompt: "playbook234.md" },
  "Iconoclasta": { prompt: "iconoclasta.md" },
  "Adaptador de Nicho": { prompt: "adaptador-de-nicho.md" },
  "Roteirista Reels": { prompt: "roteirista-reels.md" },
  "VisualPrompt Pro": { prompt: "visualprompt-pro.md" },
  "Mestre dos Anúncios": { link: "https://chatgpt.com/g/g-67f977338fe48191b505e98f85633b2d-mestre-dos-anuncios-estaticos" },
  "ContentMachine 3.0": { link: "https://chatgpt.com/g/g-6884e69bc8408191922369dd40" },
};

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
        <span>${a.soldNum === 0 ? "🆕 novo" : `🛒 ${a.sold} vendidos`}</span>
        <span>⭐ ${a.rating.toFixed(1)}</span>
      </div>
      <div class="card-foot">
        <span class="cat-tag">${a.cat}</span>
        <span class="price${a.free ? " free" : ""}">${a.price}</span>
      </div>
    `;
    card.title = "Clica para abrir e testar o agente";
    card.addEventListener("click", () => openAgentModal(a));
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

/* ---------- Modal "testar agente" ---------- */

const backdrop = document.getElementById("modal-backdrop");
const modalContent = document.getElementById("modal-content");
let lastPromptText = "";

function openAgentModal(a) {
  const extra = AGENT_EXTRAS[a.name] || {};
  const stats = a.soldNum === 0 ? "🆕 novo" : `🛒 ${a.sold} vendidos`;
  let testSection;
  if (extra.link) {
    testSection = `
      <p>Este agente já está publicado online. Clica no botão para abrir diretamente:</p>
      <div class="modal-actions">
        <a class="btn primary small" href="${extra.link}" target="_blank" rel="noopener noreferrer">↗ Abrir agente online</a>
      </div>`;
  } else if (extra.prompt) {
    testSection = `
      <ol>
        <li>Clica em <strong>Copiar prompt</strong> abaixo.</li>
        <li>Vai a <strong>chatgpt.com → Criar um GPT → Configurar → Instructions</strong> (ou "Project instructions" no Claude) e cola lá.</li>
        <li>Guarda e envia um input de teste no chat.</li>
      </ol>
      <div class="modal-actions">
        <button class="btn primary small" id="copy-prompt" type="button">📋 Copiar prompt</button>
        <span class="hint-inline">Ficheiro: <code>prompts/${extra.prompt}</code></span>
      </div>
      <div class="prompt-box" id="prompt-box">A carregar prompt…</div>`;
  } else {
    testSection = `
      <p>Este é um agente de exemplo da listagem. Para testar um agente com prompt publicado, experimenta o
      <strong>Fofinho</strong>, o <strong>Brandão</strong>, o <strong>EstagiáriaGPT</strong> ou o <strong>ThumbForge</strong>.</p>`;
  }

  modalContent.innerHTML = `
    <div class="modal-head">
      <div class="modal-icon">${a.icon}</div>
      <div>
        <h3>${a.name}</h3>
        <div class="modal-meta">
          <span class="cat-tag">${a.cat}</span>
          <span>by: <strong>${a.author}</strong></span>
          <span>${stats}</span>
          <span>⭐ ${a.rating.toFixed(1)}</span>
          <span class="price${a.free ? " free" : ""}">${a.price}</span>
        </div>
      </div>
    </div>
    <p class="modal-desc">${a.desc}</p>
    <h4>🧪 Como testar</h4>
    <div class="howto">${testSection}</div>
  `;

  backdrop.hidden = false;
  document.body.style.overflow = "hidden";

  if (extra.prompt) loadPrompt(extra.prompt);
  const copyBtn = document.getElementById("copy-prompt");
  if (copyBtn) copyBtn.addEventListener("click", copyPrompt);
}

function closeAgentModal() {
  backdrop.hidden = true;
  document.body.style.overflow = "";
}

async function loadPrompt(file) {
  const box = document.getElementById("prompt-box");
  try {
    const res = await fetch(`prompts/${file}`);
    if (!res.ok) throw new Error(String(res.status));
    lastPromptText = await res.text();
    box.textContent = lastPromptText;
  } catch (e) {
    lastPromptText = "";
    box.textContent =
      `Não consegui carregar prompts/${file} (o fetch é bloqueado quando abres o index.html diretamente com duplo clique). ` +
      `Solução: serve a pasta com "python3 -m http.server 8000" ou usa o site no GitHub Pages; em alternativa copia o ficheiro prompts/${file} no repositório.`;
  }
}

function copyPrompt() {
  const btn = document.getElementById("copy-prompt");
  const done = () => {
    if (!btn) return;
    btn.textContent = "✅ Copiado!";
    setTimeout(() => { btn.textContent = "📋 Copiar prompt"; }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(lastPromptText).then(done).catch(() => fallbackCopy(done));
  } else {
    fallbackCopy(done);
  }
}

function fallbackCopy(done) {
  const ta = document.createElement("textarea");
  ta.value = lastPromptText;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) { /* sem clipboard */ }
  document.body.removeChild(ta);
  done();
}

document.getElementById("modal-close").addEventListener("click", closeAgentModal);
backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeAgentModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !backdrop.hidden) closeAgentModal(); });

renderChips();
renderAgents();
