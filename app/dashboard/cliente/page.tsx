'use client';

import { useEffect, useState } from 'react';
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
  CalendarClock,
  PlusCircle,
  ChevronRight,
  Loader2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
import { useAuth } from '@/app/contexts/authContext';

// --- INTERFACES ATUALIZADAS ---
interface DashboardData {
  equipamentos: {
    equipamentosDisponiveis: number;
    equipamentosEmManutencao: number;
  };
  chamados: Chamado[]; // Agora usa a nova estrutura
  tipos: MensalStats[];
  preventivas: Preventiva[];
}

// 1. ATUALIZADO CONFORME SEU JSON
interface Chamado {
  id_chamado: number;
  status: string;
  equipamentoId: number;
  modeloCompressor: string;
  // O JSON atual não tem 'tipo', então removi da interface obrigatória
}

interface MensalStats {
  month: string;
  corretivo: number;
  preventivo: number;
  operacional: number;
}

interface Preventiva {
  id: string | number;
  data: string; 
  equipamento: string;
  servico: string;
}

const monthTranslation: Record<string, string> = {
  'January': 'Jan', 'February': 'Fev', 'March': 'Mar', 'April': 'Abr',
  'May': 'Mai', 'June': 'Jun', 'July': 'Jul', 'August': 'Ago',
  'September': 'Set', 'October': 'Out', 'November': 'Nov', 'December': 'Dez'
};

export default function ClienteHomePage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth(); 

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3340/dashboard/usuario', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (!response.ok) throw new Error('Falha ao buscar dados');
        
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, token]);

  // 2. FUNÇÃO AJUSTADA PARA CASE INSENSITIVE (Ex: "Em andamento" vs "Em Andamento")
  const getStatusVariant = (status: string): "destructive" | "secondary" | "outline" => {
    const s = status.toLowerCase();
    if (s.includes('andamento')) return 'destructive';
    if (s.includes('pendente')) return 'secondary';
    if (s.includes('concluída') || s.includes('concluido')) return 'outline';
    return 'outline';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  if (!data) return <div className="p-4 text-center">Não foi possível carregar os dados.</div>;

  const saudeChartData = [
    { name: 'Online', value: data.equipamentos.equipamentosDisponiveis, fill: '#22c55e' }, 
    { name: 'Em Manutenção', value: data.equipamentos.equipamentosEmManutencao, fill: '#ef4444' },
  ];
  const totalEquipamentos = saudeChartData.reduce((acc, item) => acc + item.value, 0);

  const historicoChartData = [...data.tipos].reverse().map(item => ({
    name: monthTranslation[item.month] || item.month, 
    Corretivas: item.corretivo,
    Preventivas: item.preventivo,
    Operacional: item.operacional
  }));

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Portal do Cliente</h2>
          <p className="text-muted-foreground">
            Bem-vindo! Acompanhe a saúde dos seus equipamentos e gerencie seus chamados.
          </p>
        </div>
        <div>
          <Button 
            size="lg" 
            className="w-full md:w-auto"
            onClick={() => router.push('/dashboard/equipamentos')}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Abrir Chamado Corretivo
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1 */}
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
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                />
                <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-current">
                  {totalEquipamentos}
                </text>
                <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-muted-foreground">
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GRÁFICO 2 */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Intervenções</CardTitle>
            <CardDescription>Corretivas vs. Preventivas (Últimos 3 meses)</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicoChartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CHAMADOS EM ABERTO - ATUALIZADO */}
        <Card>
          <CardHeader>
            <CardTitle>Chamados em Aberto</CardTitle>
            <CardDescription>Suas solicitações que estão sendo tratadas.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.chamados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p>Nenhum chamado em aberto no momento.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    {/* Como não veio tipo no JSON, removi o cabeçalho "Tipo" ou podemos deixar fixo */}
                    <TableHead>ID</TableHead> 
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.chamados.map((os) => (
                    // 3. ATUALIZADO: key usa id_chamado e clique redireciona com id_chamado
                    <TableRow key={os.id_chamado} onClick={() => router.push(`/dashboard/ordens-servico-detalhe?id=${os.id_chamado}`)} className="cursor-pointer">
                      <TableCell className="font-medium">
                        {/* 4. ATUALIZADO: Usa modeloCompressor */}
                        <div>{os.modeloCompressor}</div>
                        <div className="text-xs text-muted-foreground">ID Equip: {os.equipamentoId}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-bold">#{os.id_chamado}</span>
                      </TableCell>
                      <TableCell>
                        {/* 5. ATUALIZADO: Usa status direto do JSON */}
                        <Badge variant={getStatusVariant(os.status)}>
                          {os.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            <Button variant="link" className="px-0 pt-4" asChild>
              <Link href="/dashboard/cliente/ordens-servico">Ver histórico completo &rarr;</Link>
            </Button>
          </CardContent>
        </Card>

        {/* PREVENTIVAS */}
        <Card>
          <CardHeader>
            <CardTitle>Preventivas Agendadas</CardTitle>
            <CardDescription>Estamos cuidando do seu equipamento antes que ele falhe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {(!data.preventivas || data.preventivas.length === 0) ? (
               <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                 <CalendarClock className="h-10 w-10 mb-2 opacity-20" />
                 <p>Nenhuma preventiva agendada para os próximos dias.</p>
               </div>
            ) : (
              data.preventivas.map((pv) => (
                <div key={pv.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-semibold">{pv.equipamento}</p>
                    <p className="text-sm text-muted-foreground">{pv.servico}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatDate(pv.data)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />
                </div>
              ))
            )}

            <Button variant="link" className="px-0 pt-2" asChild>
              <Link href="/dashboard/cliente/ordens-servico">Ver calendário completo &rarr;</Link>
            </Button>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}