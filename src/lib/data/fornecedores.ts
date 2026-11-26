import { Fornecedor } from '../types';

export const FORNECEDORES: Fornecedor[] = [
  { id: 'f1', nome: 'Cimentos de Moçambique — Loja Malhampsene', tipo: 'Cimento', bairro: 'Malhampsene', cidade: 'Maputo', telefone: '+258841000001', whatsapp: '+258841000001', nota: 4.6 },
  { id: 'f2', nome: 'BlocoBaixo — Fábrica e venda', tipo: 'Blocos', bairro: 'Matola', cidade: 'Matola', telefone: '+258841000002', whatsapp: '+258841000002', nota: 4.4 },
  { id: 'f3', nome: 'FerroMax', tipo: 'Ferro', bairro: 'Magoanine', cidade: 'Maputo', telefone: '+258841000003', whatsapp: '+258841000003', nota: 4.7 },
  { id: 'f4', nome: 'HidroMat', tipo: 'Hidráulica', bairro: 'Chamanculo', cidade: 'Maputo', telefone: '+258841000004', whatsapp: '+258841000004', nota: 4.3 },
  { id: 'f5', nome: 'Electricidade Lda', tipo: 'Elétrica', bairro: 'Maxaquene A', cidade: 'Maputo', telefone: '+258841000005', whatsapp: '+258841000005', nota: 4.5 },
  { id: 'f6', nome: 'Madeiras do Povo', tipo: 'Madeiras', bairro: 'Laulane', cidade: 'Maputo', telefone: '+258841000006', whatsapp: '+258841000006', nota: 4.2 },
  { id: 'f7', nome: 'TelhaForte', tipo: 'Cobertura', bairro: 'Zimpeto', cidade: 'Maputo', telefone: '+258841000007', whatsapp: '+258841000007', nota: 4.6 },
  { id: 'f8', nome: 'Cerâmica Maputo', tipo: 'Cerâmica', bairro: 'Sommerschield', cidade: 'Maputo', telefone: '+258841000008', whatsapp: '+258841000008', nota: 4.5 },
  { id: 'f9', nome: 'Tintas & Cores', tipo: 'Tintas', bairro: 'Polana', cidade: 'Maputo', telefone: '+258841000009', whatsapp: '+258841000009', nota: 4.1 },
  { id: 'f10', nome: 'Areias e Brita — Rio', tipo: 'Inertes', bairro: 'Khongolote', cidade: 'Matola', telefone: '+258841000010', whatsapp: '+258841000010', nota: 4.4 },
];

export const FORNECEDOR_TIPOS = ['Todos', ...Array.from(new Set(FORNECEDORES.map((f) => f.tipo)))];
