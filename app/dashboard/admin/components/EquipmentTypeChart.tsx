'use client';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"; 
import type { ChartData } from '../page'; // <-- Importa o TIPO da página pai

// 1. Define a interface de props
interface EquipmentTypeChartProps {
  chartData: ChartData[];
}

// 2. Aceita as props
export function EquipmentTypeChart({ chartData }: EquipmentTypeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chamados por Tipo de Equipamento (Mês)</CardTitle>
        <CardDescription>Quais tipos de equipamento geram mais manutenção.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} // <-- 3. Usa a prop
            layout="vertical"
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#888888" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              width={80} 
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }} 
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} 
            />
            <Bar dataKey="os" name="Ordens de Serviço" fill="#2563eb" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}