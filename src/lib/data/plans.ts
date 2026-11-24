import { HousePlan, HouseType, RoomSpec } from '../types';

function grid(rows: (string | null)[][]): RoomSpec[] {
  const specs: RoomSpec[] = [];
  const nRows = rows.length;
  rows.forEach((row, y) => {
    const nCols = row.length;
    row.forEach((nome, x) => {
      if (!nome) return;
      specs.push({ nome, x: x / nCols, y: y / nRows, w: 1 / nCols, h: 1 / nRows });
    });
  });
  return specs;
}

export const HOUSE_PLANS: HousePlan[] = [
  {
    id: 'T1',
    nome: 'Casa T1',
    categoria: 'T1',
    quartos: 1,
    banhos: 1,
    area: 36,
    comprimento: 9,
    largura: 4,
    pisos: 1,
    descricao:
      'Casa económica de um quarto, ideal para casais ou pequenas famílias. Inclui sala, cozinha, casa de banho e quarto com área de serviço.',
    quartosSpec: grid([
      ['Sala', 'Quarto'],
      ['Cozinha', 'WC'],
    ]),
  },
  {
    id: 'T2',
    nome: 'Casa T2',
    categoria: 'T2',
    quartos: 2,
    banhos: 1,
    area: 54,
    comprimento: 9,
    largura: 6,
    pisos: 1,
    descricao:
      'Casa de dois quartos com sala ampla, cozinha funcional e casa de banho. Muito procurada para habitação própria e arrendamento.',
    quartosSpec: grid([
      ['Sala', 'Quarto 1', 'Quarto 2'],
      ['Cozinha', 'WC', 'Varanda'],
    ]),
  },
  {
    id: 'T3',
    nome: 'Casa T3',
    categoria: 'T3',
    quartos: 3,
    banhos: 2,
    area: 81,
    comprimento: 12,
    largura: 6.75,
    pisos: 1,
    descricao:
      'Casa de três quartos com duas casas de banho, incluindo suite, sala de estar e sala de jantar integradas e varanda.',
    quartosSpec: grid([
      ['Sala de estar', 'Suite', 'Quarto 2'],
      ['Cozinha', 'WC social', 'Quarto 3'],
      ['Jantar', 'WC suite', 'Varanda'],
    ]),
  },
  {
    id: 'T4',
    nome: 'Casa T4',
    categoria: 'T4',
    quartos: 4,
    banhos: 3,
    area: 120,
    comprimento: 12,
    largura: 10,
    pisos: 1,
    descricao:
      'Casa espaçosa de quatro quartos e três casas de banho, com duas salas, copa, cozinha e área de serviço.',
    quartosSpec: grid([
      ['Sala de estar', 'Suite', 'Quarto 2', 'Quarto 3'],
      ['Sala de jantar', 'Cozinha', 'WC social', 'Quarto 4'],
      ['Copa', 'WC suite', 'WC 2', 'Varanda'],
    ]),
  },
  {
    id: 'moderna',
    nome: 'Casa moderna',
    categoria: 'Casas modernas',
    quartos: 3,
    banhos: 2,
    area: 98,
    comprimento: 14,
    largura: 7,
    pisos: 1,
    descricao:
      'Projecto moderno com pé-direito alto, grandes janelas de alumínio e integração entre sala, cozinha e varanda gourmet.',
    quartosSpec: grid([
      ['Sala ampla', 'Suite', 'Quarto'],
      ['Cozinha gourmet', 'WC', 'Varanda'],
    ]),
  },
  {
    id: 'economica',
    nome: 'Casa económica',
    categoria: 'Casas económicas',
    quartos: 2,
    banhos: 1,
    area: 42,
    comprimento: 7,
    largura: 6,
    pisos: 1,
    descricao:
      'Casa económica de dois quartos com a melhor relação custo-benefício, usando bloco de 10 e cobertura de chapas.',
    quartosSpec: grid([
      ['Sala', 'Quarto 1'],
      ['Cozinha', 'Quarto 2'],
      ['WC', 'Área de serviço'],
    ]),
  },
  {
    id: 'dois-pisos',
    nome: 'Casa de dois pisos',
    categoria: 'Casas de dois pisos',
    quartos: 4,
    banhos: 3,
    area: 140,
    comprimento: 10,
    largura: 7,
    pisos: 2,
    descricao:
      'Moradia de dois pisos com três quartos no piso superior, sala, cozinha e WC social no rés-do-chão e laje intermédia.',
    quartosSpec: grid([
      ['Sala', 'Cozinha', 'WC'],
      ['Quarto 1', 'Quarto 2', 'Escada'],
    ]),
  },
];

export const PLAN_CATEGORIES = ['T1', 'T2', 'T3', 'T4', 'Casas modernas', 'Casas económicas', 'Casas de dois pisos'];

export const HOUSE_TYPES: { id: HouseType; nome: string; descricao: string }[] = [
  { id: 'T1', nome: 'Casa T1', descricao: '1 quarto · 1 WC · 36 m²' },
  { id: 'T2', nome: 'Casa T2', descricao: '2 quartos · 1 WC · 54 m²' },
  { id: 'T3', nome: 'Casa T3', descricao: '3 quartos · 2 WC · 81 m²' },
  { id: 'T4', nome: 'Casa T4', descricao: '4 quartos · 3 WC · 120 m²' },
  { id: 'personalizada', nome: 'Casa personalizada', descricao: 'Defina as suas dimensões' },
];
