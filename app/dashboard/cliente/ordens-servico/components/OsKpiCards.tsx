'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, AlertTriangle, CheckCircle } from "lucide-react";

interface OsKpiCardsProps {
  pendentes: number;
  emAndamento: number;
  concluidas: number;
}

export function OsKpiCards({ pendentes, emAndamento, concluidas }: OsKpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Meus Chamados Pendentes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{pendentes}</div>
          <p className="text-xs text-muted-foreground">Aguardando início</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          <Wrench className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{emAndamento}</div>
          <p className="text-xs text-muted-foreground">Equipamentos em manutenção</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídos (Mês)</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{concluidas}</div>
          <p className="text-xs text-muted-foreground">Chamados resolvidos recentemente</p>
        </CardContent>
      </Card>
    </div>
  );
}