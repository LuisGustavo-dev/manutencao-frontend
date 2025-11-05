'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Kpi } from '../page'; // <-- Importa o TIPO da página pai

// 1. Define a interface de props
interface AdminKpiCardsProps {
  kpiData: Kpi[]; 
}

// 2. Aceita as props
export function AdminKpiCards({ kpiData }: AdminKpiCardsProps) {
  // 3. Remove a importação do mock de dentro do componente
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 4. Usa a prop 'kpiData' */}
      {kpiData.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            {/* O ícone precisa ser renderizado como um componente */}
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}