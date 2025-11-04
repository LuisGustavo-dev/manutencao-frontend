'use client';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardDescription, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // <-- NOVO
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // <-- NOVO
import { 
  Users, 
  Wrench, 
  Package,
  Building,
  UserCheck // <-- NOVO
} from "lucide-react";
import Link from "next/link";
// Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer já estão no seu
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

// --- DADOS MOCKADOS ATUALIZADOS ---

// 1. KPIs (Os mesmos, estão ótimos)
const kpiData = [
  { title: "Total de Usuários", value: "8", icon: Users, color: "text-blue-500" },
  { title: "Total de Clientes", value: "3", icon: Building, color: "text-green-600" },
  { title: "Total de Equipamentos", value: "42", icon: Package, color: "text-gray-500" },
  { title: "Total de OS (Mês)", value: "58", icon: Wrench, color: "text-destructive" },
];

// 2. Gráfico 1: Atividade por Cliente (O seu gráfico)
const clientChartData = [
  { name: 'Cliente A', os: 22 },
  { name: 'Cliente B', os: 18 },
  { name: 'Cliente C', os: 18 },
];

// 3. NOVO Gráfico 2: Tendência de OS (Corretiva vs. Preventiva)
const osTrendData = [
  { name: 'Ago', Corretivas: 30, Preventivas: 15 },
  { name: 'Set', Corretivas: 25, Preventivas: 20 },
  { name: 'Out', Corretivas: 18, Preventivas: 25 },
];

// 4. NOVOS Dados Tabela 1: Atividade dos Manutentores
const technicianData = [
  { id: 'man001', nome: 'Luis Gustavo', avatar: 'LG', concluidas: 28, taxa: "95%" },
  { id: 'man002', nome: 'Ana Silva', avatar: 'AS', concluidas: 22, taxa: "92%" },
  { id: 'man003', nome: 'Carlos Souza', avatar: 'CS', concluidas: 15, taxa: "88%" },
];

// 5. NOVOS Dados Tabela 2: Pendências do Sistema
const systemFeedData = [
  { id: 'u-new-1', descricao: 'novo_tecnico@grandtech.com', tipo: 'Novo Usuário', prioridade: "Média" },
  { id: 'c-new-1', descricao: 'Padaria Pão Quente', tipo: 'Novo Cliente', prioridade: "Alta" },
  { id: 'os-p-1', descricao: 'OS-901 (Cliente A)', tipo: 'OS não atribuída', prioridade: "Alta" },
];

// --- O COMPONENTE ---

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO (Sem alteração) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Painel do Administrador</h2>
          <p className="text-muted-foreground">
            Gerenciamento geral do sistema e usuários.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/usuarios"><Users className="mr-2 h-4 w-4" /> Gerenciar Usuários</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/clientes"><Building className="mr-2 h-4 w-4" /> Gerenciar Clientes</Link>
          </Button>
        </div>
      </div>

      {/* 2. KPIs (Sem alteração) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. NOVA SEÇÃO DE GRÁFICOS (Lado a Lado) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: Atividade por Cliente (O seu) */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade por Cliente (Mês)</CardTitle>
            <CardDescription>Volume de OS abertas por cliente.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientChartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={30} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="os" name="Ordens de Serviço" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GRÁFICO 2: Tendência Corretiva vs. Preventiva (NOVO) */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de OS (Trimestre)</CardTitle>
            <CardDescription>Corretivas (Problemas) vs. Preventivas (Contratos)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {/* Gráfico de Barras Empilhadas */}
              <BarChart data={osTrendData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={30} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Corretivas" stackId="a" name="Corretivas" fill="#ef4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Preventivas" stackId="a" name="Preventivas" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 4. NOVA SEÇÃO DE TABELAS (Lado a Lado) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* TABELA 1: Atividade dos Manutentores (NOVO) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Atividade dos Manutentores (Mês)</CardTitle>
            <CardDescription>Ranking de performance da equipe técnica.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manutentor</TableHead>
                  <TableHead>OS Concluídas</TableHead>
                  <TableHead>Taxa de Sucesso</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicianData.map((tech) => (
                  <TableRow key={tech.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10">{tech.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{tech.nome}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-lg font-semibold">{tech.concluidas}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-lg font-semibold text-green-600">{tech.taxa}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Ver Perfil</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* TABELA 2: Pendências do Sistema (NOVO) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pendências do Sistema</CardTitle>
            <CardDescription>Ações que requerem sua atenção.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemFeedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.tipo}</div>
                      <div className="text-sm text-muted-foreground">{item.descricao}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant={item.prioridade === 'Alta' ? 'destructive' : 'outline'} size="sm">
                        Resolver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}