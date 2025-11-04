// --- 1. NOVOS TIPOS ---
export type Cliente = {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
};

export type Tecnico = {
  id: string;
  nome: string;
};

// --- 2. TIPOS ATUALIZADOS ---
export type Equipamento = {
  id: string;
  clienteId: string | null; // <-- CAMPO DE VÍNCULO
  nome: string;
  tipo: 'Tunel de congelamento' | 'Camara de congelado' | 'Camara de resfriado' | 'Girofreezer' | 'Maquina de gelo' | 'Climatização';
  statusManutencao: 'Disponível' | 'EmManutencao';
  // Detalhes da aba "Climatização"
  modeloCompressor: string;
  tipoGas: string;
  tipoOleo: string;
  tensao: string;
  aplicacao: string;
  tipoCondensador: string;
  tipoEvaporador: string;
  valvulaExpansao: string; // Simplificado para a demo
};

export type OrdemServico = {
  id: string;
  equipamentoId: string;
  tipo: 'Corretiva' | 'Preventiva';
  status: 'Pendente' | 'Em Andamento' | 'Concluída';
  detalhes: string;
  tecnicoId?: string | null; // <-- NOVO CAMPO
  clienteNome: string; // <-- NOVO CAMPO (simulado)
  dataAbertura: string; // <-- NOVO CAMPO (simulado)
};

export type Usuario = {
  id: string;
  email: string;
  senha: string; 
  nome: string; // <-- ADICIONADO
  role: 'Cliente' | 'Manutentor' | 'Admin'; // <-- ADICIONADO 'Admin'
};

// --- 3. MOCKS ATUALIZADOS ---

export const mockUsuarios: Usuario[] = [
  { 
    id: 'u1', 
    email: 'cliente@empresa.com', 
    senha: '123', 
    role: 'Cliente', 
    nome: 'Cliente Exemplo' 
  },
  { 
    id: 'u2', 
    email: 'manutentor@grandtech.com', 
    senha: '123', 
    role: 'Manutentor', 
    nome: 'Luis (Manutentor)' 
  },
  { 
    id: 'adm001', 
    email: 'admin@grandtech.com', 
    senha: '123', 
    role: 'Admin', 
    nome: 'Admin (Super User)' 
  },
];

export const mockClientes: Cliente[] = [
  { id: 'cli-1', nomeFantasia: 'Padaria Pão Quente', razaoSocial: 'Pão Quente Ltda.', cnpj: '11.222.333/0001-44' },
  { id: 'cli-2', nomeFantasia: 'Mercado Central', razaoSocial: 'Mercadão Comércio Varejista', cnpj: '44.555.666/0001-77' },
  { id: 'cli-3', nomeFantasia: 'Sorveteria Gelato', razaoSocial: 'Gelato & Cia', cnpj: '77.888.999/0001-00' },
];

export const mockTecnicos: Tecnico[] = [
  { id: 'man001', nome: 'Luis Gustavo' },
  { id: 'man002', nome: 'Ana Silva' },
  { id: 'man003', nome: 'Carlos Souza' },
];

export const mockEquipamentos: Equipamento[] = [
  {
    id: 'tcf-001',
    clienteId: 'cli-1', // VINCULADO
    nome: 'Túnel de Congelamento Principal',
    tipo: 'Tunel de congelamento',
    statusManutencao: 'Disponível',
    modeloCompressor: 'Bitzer HSK-85',
    tipoGas: 'R-404A',
    tipoOleo: 'POE ISO 68',
    tensao: '380V',
    aplicacao: 'Congelamento rápido de pães',
    tipoCondensador: 'Remoto a Ar',
    tipoEvaporador: 'Forçador de Teto',
    valvulaExpansao: 'Eletrônica (Modelo X-32)',
  },
  {
    id: 'cr-002',
    clienteId: 'cli-2', // VINCULADO
    nome: 'Câmara Resfriados Laticínios',
    tipo: 'Camara de resfriado',
    statusManutencao: 'EmManutencao',
    modeloCompressor: 'Copeland ZB-45',
    tipoGas: 'R-134a',
    tipoOleo: 'PVE ISO 32',
    tensao: '220V',
    aplicacao: 'Estocagem de laticínios 0-5°C',
    tipoCondensador: 'Plug-in',
    tipoEvaporador: 'Forçador de Parede',
    valvulaExpansao: 'Mecânica (Orifício 04)',
  },
  {
    id: 'mg-003',
    clienteId: null, // NÃO VINCULADO
    nome: 'Máquina de Gelo (Estoque)',
    tipo: 'Maquina de gelo',
    statusManutencao: 'Disponível',
    modeloCompressor: 'Tecumseh-ABC',
    tipoGas: 'R-410A',
    tipoOleo: 'POE ISO 32',
    tensao: '220V',
    aplicacao: 'Produção de Gelo',
    tipoCondensador: 'Interno',
    tipoEvaporador: 'Placa',
    valvulaExpansao: 'Mecânica (Orifício 01)',
  }
];

export const mockOrdensServico: OrdemServico[] = [
  {
    id: 'os-901',
    equipamentoId: 'cr-002',
    tipo: 'Corretiva',
    status: 'Em Andamento',
    detalhes: 'Cliente reportou via QR Code que o equipamento não está atingindo a temperatura. Fotos anexadas (simulado). Verificar possível vazamento de gás.',
    tecnicoId: 'man001', 
    clienteNome: 'Mercado Central',
    dataAbertura: '03/11/2025'
  },
  {
    id: 'os-902',
    equipamentoId: 'tcf-001',
    tipo: 'Preventiva',
    status: 'Pendente',
    detalhes: 'Checklist Anual Agendado. Verificar superaquecimento, reaperto de painel e troca de filtros.',
    tecnicoId: null, 
    clienteNome: 'Padaria Pão Quente',
    dataAbertura: '02/11/2025'
  },
  {
    id: 'os-903',
    equipamentoId: 'tcf-001',
    tipo: 'Corretiva',
    status: 'Pendente',
    detalhes: 'Equipamento parou subitamente.',
    tecnicoId: null, 
    clienteNome: 'Padaria Pão Quente',
    dataAbertura: '04/11/2025'
  },
];