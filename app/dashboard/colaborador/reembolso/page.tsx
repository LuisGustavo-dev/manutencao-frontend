'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DollarSign, Plus, Upload, FileText, CheckCircle, Clock, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

// Tipo para os dados
interface ReembolsoRequest {
  id: number;
  data: string;
  tipo: string;
  valor: string; // Armazenado como string formatada para facilitar o mock
  valorNumerico: number; // Para somar nos KPIs
  status: 'APROVADO' | 'PENDENTE' | 'REJEITADO';
  comprovante?: string;
}

export default function ReembolsoPage() {
  // Estado da Lista de Pedidos
  const [requests, setRequests] = useState<ReembolsoRequest[]>([
    { id: 1, data: '10/12/2025', tipo: 'Combustível', valor: 'R$ 150,00', valorNumerico: 150, status: 'APROVADO' },
    { id: 2, data: '12/12/2025', tipo: 'Alimentação', valor: 'R$ 45,00', valorNumerico: 45, status: 'PENDENTE' },
  ]);

  // Estados do Formulário
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tipoDespesa, setTipoDespesa] = useState('');
  const [valorInput, setValorInput] = useState('');
  const [comprovante, setComprovante] = useState<File | null>(null);

  // --- CÁLCULOS (KPIs) ---
  const totalAprovado = requests
    .filter(r => r.status === 'APROVADO')
    .reduce((acc, curr) => acc + curr.valorNumerico, 0);

  const totalPendente = requests
    .filter(r => r.status === 'PENDENTE')
    .reduce((acc, curr) => acc + curr.valorNumerico, 0);

  // --- AÇÕES ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComprovante(e.target.files[0]);
      toast.success("Comprovante anexado!");
    }
  };

  const handleNewRequest = () => {
    if (!tipoDespesa || !valorInput) {
      toast.error("Preencha o tipo e o valor da despesa.");
      return;
    }

    if (!comprovante) {
      toast.error("É obrigatório anexar o comprovante.");
      return;
    }

    const valorNumerico = parseFloat(valorInput.replace(',', '.'));
    const novoId = Math.max(...requests.map(r => r.id), 0) + 1;
    const hoje = new Date().toLocaleDateString('pt-BR');

    const novoPedido: ReembolsoRequest = {
      id: novoId,
      data: hoje,
      tipo: tipoDespesa.charAt(0).toUpperCase() + tipoDespesa.slice(1), // Capitalizar
      valor: `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`,
      valorNumerico: valorNumerico,
      status: 'PENDENTE',
      comprovante: comprovante.name
    };

    setRequests([novoPedido, ...requests]);
    
    // Resetar e Fechar
    setTipoDespesa('');
    setValorInput('');
    setComprovante(null);
    setIsDialogOpen(false);
    
    toast.success("Solicitação enviada para aprovação!");
  };

  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" /> Reembolsos e Despesas
          </h1>
          <p className="text-muted-foreground text-sm">Gerencie seus gastos de viagem para ressarcimento.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Registrar Despesa</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              
              {/* Seleção de Tipo */}
              <div className="space-y-2">
                <Label>Tipo de Despesa</Label>
                <Select value={tipoDespesa} onValueChange={setTipoDespesa}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="combustivel">Combustível</SelectItem>
                    <SelectItem value="alimentacao">Alimentação</SelectItem>
                    <SelectItem value="pedagio">Pedágio</SelectItem>
                    <SelectItem value="estacionamento">Estacionamento</SelectItem>
                    <SelectItem value="pecas">Peças/Materiais (Emergência)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Input de Valor */}
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                    <Input 
                        type="number" 
                        placeholder="0,00" 
                        className="pl-9"
                        step="0.01"
                        value={valorInput}
                        onChange={(e) => setValorInput(e.target.value)}
                    />
                </div>
              </div>

              {/* Upload de Comprovante */}
              <div className="space-y-2">
                <Label>Comprovante (Foto/PDF)</Label>
                <div 
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors relative ${
                        comprovante ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50 border-muted-foreground/25'
                    }`}
                >
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  
                  {comprovante ? (
                      <div className="text-center">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-green-700 truncate max-w-[200px]">{comprovante.name}</p>
                          <p className="text-xs text-green-600">Clique para alterar</p>
                      </div>
                  ) : (
                      <div className="text-center text-muted-foreground">
                          <Upload className="w-8 h-8 mb-2 mx-auto opacity-50" />
                          <span className="text-sm font-medium">Clique para enviar foto</span>
                          <p className="text-xs opacity-70 mt-1">JPG, PNG ou PDF</p>
                      </div>
                  )}
                </div>
              </div>

            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleNewRequest} disabled={!tipoDespesa || !valorInput || !comprovante}>
                    Enviar Solicitação
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600"><DollarSign className="w-6 h-6" /></div>
            <div>
                <p className="text-sm text-muted-foreground font-medium">Total Recebido</p>
                <h3 className="text-2xl font-bold text-foreground">R$ {totalAprovado.toFixed(2).replace('.', ',')}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600"><Clock className="w-6 h-6" /></div>
            <div>
                <p className="text-sm text-muted-foreground font-medium">Em Análise</p>
                <h3 className="text-2xl font-bold text-foreground">R$ {totalPendente.toFixed(2).replace('.', ',')}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABELA DE HISTÓRICO */}
      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-lg">Histórico de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium text-muted-foreground">{req.data}</TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                          <span className="p-1 bg-muted rounded">
                            {req.tipo === 'Combustível' ? '⛽' : req.tipo === 'Alimentação' ? '🍔' : '📄'}
                          </span>
                          {req.tipo}
                      </div>
                  </TableCell>
                  <TableCell className="font-bold">{req.valor}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        req.status === 'APROVADO' ? 'bg-green-50 text-green-700 border-green-200' : 
                        req.status === 'REJEITADO' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {req.status === 'APROVADO' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {req.status === 'PENDENTE' && <Clock className="w-3 h-3 mr-1" />}
                      {req.status === 'REJEITADO' && <X className="w-3 h-3 mr-1" />}
                      {req.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" title="Ver Comprovante">
                        {req.comprovante ? <ImageIcon className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4" />}
                    </Button>
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