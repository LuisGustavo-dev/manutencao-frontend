'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, History, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock simples para exemplo
const mockPonto = [
  { dia: '15/12', entrada: '08:00', almocoS: '12:00', almocoV: '13:00', saida: '--:--', total: 'Em andamento' },
  { dia: '14/12', entrada: '--:--', almocoS: '--:--', almocoV: '--:--', saida: '--:--', total: 'Domingo' },
  { dia: '13/12', entrada: '08:05', almocoS: '12:10', almocoV: '13:10', saida: '18:00', total: '08:55' },
  { dia: '12/12', entrada: '07:55', almocoS: '12:00', almocoV: '13:00', saida: '17:55', total: '09:00' },
  { dia: '11/12', entrada: '08:00', almocoS: '12:00', almocoV: '13:00', saida: '18:00', total: '09:00' },
];

export default function HistoricoPontoPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-primary" /> Meu Histórico
          </h1>
          <p className="text-muted-foreground text-sm">Espelho de ponto mensal.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Baixar Relatório PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-xs font-bold uppercase text-primary">Saldo de Horas</p>
            <p className="text-2xl font-bold">+ 02:30h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs font-bold uppercase text-muted-foreground">Dias Trabalhados</p>
            <p className="text-2xl font-bold">12 / 22</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Dezembro / 2025</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead className="text-center">Entrada</TableHead>
                <TableHead className="text-center">Almoço (S)</TableHead>
                <TableHead className="text-center">Almoço (V)</TableHead>
                <TableHead className="text-center">Saída</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPonto.map((row, i) => (
                <TableRow key={i} className={row.total === 'Domingo' ? 'bg-muted/50' : ''}>
                  <TableCell className="font-medium">{row.dia}</TableCell>
                  <TableCell className="text-center">{row.entrada}</TableCell>
                  <TableCell className="text-center">{row.almocoS}</TableCell>
                  <TableCell className="text-center">{row.almocoV}</TableCell>
                  <TableCell className="text-center">{row.saida}</TableCell>
                  <TableCell className="text-right font-mono">
                    {row.total === 'Domingo' ? <span className="text-xs text-muted-foreground">Folga</span> : row.total}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-bold">Inconsistência no dia 05/12</p>
          <p>Você não registrou a saída. Entre em contato com o gestor para ajuste.</p>
        </div>
      </div>
    </div>
  );
}