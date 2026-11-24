import { Service } from '../types';

export const WHATSAPP = '+258840000000';

export const SERVICES: Service[] = [
  {
    id: 'construcao-casas',
    titulo: 'Construção de casas',
    categoria: 'Construção',
    descricao:
      'Construção de moradias T1 a T4, anexos, ampliações e remodelações, desde a fundação até aos acabamentos finais.',
    icon: 'home',
    destaques: ['T1, T2, T3 e T4', 'Moradias completas', 'Anexos e ampliações', 'Remodelações'],
    precoReferencia: 'Sob consulta, conforme a área e o modelo',
    whatsapp: WHATSAPP,
    rating: 4.9,
    avaliacoes: 212,
  },
  {
    id: 'vigotas-abobadilhas',
    titulo: 'Fabrico de vigotas e abobadilhas',
    categoria: 'Pré-fabricados',
    descricao:
      'Fabrico, fornecimento e montagem de vigotas pré-fabricadas e abobadilhas para lajes de moradias e edifícios.',
    icon: 'layers',
    destaques: ['Fabrico próprio', 'Fornecimento ao domicílio', 'Montagem incluída', 'Medidas à medida da obra'],
    precoReferencia: 'Vigota a partir de MT 220,00; abobadilha a partir de MT 35,00',
    whatsapp: WHATSAPP,
    rating: 4.7,
    avaliacoes: 86,
  },
  {
    id: 'fornecimento-blocos',
    titulo: 'Fornecimento de blocos',
    categoria: 'Materiais',
    descricao:
      'Fornecimento de blocos de 10 e blocos de 15 para alvenaria, com entrega no local da obra em Maputo e arredores.',
    icon: 'cube',
    destaques: ['Blocos de 10', 'Blocos de 15', 'Entrega na obra', 'Preço por unidade'],
    precoReferencia: 'Bloco de 10: MT 45,00; bloco de 15: MT 55,00',
    whatsapp: WHATSAPP,
    rating: 4.6,
    avaliacoes: 154,
  },
  {
    id: 'criacao-plantas',
    titulo: 'Criação de plantas',
    categoria: 'Projectos',
    descricao:
      'Elaboração de plantas de casas T1 a T4 e projectos personalizados, adaptados ao terreno e às necessidades da família.',
    icon: 'pencil-ruler',
    destaques: ['Plantas T1 a T4', 'Projectos personalizados', 'Adaptação ao terreno', 'Compatíveis com a lei'],
    precoReferencia: 'Sob consulta, conforme a tipologia',
    whatsapp: WHATSAPP,
    rating: 4.8,
    avaliacoes: 97,
  },
  {
    id: 'servicos-orcamento',
    titulo: 'Serviços de orçamento',
    categoria: 'Orçamentos',
    descricao:
      'Quantificação de materiais, planilhas Excel, orçamentos de construção e estimativas de custos em Meticais.',
    icon: 'calculator',
    destaques: ['Quantificação de materiais', 'Planilhas Excel', 'Orçamentos de construção', 'Estimativas de custos'],
    precoReferencia: 'Consulta gratuita pelo WhatsApp',
    whatsapp: WHATSAPP,
    rating: 4.9,
    avaliacoes: 178,
  },
];

export const SERVICE_CATEGORIES = ['Construção', 'Pré-fabricados', 'Materiais', 'Projectos', 'Orçamentos'];
