export type HouseType = 'T1' | 'T2' | 'T3' | 'T4' | 'personalizada';

export type AlvenariaType = 'bloco10' | 'bloco15' | 'tijolo';
export type EstruturaType = 'betaoArmado' | 'alvenariaPortante';
export type CoberturaType = 'laje' | 'chapas' | 'telhas';
export type PavimentoType = 'cimento' | 'ceramica';

export type StageId =
  | 'preparacao'
  | 'escavacao'
  | 'fundacao'
  | 'vigas-fundacao'
  | 'pilares-vigas'
  | 'alvenaria'
  | 'vergas'
  | 'lajes'
  | 'cobertura'
  | 'reboco'
  | 'pavimento'
  | 'hidraulica'
  | 'eletrica'
  | 'esquadrias'
  | 'pintura'
  | 'acabamentos';

export interface CalcInput {
  tipo: HouseType;
  comprimento: number;
  largura: number;
  quartos: number;
  banhos: number;
  sala: number;
  cozinha: number;
  alturaParedes: number;
  espessuraParedes: number;
  portas: number;
  janelas: number;
  pisos: number;
  alvenaria: AlvenariaType;
  estrutura: EstruturaType;
  cobertura: CoberturaType;
  pavimento: PavimentoType;
  etapas: StageId[];
}

export interface MaterialItem {
  material: string;
  quantidade: number;
  unidade: string;
  desperdicio: number;
  observacao: string;
}

export interface StageResult {
  id: StageId;
  titulo: string;
  descricao: string;
  itens: MaterialItem[];
}

export interface CalcResult {
  area: number;
  perimetro: number;
  areaParedes: number;
  etapas: StageResult[];
  resumo: MaterialItem[];
}

export interface MaterialPrice {
  nome: string;
  unidade: string;
  precoMT: number;
}

export interface BudgetLine {
  material: string;
  quantidade: number;
  unidade: string;
  precoUnit: number;
  total: number;
}

export interface Budget {
  linhas: BudgetLine[];
  transporte: number;
  total: number;
}

export interface SavedProject {
  id: string;
  nome: string;
  criadoEm: number;
  input: CalcInput;
  resultado: CalcResult;
  orcamento: Budget | null;
}

export interface Service {
  id: string;
  titulo: string;
  categoria: string;
  descricao: string;
  icon: string;
  destaques: string[];
  precoReferencia: string;
  whatsapp: string;
  rating: number;
  avaliacoes: number;
  disponivel?: boolean;
}

export interface Fornecedor {
  id: string;
  nome: string;
  tipo: string;
  bairro: string;
  cidade: string;
  telefone: string;
  whatsapp: string;
  nota: number;
}

export interface Obra {
  id: string;
  nome: string;
  local: string;
  cliente: string;
  iniciadoEm: number;
  etapasFeitas: StageId[];
}

export interface ObraConcluida {
  id: string;
  titulo: string;
  local: string;
  tipo: string;
  area: number;
  ano: number;
  icon: string;
  cor: string;
  descricao: string;
}

export interface ServiceRequest {
  id: string;
  servicoId: string;
  servicoTitulo: string;
  nome: string;
  contacto: string;
  localizacao: string;
  descricao: string;
  estado: 'Recebido' | 'Em análise' | 'Em preparação' | 'Orçamento enviado' | 'Aguardando resposta' | 'Concluído' | 'Cancelado';
  criadoEm: number;
}

export interface RoomSpec {
  nome: string;
  w: number;
  h: number;
  x: number;
  y: number;
}

export interface HousePlan {
  id: string;
  nome: string;
  categoria: string;
  quartos: number;
  banhos: number;
  area: number;
  comprimento: number;
  largura: number;
  pisos: number;
  descricao: string;
  quartosSpec: RoomSpec[];
}

export interface BudgetRequest {
  id: string;
  nome: string;
  contacto: string;
  localizacao: string;
  tipo: string;
  area: number;
  pisos: number;
  cobertura: string;
  descricao: string;
  estado: ServiceRequest['estado'];
  criadoEm: number;
}

export interface User {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  senhaHash: string;
  suspenso?: boolean;
  criadoEm: number;
}
