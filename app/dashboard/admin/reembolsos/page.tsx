'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, CheckCircle, XCircle, FileText, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReembolsosPage() {
  const [solicitacoes, setSolicitacoes] = useState([
    { id: 1, tecnico: 'Luis Gustavo', data: '10/12/2025', tipo: 'Combustível', valor: 150.00, status: 'PENDENTE' },
    { id: 2, tecnico: 'Ana Silva', data: '11/12/2025', tipo: 'Alimentação', valor: 45.90, status: 'PENDENTE' },
    { id: 3, tecnico: 'Carlos Souza', data: '09/12/2025', tipo: 'Peças', valor: 80.00, status: 'APROVADO' },
  ]);

  const handleAction = (id: number, action: 'APROVAR' | 'REJEITAR') => {
    setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status: action === 'APROVAR' ? 'APROVADO' : 'REJEITADO' } : s));
    toast.success(`Solicitação ${action === 'APROVAR' ? 'aprovada' : 'rejeitada'}!`);
  };

  const totalPendente = solicitacoes.filter(s => s.status === 'PENDENTE').reduce((acc, curr) => acc + curr.valor, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Reembolsos</h1>
          <p className="text-muted-foreground">Aprove ou rejeite despesas lançadas pelos colaboradores.</p>
        </div>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 py-3 flex items-center gap-4">
            <div className="p-2 bg-yellow-100 rounded-full text-yellow-700"><DollarSign className="w-5 h-5" /></div>
            <div>
              <p className="text-xs font-bold text-yellow-800 uppercase">Pendente de Aprovação</p>
              <p className="text-xl font-bold text-yellow-900">R$ {totalPendente.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Solicitações Recentes</CardTitle>
          <Button variant="outline" size="sm" className="gap-2"><Filter className="w-4 h-4" /> Filtrar</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Comprovante</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitacoes.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.data}</TableCell>
                  <TableCell className="font-medium">{s.tecnico}</TableCell>
                  <TableCell>{s.tipo}</TableCell>
                  <TableCell>R$ {s.valor.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="link" className="h-auto p-0 text-blue-600 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Ver
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      s.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-700' : 
                      s.status === 'APROVADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {s.status === 'PENDENTE' && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleAction(s.id, 'APROVAR')}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleAction(s.id, 'REJEITAR')}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}