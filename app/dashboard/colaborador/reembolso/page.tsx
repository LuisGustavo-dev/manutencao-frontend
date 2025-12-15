'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Plus, Upload, FileText, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReembolsoPage() {
  const [requests, setRequests] = useState([
    { id: 1, data: '10/12/2025', tipo: 'Combustível', valor: 'R$ 150,00', status: 'APROVADO' },
    { id: 2, data: '12/12/2025', tipo: 'Alimentação', valor: 'R$ 45,00', status: 'PENDENTE' },
  ]);

  const handleNewRequest = () => {
    toast.success("Solicitação enviada para aprovação!");
    // Lógica de adicionar ao estado seria aqui
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" /> Reembolsos e Despesas
          </h1>
          <p className="text-muted-foreground text-sm">Gerencie seus gastos de viagem.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Solicitação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Despesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Despesa</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="combustivel">Combustível</SelectItem>
                    <SelectItem value="alimentacao">Alimentação</SelectItem>
                    <SelectItem value="pedagio">Pedágio</SelectItem>
                    <SelectItem value="pecas">Peças/Materiais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Comprovante</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-xs">Clique para enviar foto</span>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleNewRequest}>Enviar Solicitação</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full"><DollarSign className="text-green-600 w-6 h-6" /></div>
            <div><p className="text-sm text-muted-foreground">Total Aprovado</p><h3 className="text-2xl font-bold">R$ 150,00</h3></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full"><Clock className="text-yellow-600 w-6 h-6" /></div>
            <div><p className="text-sm text-muted-foreground">Em Análise</p><h3 className="text-2xl font-bold">R$ 45,00</h3></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Histórico de Solicitações</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Comprovante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.data}</TableCell>
                  <TableCell>{req.tipo}</TableCell>
                  <TableCell className="font-medium">{req.valor}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${req.status === 'APROVADO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {req.status === 'APROVADO' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {req.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm"><FileText className="w-4 h-4" /></Button>
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