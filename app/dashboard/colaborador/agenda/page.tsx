'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

const mockAgenda = [
  {
    id: 1,
    data: 'Hoje',
    horario: '14:00',
    cliente: 'Padaria Pão Quente',
    endereco: 'Rua das Flores, 123 - Centro',
    servico: 'Manutenção Preventiva - Balcão Frio',
    status: 'PENDENTE'
  },
  {
    id: 2,
    data: 'Amanhã',
    horario: '09:00',
    cliente: 'Mercado Central',
    endereco: 'Av. Principal, 500',
    servico: 'Troca de Compressor',
    status: 'AGENDADO'
  },
  {
    id: 3,
    data: '17/12',
    horario: '10:30',
    cliente: 'Sorveteria Gelato',
    endereco: 'Rua do Porto, 88',
    servico: 'Limpeza de Filtros',
    status: 'AGENDADO'
  }
];

export default function AgendaPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" /> Minha Agenda
        </h1>
        <Badge variant="outline" className="text-sm">3 Visitas Pendentes</Badge>
      </div>

      <div className="grid gap-4">
        {mockAgenda.map((item) => (
          <Card key={item.id} className={`border-l-4 ${item.data === 'Hoje' ? 'border-l-green-500 shadow-md' : 'border-l-primary/40'}`}>
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center min-w-[60px] bg-muted/50 rounded-lg p-2">
                  <span className="text-xs font-bold uppercase text-muted-foreground">{item.data}</span>
                  <span className="text-lg font-bold">{item.horario}</span>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg">{item.cliente}</h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {item.endereco}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-primary">
                    <span className="bg-primary/10 px-2 py-0.5 rounded">{item.servico}</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto">
                {item.data === 'Hoje' ? (
                  <Button className="w-full md:w-auto gap-2 bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-4 h-4" /> Iniciar Agora
                  </Button>
                ) : (
                  <Button variant="ghost" className="w-full md:w-auto gap-2 text-muted-foreground">
                    Ver Detalhes <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}