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
  tipo:
    | "Tunel de congelamento"
    | "Camara de congelado"
    | "Camara de resfriado"
    | "Girofreezer"
    | "Maquina de gelo"
    | "Climatização";
  statusManutencao: "Disponível" | "Manutencao";
  modeloCompressor: string;
  tipoGas: string;
  tipoOleo: string;
  tensao: string;
  aplicacao: string;
  tipoCondensador: string;
  tipoEvaporador: string;
  tipoValvula: string;
};

export type OrdemServico = {
  id: string;
  equipamentoId: string;
  tipo: "Corretiva" | "Preventiva";
  status: "Pendente" | "Em Andamento" | "Concluída";
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
  role: "Cliente" | "Manutentor" | "Admin" | "Colaborador";
  clienteId: string | null;
  cnpj: string | null;
  razaoSocial: string | null;
};

export type TipoEventoPonto =
  | "CHEGADA"
  | "INICIO_ALMOCO"
  | "VOLTA_ALMOCO"
  | "SAIDA";

export type RegistroPonto = {
  id: string;
  usuarioId: string;
  data: string; // YYYY-MM-DD
  horarios: {
    chegada?: string;
    inicioAlmoco?: string;
    voltaAlmoco?: string;
    saida?: string;
  };
  statusDia: "ABERTO" | "FECHADO";
  horasTrabalhadas?: string; // Ex: "06:30"
};

export type RegistroServico = {
  id: string;
  usuarioId: string;
  data: string; // Para facilitar filtro
  clienteNome: string;
  horarioInicio: string;
  horarioFim?: string;
  atividade: string;
  status: "EM_ANDAMENTO" | "FINALIZADO";
};

// --- GERADOR DE DADOS MOCKADOS (Para ter volume) ---

const nomesTecnicos = [
  "Luis Gustavo",
  "Ana Silva",
  "Carlos Souza",
  "Roberto Firmino",
  "Fernanda Lima",
  "João Pedro",
  "Mariana Costa",
  "Paulo Ricardo",
  "Lucas Mendes",
  "Juliana Paes",
  "Marcos Viana",
  "Sofia Luz",
];

// 1. Gera Usuários
export const mockUsuariosExpandido = nomesTecnicos.map((nome, i) => ({
  id: `colab-${i + 1}`,
  email: `${nome.split(" ")[0].toLowerCase()}@mgr.com`,
  senha: "123",
  nome: nome,
  role: "Colaborador" as const, // Forçando o tipo
  clienteId: null,
  cnpj: null,
  razaoSocial: null,
}));

// 2. Gera Pontos para "HOJE" (Para a demo sempre funcionar)
const hoje = new Date().toISOString().split("T")[0];

export const mockPontosExpandido: RegistroPonto[] = mockUsuariosExpandido
  .map((u, i) => {
    // Simula alguns chegando tarde ou não vindo
    if (i === 10) return null; // Um faltou

    const atrasado = i % 4 === 0; // Alguns atrasados
    const horaChegada = atrasado ? `08:${30 + i}` : `07:${50 + i}`;

    return {
      id: `pt-${u.id}`,
      usuarioId: u.id,
      data: hoje,
      statusDia: "ABERTO",
      horarios: {
        chegada: horaChegada,
        inicioAlmoco: i < 5 ? "12:00" : undefined, // Alguns já saíram pro almoço
        voltaAlmoco: i < 3 ? "13:00" : undefined, // Alguns já voltaram
        saida: undefined,
      },
    };
  })
  .filter(Boolean) as RegistroPonto[];

// 3. Gera Serviços para esses pontos
export const mockServicosExpandido: RegistroServico[] = [];

mockPontosExpandido.forEach((ponto, i) => {
  // Serviço da manhã
  mockServicosExpandido.push({
    id: `srv-${ponto.id}-1`,
    usuarioId: ponto.usuarioId,
    data: hoje,
    clienteNome: i % 2 === 0 ? "Padaria Pão Quente" : "Mercado Central",
    horarioInicio: "09:00",
    horarioFim: "11:30",
    atividade: "Manutenção Preventiva - Ar Condicionado",
    status: "FINALIZADO",
  });

  // Serviço da tarde (apenas para quem já voltou do almoço)
  if (ponto.horarios.voltaAlmoco) {
    mockServicosExpandido.push({
      id: `srv-${ponto.id}-2`,
      usuarioId: ponto.usuarioId,
      data: hoje,
      clienteNome: "Sorveteria Gelato",
      horarioInicio: "13:30",
      atividade: "Troca de Gás",
      status: "EM_ANDAMENTO",
    });
  }
});

