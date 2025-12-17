'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // 1. IMPORTAR ROUTER
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
import { 
  AlertTriangle,
  Wrench,
  CalendarCheck,
  Package,
  Loader2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useAuth } from "@/app/contexts/authContext";

// --- TIPAGEM DA API ---

interface ApiChartData {
  date: string;
  finalizados: number;
  pendentes: number;
}

// Interface para a Lista de Tarefas (Table)
interface ApiOrderService {
  id: number;
  tipo: string;
  status: string;
  horaAbertura: string;
  modeloCompressor: string;
  name?: string; 
  equipamentoId: number; // 2. ADICIONADO CAMPOS PARA EVITAR ERRO DE TS
}

interface ApiResponse {
  tecnico: ApiChartData[];
  orderServiço: ApiOrderService[];
}

export default function ManutentorHomePage() {
  const { token } = useAuth(); 
  const router = useRouter(); // 3. INICIALIZAR O ROUTER
  
  // --- ESTADOS ---
  const [chartData, setChartData] = useState<any[]>([]);
  const [tarefas, setTarefas] = useState<ApiOrderService[]>([]);
  const [kpis, setKpis] = useState({
    pendentes: 0,
    emAndamento: 0,
    finalizadosSemana: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- BUSCA DE DADOS ---
  useEffect(() => {
    async function fetchData() {
      if (!token) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch('http://localhost:3340/dashboard/tecnico', { 
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        // 1. Transformar dados para o Gráfico
        const formattedChartData = data.tecnico.map((item) => {
            const dateObj = new Date(item.date);
            const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
            const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);
            
            const dayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(adjustedDate);
            
            return {
                name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
                abertas: item.pendentes,
                concluidas: item.finalizados,
            };
        });

        // 2. Calcular KPIs
        const totalPendentes = data.tecnico.reduce((acc, curr) => acc + curr.pendentes, 0);
        const totalFinalizados = data.tecnico.reduce((acc, curr) => acc + curr.finalizados, 0);
        const totalEmAndamento = data.orderServiço.filter(os => os.status === "Em andamento").length;

        // 3. Atualizar Estados
        setChartData(formattedChartData);
        setTarefas(data.orderServiço);
        
        setKpis({
            pendentes: totalPendentes,
            emAndamento: totalEmAndamento,
            finalizadosSemana: totalFinalizados
        });

      } catch (err: any) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar os dados do dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [token]);

  // --- HELPERS VISUAIS ---

  const getPrioridadeVariant = (tipo: string): "destructive" | "secondary" | "outline" => {
    if (tipo === "Corretivo") return "destructive";
    return "outline"; 
  };

  const getPrioridadeLabel = (tipo: string) => {
      return tipo === "Corretivo" ? "Alta" : "Normal";
  }

  // --- RENDERIZAÇÃO ---

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando dashboard...</span>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex h-64 w-full items-center justify-center text-destructive">
            <AlertTriangle className="mr-2 h-6 w-6" />
            <span>{error}</span>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Visão Geral - Manutentor</h2>
      
      {/* SEÇÃO KPI (Omitido para brevidade, mantém igual ao seu código original) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes (Semana)</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{kpis.pendentes}</div>
                <p className="text-xs text-muted-foreground">Novas solicitações</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">OS Em Andamento</CardTitle>
                <Wrench className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{kpis.emAndamento}</div>
                <p className="text-xs text-muted-foreground">Na sua lista atual</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Finalizadas (Semana)</CardTitle>
                <CalendarCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{kpis.finalizadosSemana}</div>
                <p className="text-xs text-muted-foreground">Concluídas com sucesso</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipamentos Offline</CardTitle>
                <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Dado não disponível</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fluxo de Ordens de Serviço</CardTitle>
            <CardDescription>Pendentes vs. Finalizadas (Últimos 7 dias)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                <Legend iconType="circle" />
                <Bar dataKey="abertas" name="Pendentes" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="concluidas" name="Finalizadas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* TABELA DE TAREFAS */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Minhas Tarefas</CardTitle>
            <CardDescription>
                OS atribuídas
            </CardDescription>
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
                {tarefas.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                            Nenhuma tarefa encontrada.
                        </TableCell>
                    </TableRow>
                ) : (
                    tarefas.map((os) => (
                    <TableRow key={os.id}>
                        <TableCell className="font-medium p-2">
                        <div className="font-medium">{os.modeloCompressor}</div>
                        <div className="text-xs text-muted-foreground">OS-{os.id}</div>
                        <div className="text-xs text-blue-500 font-semibold">{os.status}</div>
                        </TableCell>
                        <TableCell className="p-2">
                        <Badge variant={getPrioridadeVariant(os.tipo)}>
                            {getPrioridadeLabel(os.tipo)}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right p-2">
                        
                        {/* 4. BOTÃO ATUALIZADO COM NAVEGAÇÃO */}
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/equipamento/?id=${os.equipamentoId}`)}
                        >
                            Ver
                        </Button>
                        
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}