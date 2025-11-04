'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/app/contexts/authContext"; // Importa o Auth

interface OsKpiCardsProps {
  pendentes: number;
  emAndamento: number;
  concluidas: number;
}

export function OsKpiCards({ pendentes, emAndamento, concluidas }: OsKpiCardsProps) {
  const { role } = useAuth();
  
  // Títulos dinâmicos
  const pendentesTitle = role === 'Admin' ? 'Pendentes (Equipe)' : 'Minhas OS Pendentes';
  const emAndamentoTitle = role === 'Admin' ? 'Em Andamento (Equipe)' : 'Minhas OS Ativas';

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{pendentesTitle}</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{pendentes}</div>
          <p className="text-xs text-muted-foreground">Aguardando sua ação</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{emAndamentoTitle}</CardTitle>
          <Wrench className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{emAndamento}</div>
          <p className="text-xs text-muted-foreground">Manutenções que você está executando</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídas (Mês)</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{concluidas}</div>
          <p className="text-xs text-muted-foreground">OS resolvidas por você (30 dias)</p>
        </CardContent>
      </Card>
    </div>
  );
}