export const mockUsuarios: Usuario[] = [
  {
    id: "u1",
    email: "cliente@empresa.com",
    senha: "123",
    role: "Cliente",
    nome: "Cliente Exemplo (Padaria)", // <-- Mudei o nome para refletir o usuário
    clienteId: "cli-1",
    // --- ADICIONADO (para bater com o mockClientes['cli-1']) ---
    cnpj: "11.222.333/0001-44",
    razaoSocial: "Pão Quente Ltda.",
  },
  {
    id: "u2",
    email: "manutentor@grandtech.com",
    senha: "123",
    role: "Manutentor",
    nome: "Luis (Manutentor)",
    clienteId: null,
    // --- ADICIONADO ---
    cnpj: null,
    razaoSocial: null,
  },
  {
    id: "adm001",
    email: "admin@grandtech.com",
    senha: "123",
    role: "Admin",
    nome: "Admin (Super User)",
    clienteId: null,
    // --- ADICIONADO ---
    cnpj: null,
    razaoSocial: null,
  },
];

export const mockClientes: Cliente[] = [
  {
    id: "cli-1",
    nomeFantasia: "Padaria Pão Quente",
    razaoSocial: "Pão Quente Ltda.",
    cnpj: "11.222.333/0001-44",
  },
  {
    id: "cli-2",
    nomeFantasia: "Mercado Central",
    razaoSocial: "Mercadão Comércio Varejista",
    cnpj: "44.555.666/0001-77",
  },
  {
    id: "cli-3",
    nomeFantasia: "Sorveteria Gelato",
    razaoSocial: "Gelato & Cia",
    cnpj: "77.888.999/0001-00",
  },
];

export const mockTecnicos: Tecnico[] = [
  { id: "man001", nome: "Luis Gustavo" },
  { id: "man002", nome: "Ana Silva" },
  { id: "man003", nome: "Carlos Souza" },
];

export const mockEquipamentos: Equipamento[] = [
  {
    id: "tcf-001",
    clienteId: "cli-1",
    nome: "Túnel de Congelamento Principal",
    tipo: "Tunel de congelamento",
    statusManutencao: "Disponível",
    modeloCompressor: "Bitzer HSK-85",
    tipoGas: "R-404A",
    tipoOleo: "POE ISO 68",
    tensao: "380V",
    aplicacao: "Congelamento rápido de pães",
    tipoCondensador: "Remoto a Ar",
    tipoEvaporador: "Forçador de Teto",
    tipoValvula: "Eletrônica (Modelo X-32)",
  },
  {
    id: "cr-002",
    clienteId: "cli-2",
    nome: "Câmara Resfriados Laticínios",
    tipo: "Camara de resfriado",
    statusManutencao: "Manutencao",
    modeloCompressor: "Copeland ZB-45",
    tipoGas: "R-134a",
    tipoOleo: "PVE ISO 32",
    tensao: "220V",
    aplicacao: "Estocagem de laticínios 0-5°C",
    tipoCondensador: "Plug-in",
    tipoEvaporador: "Forçador de Parede",
    tipoValvula: "Mecânica (Orifício 04)",
  },
  {
    id: "mg-003",
    clienteId: null,
    nome: "Máquina de Gelo (Estoque)",
    tipo: "Maquina de gelo",
    statusManutencao: "Disponível",
    modeloCompressor: "Tecumseh-ABC",
    tipoGas: "R-410A",
    tipoOleo: "POE ISO 32",
    tensao: "220V",
    aplicacao: "Produção de Gelo",
    tipoCondensador: "Interno",
    tipoEvaporador: "Placa",
    tipoValvula: "Mecânica (Orifício 01)",
  },
];

export const mockOrdensServico: OrdemServico[] = [
  {
    id: "os-901",
    equipamentoId: "cr-002",
    tipo: "Corretiva",
    status: "Em Andamento",
    detalhes:
      "Cliente reportou via QR Code que o equipamento não está atingindo a temperatura. Fotos anexadas (simulado). Verificar possível vazamento de gás.",
    tecnicoId: "man001",
    clienteId: "cli-2",
    clienteNome: "Mercado Central",
    dataAbertura: "03/11/2025",
  },
  {
    id: "os-902",
    equipamentoId: "tcf-001",
    tipo: "Preventiva",
    status: "Pendente",
    detalhes:
      "Checklist Anual Agendado. Verificar superaquecimento, reaperto de painel e troca de filtros.",
    tecnicoId: null,
    clienteId: "cli-1",
    clienteNome: "Padaria Pão Quente",
    dataAbertura: "02/11/2025",
  },
  {
    id: "os-903",
    equipamentoId: "tcf-001",
    tipo: "Corretiva",
    status: "Pendente",
    detalhes: "Equipamento parou subitamente.",
    tecnicoId: null,
    clienteId: "cli-1",
    clienteNome: "Padaria Pão Quente",
    dataAbertura: "04/11/2025",
  },
];
