'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, Plus, User, MapPin } from 'lucide-react';
import { mockUsuarios, mockClientes } from '@/lib/mock-data'; // Reutilizando mocks
import toast from 'react-hot-toast';

export default function AdminAgendaPage() {
  const [visitas, setVisitas] = useState([
    { id: 1, tecnico: 'Luis Gustavo', cliente: 'Padaria Pão Quente', data: 'Hoje', hora: '14:00', status: 'PENDENTE' },
    { id: 2, tecnico: 'Ana Silva', cliente: 'Mercado Central', data: 'Amanhã', hora: '09:00', status: 'AGENDADO' },
  ]);

  const [open, setOpen] = useState(false);

  const handleAgendar = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Visita agendada com sucesso!");
    setOpen(false);
    // Aqui adicionaria ao estado 'visitas'
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda de Visitas</h1>
          <p className="text-muted-foreground">Distribua as ordens de serviço e visitas técnicas.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Visita</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Agendar Nova Visita</DialogTitle></DialogHeader>
            <form onSubmit={handleAgendar} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Técnico/Colaborador</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {mockUsuarios.filter(u => u.role !== 'Cliente').map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {mockClientes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nomeFantasia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora</label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Serviço / Descrição</label>
                <Input placeholder="Ex: Manutenção Preventiva" />
              </div>
              <Button type="submit" className="w-full mt-4">Confirmar Agendamento</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Próximas Visitas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitas.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{v.data}</span>
                      <span className="text-xs text-muted-foreground">{v.hora}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" /> {v.tecnico}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" /> {v.cliente}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${v.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {v.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Editar</Button>
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