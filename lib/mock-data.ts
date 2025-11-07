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

export type Equipamento = {
  id: string;
  clienteId: string | null;
  nome: string;
  tipo: 'Tunel de congelamento' | 'Camara de congelado' | 'Camara de resfriado' | 'Girofreezer' | 'Maquina de gelo' | 'Climatização';
  statusManutencao: 'Disponível' | 'Manutencao';
  modeloCompressor: string;
  tipoGas: string;
  tipoOleo: string;
  tensao: string;
  aplicacao: string;
  tipoCondensador: string;
  tipoEvaporador: string;
  valvulaExpansao: string; 
};

export type OrdemServico = {
  id: string;
  equipamentoId: string;
  tipo: 'Corretiva' | 'Preventiva';
  status: 'Pendente' | 'Em Andamento' | 'Concluída';
  detalhes: string;
  tecnicoId?: string | null; 
  clienteId: string | null; 
  clienteNome: string; 
  dataAbertura: string; 
};

export type Usuario = {
  id: string;
  email: string;
  senha: string; 
  nome: string; 
  role: 'Cliente' | 'Manutentor' | 'Admin';
  clienteId: string | null;
  cnpj: string | null; 
  razaoSocial: string | null; 
};

// --- CORREÇÃO APLICADA ABAIXO ---
// Os campos 'cnpj' e 'razaoSocial' foram adicionados a todos os usuários
// para corresponder ao tipo 'Usuario' atualizado.

export const mockUsuarios: Usuario[] = [
  { 
    id: 'u1', 
    email: 'cliente@empresa.com', 
    senha: '123', 
    role: 'Cliente', 
    nome: 'Cliente Exemplo (Padaria)', // <-- Mudei o nome para refletir o usuário
    clienteId: 'cli-1', 
    // --- ADICIONADO (para bater com o mockClientes['cli-1']) ---
    cnpj: '11.222.333/0001-44',
    razaoSocial: 'Pão Quente Ltda.'
  },
  { 
    id: 'u2', 
    email: 'manutentor@grandtech.com', 
    senha: '123', 
    role: 'Manutentor', 
    nome: 'Luis (Manutentor)',
    clienteId: null,
    // --- ADICIONADO ---
    cnpj: null,
    razaoSocial: null
  },
  { 
    id: 'adm001', 
    email: 'admin@grandtech.com', 
    senha: '123', 
    role: 'Admin', 
    nome: 'Admin (Super User)',
    clienteId: null,
    // --- ADICIONADO ---
    cnpj: null,
    razaoSocial: null
  },
];
// --- FIM DA CORREÇÃO ---


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
    clienteId: 'cli-1', 
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
    clienteId: 'cli-2', 
    nome: 'Câmara Resfriados Laticínios',
    tipo: 'Camara de resfriado',
    statusManutencao: 'Manutencao',
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
    clienteId: null, 
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
    clienteId: 'cli-2', 
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
    clienteId: 'cli-1', 
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
    clienteId: 'cli-1', 
    clienteNome: 'Padaria Pão Quente',
    dataAbertura: '04/11/2025'
  },
];