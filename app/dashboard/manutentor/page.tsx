'use client';
// Importe os ícones que usaremos
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // <-- NOVO
import { 
  AlertTriangle, // Urgência
  Wrench,        // Em Andamento
  CalendarCheck, // Agendado
  Package,       // Equipamentos
  UserCheck,     // <-- NOVO (para feed)
  ClipboardPlus  // <-- NOVO (para feed)
} from "lucide-react";

// Imports do Gráfico (Recharts)
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

// --- NOSSOS DADOS MOCKADOS ---

// 1. Dados para os KPIs (Sem alteração)
const kpiData = [
  { title: "Corretivas Pendentes", value: "3", description: "Aguardando atribuição", icon: AlertTriangle, color: "text-destructive" },
  { title: "OS Em Andamento", value: "2", description: "Técnicos em campo", icon: Wrench, color: "text-blue-500" },
  { title: "Preventivas (Semana)", value: "5", description: "Agendadas para os próx. 7 dias", icon: CalendarCheck, color: "text-green-600" },
  { title: "Equipamentos Offline", value: "2", description: "Status 'Manutencao'", icon: Package, color: "text-gray-500" },
];

// 2. Dados para o Gráfico (Sem alteração)
const chartData = [
  { name: "Seg", abertas: 4, concluidas: 2 },
  { name: "Ter", abertas: 3, concluidas: 5 },
  // ... (etc)
  { name: "Sex", abertas: 1, concluidas: 3 },
  { name: "Sáb", abertas: 0, concluidas: 1 },
  { name: "Dom", abertas: 1, concluidas: 0 },
];

// 3. DADOS DA TABELA ATUALIZADOS (AGORA SÃO AS *SUAS* TAREFAS)
const minhasTarefasUrgentes = [
  {
    id: "OS-902",
    equipamento: "Câmara Fria Laticínios",
    tipo: "Corretiva",
    prioridade: "Alta",
    status: "Atribuída a você",
  },
  {
    id: "OS-904",
    equipamento: "Câmara Resfriados CR-002",
    tipo: "Corretiva",
    prioridade: "Média",
    status: "Atribuída a você",
  },
  {
    id: "OS-899",
    equipamento: "Máquina de Gelo MG-001",
    tipo: "Preventiva",
    prioridade: "Baixa",
    status: "Agendada para hoje",
  },
];

// 4. DADOS NOVOS: FEED DE ATIVIDADE
const atividadeRecente = [
  {
    id: 1,
    tecnico: "Cliente",
    avatar: "CL",
    acao: "abriu uma nova OS (Corretiva)",
    equipamento: "TCF-001 (Prioridade Alta)",
    tempo: "2m atrás",
    icon: ClipboardPlus,
    color: "text-destructive"
  },
  {
    id: 2,
    tecnico: "Você",
    avatar: "L", // (Iniciais do Luis)
    acao: "concluiu a OS-897",
    equipamento: "Câmara CR-001",
    tempo: "45m atrás",
    icon: UserCheck,
    color: "text-green-600"
  },
  {
    id: 3,
    tecnico: "Gerente",
    avatar: "G",
    acao: "atribuiu a OS-902 para você",
    equipamento: "Câmara Fria Laticínios",
    tempo: "1h atrás",
    icon: UserCheck,
    color: "text-blue-500"
  },
];

// --- O COMPONENTE ---

export default function ManutentorHomePage() {
  
  const getPrioridadeVariant = (prioridade: string): "destructive" | "secondary" | "outline" => {
    switch (prioridade) {
      case "Alta": return "destructive";
      case "Média": return "secondary";
      case "Baixa": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Visão Geral - Manutentor</h2>
      
      {/* 1. SEÇÃO DE CARDS KPI (Sem alteração) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. SEÇÃO DE GRÁFICO E TAREFAS (COM TABELA ATUALIZADA) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA DA ESQUERDA (GRÁFICO - Sem alteração) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fluxo de Ordens de Serviço (Equipe)</CardTitle>
            <CardDescription>Abertas vs. Concluídas (Últimos 7 dias)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* ... (Todo o seu código do BarChart) ... */}
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={30} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                <Legend iconType="circle" />
                <Bar dataKey="abertas" name="Abertas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="concluidas" name="Concluídas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* COLUNA DA DIREITA (TABELA ATUALIZADA PARA *SUAS* TAREFAS) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Minhas Tarefas Urgentes</CardTitle>
            <CardDescription>Suas OS atribuídas e agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Prio.</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {minhasTarefasUrgentes.map((os) => (
                  <TableRow key={os.id}>
                    <TableCell className="font-medium p-2">
                      <div className="font-medium">{os.equipamento}</div>
                      <div className="text-xs text-muted-foreground">{os.id} | {os.tipo}</div>
                      <div className="text-xs text-blue-500 font-semibold">{os.status}</div>
                    </TableCell>
                    <TableCell className="p-2">
                      <Badge variant={getPrioridadeVariant(os.prioridade)}>
                        {os.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right p-2">
                      <Button variant="outline" size="sm">Ver</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
      </div>

      {/* 3. NOVA SEÇÃO: FEED DE ATIVIDADE */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente da Equipe</CardTitle>
          <CardDescription>O que aconteceu nas últimas horas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {atividadeRecente.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback 
                  className={
                    item.tecnico === "Você" ? "bg-primary text-primary-foreground" : 
                    (item.tecnico === "Cliente" ? "bg-destructive text-destructive-foreground" : "")
                  }
                >
                  {item.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{item.tecnico}</span> {item.acao}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className={item.color}>
                    <item.icon className="h-3 w-3 inline-block mr-1" />
                  </span>
                  {item.equipamento}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {item.tempo}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
    </div>
  );
}