'use client';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
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
import Link from 'next/link';
import { 
  ClipboardList,
  PlusCircle,    // <--- Ícone para o novo botão
  CalendarClock,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation'; // <--- Importado para o botão

// Imports do Gráfico (Recharts)
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip,
  BarChart, 
  Bar,      
  XAxis,    
  YAxis,    
  Legend    
} from 'recharts';

// --- (Dados Mockados - Sem alteração) ---
const saudeChartData = [
  { name: 'Online', value: 8, fill: '#22c55e' }, 
  { name: 'Em Manutenção', value: 2, fill: '#ef4444' },
];
const totalEquipamentos = saudeChartData.reduce((acc, item) => acc + item.value, 0);
const historicoChartData = [
  { name: 'Ago', Corretivas: 4, Preventivas: 2, Operacional: 1 },
  { name: 'Set', Corretivas: 5, Preventivas: 2, Operacional: 3 },
  { name: 'Out', Corretivas: 2, Preventivas: 2, Operacional: 6 },
];
const chamadosRecentes = [
  { id: "OS-901", equipamento: "Câmara Resfriados CR-002", tipo: "Corretiva", status: "Em Andamento" },
  { id: "OS-903", equipamento: "Túnel Congelamento TCF-001", tipo: "Corretiva", status: "Pendente" },
  { id: "OS-900", equipamento: "Máquina de Gelo MG-001", tipo: "Preventiva", status: "Concluída" },
];
const preventivasAgendadas = [
  { id: "PV-101", data: "10/11/2025", equipamento: "Túnel Congelamento TCF-001", servico: "Troca de filtros e óleo" },
  { id: "PV-102", data: "12/11/2025", equipamento: "Câmara Resfriados CR-001", servico: "Reaperto de painel e verificação" },
];
// --- (Fim dos Dados Mockados) ---


export default function ClienteHomePage() {
  const router = useRouter(); // <--- Adicionado para o botão

  const getStatusVariant = (status: string): "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'Em Andamento': return 'destructive';
      case 'Pendente': return 'secondary';
      case 'Concluída': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SEÇÃO DE CABEÇALHO COM AÇÃO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Lado Esquerdo: Título e Descrição */}
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Portal do Cliente</h2>
          <p className="text-muted-foreground">
            Bem-vindo! Acompanhe a saúde dos seus equipamentos e gerencie seus chamados.
          </p>
        </div>
        
        {/* Lado Direito: Botão de Ação */}
        <div>
          <Button 
            size="lg" 
            className="w-full md:w-auto" // Responsivo
            onClick={() => router.push('/dashboard/equipamentos')}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Abrir Chamado Corretivo
          </Button>
        </div>
      </div>
      
      {/* 2. SEÇÃO DE GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: SAÚDE DOS EQUIPAMENTOS (DONUT) */}
        <Card>
          <CardHeader>
            <CardTitle>Saúde dos Equipamentos</CardTitle>
            <CardDescription>Status em tempo real do seu inventário.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={saudeChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80} 
                  outerRadius={110}
                  paddingAngle={5}
                  labelLine={false}
                >
                  {saudeChartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '0.5rem', 
                    border: '1px solid #e2e8f0' 
                  }}
                />
                <text 
                  x="50%" y="45%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="text-4xl font-bold fill-current"
                >
                  {totalEquipamentos}
                </text>
                <text 
                  x="50%" y="60%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="text-sm fill-muted-foreground"
                >
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GRÁFICO 2: HISTÓRICO DE INTERVENÇÕES (BARRAS) */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Intervenções</CardTitle>
            <CardDescription>Corretivas vs. Preventivas (Últimos 3 meses)</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicoChartData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '0.5rem', 
                    border: '1px solid #e2e8f0' 
                  }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Corretivas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Preventivas" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Operacional" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3. SEÇÃO DE LISTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* COLUNA DA ESQUERDA (CHAMADOS EM ABERTO) */}
        <Card>
          <CardHeader>
            <CardTitle>Chamados em Aberto</CardTitle>
            <CardDescription>Suas solicitações que estão sendo tratadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chamadosRecentes
                  .filter(os => os.status !== 'Concluída') 
                  .map((os) => (
                  <TableRow key={os.id} onClick={() => router.push(`/dashboard/ordens-servico-detalhe?id=${os.id}`)} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <div>{os.equipamento}</div>
                      <div className="text-xs text-muted-foreground">{os.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={os.tipo === 'Corretiva' ? 'destructive' : 'secondary'}>{os.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(os.status)}>
                        {os.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="link" className="px-0 pt-4" asChild>
              <Link href="/dashboard/cliente/ordens-servico">Ver histórico completo &rarr;</Link>
            </Button>
          </CardContent>
        </Card>

        {/* COLUNA DA DIREITA (PREVENTIVAS AGENDADAS) */}
        <Card>
          <CardHeader>
            <CardTitle>Preventivas Agendadas</CardTitle>
            <CardDescription>Estamos cuidando do seu equipamento antes que ele falhe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preventivasAgendadas.map((pv) => (
              <div key={pv.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold">{pv.equipamento}</p>
                  <p className="text-sm text-muted-foreground">{pv.servico}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{pv.data}</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />
              </div>
            ))}
             <Button variant="link" className="px-0 pt-2" asChild>
              <Link href="/dashboard/cliente/ordens-servico">Ver calendário completo &rarr;</Link>
            </Button>
          </CardContent>
        </Card>
        
      </div>

      {/* 4. SEÇÃO DE AÇÃO (REMOVIDA) */}
      {/* O card "Equipamento Parou?" foi removido pois o botão agora está no topo. */}

    </div>
  );
}