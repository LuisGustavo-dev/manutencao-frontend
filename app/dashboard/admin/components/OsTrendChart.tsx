'use client';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"; 
import type { ChartData } from '../page'; // <-- Importa o TIPO da página pai

// 1. Define a interface de props
interface OsTrendChartProps {
  chartData: ChartData[];
}

// 2. Aceita as props
export function OsTrendChart({ chartData }: OsTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de OS (Últimos 6 Meses)</CardTitle>
        <CardDescription>Corretivas (Problemas) vs. Preventivas (Contratos)</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={30} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
            <Legend iconType="circle" />
            <Line type="monotone" dataKey="Corretivas" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Preventivas" stroke="#60a5fa" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}