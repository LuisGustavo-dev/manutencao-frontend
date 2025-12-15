'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { 
  CalendarDays, MapPin, ArrowRight, CheckCircle2, 
  User, Phone, FileText, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- DADOS MOCKADOS ENRIQUECIDOS ---
const mockAgenda = [
  {
    id: 1,
    data: 'Hoje',
    horario: '14:00',
    cliente: 'Padaria Pão Quente',
    endereco: 'Rua das Flores, 123 - Centro, Indaiatuba - SP',
    contato: 'Sr. Roberto',
    telefone: '(19) 99999-1234',
    servico: 'Manutenção Preventiva - Balcão Frio',
    descricao: 'Realizar limpeza do condensador, verificar pressão do gás e calibrar termostato digital.',
    status: 'PENDENTE'
  },
  {
    id: 2,
    data: 'Amanhã',
    horario: '09:00',
    cliente: 'Mercado Central',
    endereco: 'Av. Principal, 500 - Distrito Industrial',
    contato: 'Gerente Ana',
    telefone: '(19) 98888-5678',
    servico: 'Troca de Compressor',
    descricao: 'Substituição do compressor da ilha de congelados. Necessário levar solda e gás R-404.',
    status: 'AGENDADO'
  },
  {
    id: 3,
    data: '17/12',
    horario: '10:30',
    cliente: 'Sorveteria Gelato',
    endereco: 'Rua do Porto, 88 - Jd. América',
    contato: 'Marcos',
    telefone: '(19) 97777-0000',
    servico: 'Limpeza de Filtros',
    descricao: 'Limpeza geral dos filtros de ar condicionado e verificação de dreno.',
    status: 'AGENDADO'
  }
];

export default function AgendaPage() {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // --- AÇÃO: VER DETALHES ---
  const handleOpenDetails = (evento: any) => {
    setSelectedEvent(evento);
    setIsDetailsOpen(true);
  };

  // --- AÇÃO: INICIAR SERVIÇO ---
  const handleStartService = (evento: any) => {
    // Aqui você poderia passar o ID via query param para o dashboard já abrir o form preenchido
    toast.success(`Iniciando atendimento para ${evento.cliente}`);
    
    // Redireciona para a tela principal onde está o botão de "Ponto/Serviço"
    router.push('/dashboard/colaborador');
  };

  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" /> Minha Agenda
        </h1>
        <Badge variant="outline" className="text-sm bg-background">
          {mockAgenda.filter(i => i.status === 'PENDENTE' || i.data === 'Hoje').length} Visitas Prioritárias
        </Badge>
      </div>

      {/* Lista de Cards */}
      <div className="grid gap-4">
        {mockAgenda.map((item) => (
          <Card key={item.id} className={`border-l-4 transition-all hover:shadow-md ${
            item.data === 'Hoje' ? 'border-l-green-500 bg-green-50/10' : 'border-l-primary/40'
          }`}>
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4 flex-1">
                {/* Data/Hora Box */}
                <div className={`flex flex-col items-center min-w-[70px] rounded-lg p-2 border ${
                    item.data === 'Hoje' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-muted/50 text-muted-foreground border-muted'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.data}</span>
                  <span className="text-xl font-bold">{item.horario}</span>
                </div>
                
                {/* Informações Principais */}
                <div>
                  <h3 className="font-bold text-lg leading-none mb-1">{item.cliente}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                    <MapPin className="w-3 h-3 shrink-0" /> 
                    <span className="truncate max-w-[200px] md:max-w-md">{item.endereco}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    <Badge variant="secondary" className="font-normal text-muted-foreground bg-muted">
                        {item.servico}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                {item.data === 'Hoje' ? (
                  <Button 
                    className="w-full md:w-auto gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    onClick={() => handleStartService(item)}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Iniciar
                  </Button>
                ) : null}
                
                <Button 
                    variant={item.data === 'Hoje' ? "outline" : "secondary"} 
                    className="w-full md:w-auto gap-2"
                    onClick={() => handleOpenDetails(item)}
                >
                  Ver Detalhes <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- MODAL DE DETALHES --- */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
            {selectedEvent && (
                <>
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{selectedEvent.data} às {selectedEvent.horario}</Badge>
                            {selectedEvent.data === 'Hoje' && <Badge className="bg-green-600">Prioridade</Badge>}
                        </div>
                        <DialogTitle className="text-xl">{selectedEvent.cliente}</DialogTitle>
                        <DialogDescription className="flex items-start gap-2 text-left mt-1">
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> 
                            {selectedEvent.endereco}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 text-sm">
                        {/* Box de Contato */}
                        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg border">
                            <div>
                                <span className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1 mb-1">
                                    <User className="w-3 h-3" /> Contato Local
                                </span>
                                <p className="font-medium">{selectedEvent.contato}</p>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1 mb-1">
                                    <Phone className="w-3 h-3" /> Telefone
                                </span>
                                <p className="font-medium">{selectedEvent.telefone}</p>
                            </div>
                        </div>

                        {/* Descrição do Serviço */}
                        <div>
                            <span className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1 mb-2">
                                <FileText className="w-3 h-3" /> Descrição da Ordem de Serviço
                            </span>
                            <div className="p-3 border rounded-lg bg-card text-muted-foreground">
                                <p className="mb-2 font-medium text-foreground">{selectedEvent.servico}</p>
                                <p>{selectedEvent.descricao}</p>
                            </div>
                        </div>

                        {/* Aviso */}
                        <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-100">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Lembre-se de usar os EPIs obrigatórios para este serviço.</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Fechar</Button>
                        {selectedEvent.data === 'Hoje' && (
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStartService(selectedEvent)}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Iniciar Agora
                            </Button>
                        )}
                    </DialogFooter>
                </>
            )}
        </DialogContent>
      </Dialog>

    </div>
  );
}