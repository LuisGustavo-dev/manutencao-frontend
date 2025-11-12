'use client';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
// 1. Importações atualizadas para BarChart e Bar
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { ChartData } from '../page'; // <-- Importa o TIPO da página pai

// Define a interface de props
interface OsTrendChartProps {
  chartData: ChartData[];
}

// Aceita as props
export function OsTrendChart({ chartData }: OsTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de OS (Últimos 6 Meses)</CardTitle>
        <CardDescription>Corretivas (Problemas) vs. Preventivas (Contratos)</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {/* 2. Trocado LineChart por BarChart */}
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={30} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
            <Legend iconType="circle" />
            
            {/* --- ATUALIZADO --- */}
            {/* Adicionado 'name' para a legenda e a nova barra 'Operacional' */}
            <Bar dataKey="Corretivas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Corretivas" />
            <Bar dataKey="Preventivas" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Preventivas" />
            <Bar dataKey="Operacional" fill="#f97316" radius={[4, 4, 0, 0]} name="Operacional" />
            {/* --- FIM DA ATUALIZAÇÃO --- */}
            
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}