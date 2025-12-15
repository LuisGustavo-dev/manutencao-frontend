'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, MapPin, Camera, Briefcase, CheckCircle2, 
  AlertCircle, Coffee, LogOut, Play, Timer, User, 
  CalendarDays, ChevronRight, History 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from "@/app/contexts/authContext"; // Para pegar nome do user

// Dados Mockados
import { mockClientes } from '@/lib/mock-data';

// --- TIPOS ---
type StatusPonto = 'OFF' | 'DISPONIVEL' | 'EM_SERVICO' | 'ALMOCO' | 'ENCERRADO';

interface ServicoAtivo {
  id: string;
  clienteId: string;
  clienteNome: string;
  atividade: string;
  inicio: Date;
}

interface ItemTimeline {
  id: number;
  hora: string;
  tipo: 'PONTO' | 'SERVICO';
  titulo: string;
  descricao?: string;
  status?: 'check' | 'running' | 'done' | 'warning';
}

export default function PontoColaboradorPage() {
  const { user } = useAuth();
  
  // --- ESTADOS ---
  const [status, setStatus] = useState<StatusPonto>('OFF');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [servicoAtivo, setServicoAtivo] = useState<ServicoAtivo | null>(null);
  const [timeline, setTimeline] = useState<ItemTimeline[]>([]);
  const [localizacao, setLocalizacao] = useState<string>("Obtendo localização...");
  
  // Estados de "Sessão" para KPIs
  const [horaEntrada, setHoraEntrada] = useState<Date | null>(null);
  const [servicosConcluidos, setServicosConcluidos] = useState(0);

  // Form States
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [atividadeInput, setAtividadeInput] = useState('');
  const [descricaoFim, setDescricaoFim] = useState('');

  // --- EFEITOS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simula delay do GPS
    const timeout = setTimeout(() => {
      setLocalizacao("Av. Presidente Vargas, 1000 - Indaiatuba, SP");
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  // --- LÓGICA DE DURAÇÃO (KPIs) ---
  const calcularHorasTrabalhadas = () => {
    if (!horaEntrada) return "00:00";
    const diff = differenceInMinutes(currentTime, horaEntrada);
    const horas = Math.floor(diff / 60);
    const minutos = diff % 60;
    return `${horas}h ${minutos}m`;
  };

  // --- AÇÕES ---

  const addTimelineItem = (titulo: string, tipo: 'PONTO' | 'SERVICO', statusItem: 'check' | 'running' | 'done' | 'warning', desc?: string) => {
    setTimeline(prev => [{
      id: Date.now(),
      hora: format(new Date(), 'HH:mm'),
      tipo,
      titulo,
      status: statusItem,
      descricao: desc
    }, ...prev]);
  };

  const handleRegistrarPonto = (novoStatus: StatusPonto, tipoEvento: string) => {
    if (tipoEvento === 'Entrada') setHoraEntrada(new Date());
    
    addTimelineItem(tipoEvento, 'PONTO', 'check');
    setStatus(novoStatus);
    toast.success(`${tipoEvento} registrado!`);
  };

  const handleIniciarServico = () => {
    if (!clienteSelecionado || !atividadeInput) {
      toast.error("Preencha todos os campos.");
      return;
    }
    const clienteObj = mockClientes.find(c => c.id === clienteSelecionado);
    const novoServico: ServicoAtivo = {
      id: Math.random().toString(),
      clienteId: clienteSelecionado,
      clienteNome: clienteObj?.nomeFantasia || "Cliente",
      atividade: atividadeInput,
      inicio: new Date()
    };

    setServicoAtivo(novoServico);
    setStatus('EM_SERVICO');
    addTimelineItem('Início de Serviço', 'SERVICO', 'running', `${novoServico.atividade} @ ${novoServico.clienteNome}`);
    toast.success("Serviço iniciado.");
  };

  const handleFinalizarServico = () => {
    if (!descricaoFim) {
      toast.error("A descrição do serviço é obrigatória.");
      return;
    }
    
    setServicosConcluidos(prev => prev + 1);
    addTimelineItem('Serviço Finalizado', 'SERVICO', 'done', `Relatório: ${descricaoFim}`);
    
    // Limpa form
    setServicoAtivo(null);
    setClienteSelecionado('');
    setAtividadeInput('');
    setDescricaoFim('');
    setStatus('DISPONIVEL');
    toast.success("Serviço registrado com sucesso!");
  };

  // --- RENDER ---

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* --- CABEÇALHO DO DASHBOARD --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Olá, {user?.nome || "Colaborador"} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> {localizacao}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-card border rounded-lg p-2 shadow-sm">
           <div className="text-right px-2">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Horário Atual</p>
              <p className="text-2xl font-bold tabular-nums leading-none">
                {format(currentTime, "HH:mm")}
                <span className="text-sm text-muted-foreground font-normal ml-1">:{format(currentTime, "ss")}</span>
              </p>
           </div>
           <div className="h-10 w-px bg-border" />
           <div className="px-2">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Data</p>
              <p className="text-sm font-medium">{format(currentTime, "dd 'de' MMM, yyyy", { locale: ptBR })}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLUNA ESQUERDA (2/3): AÇÕES PRINCIPAIS --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD DE STATUS E CONTROLE */}
          <Card className="border-t-4 border-t-primary shadow-md overflow-hidden">
            <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
               <h2 className="font-semibold flex items-center gap-2">
                 <Briefcase className="w-5 h-5 text-primary" /> Painel de Ação
               </h2>
               <Badge variant={
                 status === 'EM_SERVICO' ? 'default' : 
                 status === 'ALMOCO' ? 'secondary' : 
                 status === 'DISPONIVEL' ? 'outline' : 'destructive'
               } className="text-sm px-3 py-1">
                 {status === 'OFF' && '🔴 Não Iniciado'}
                 {status === 'DISPONIVEL' && '🟢 Disponível'}
                 {status === 'EM_SERVICO' && '🔵 Em Atendimento'}
                 {status === 'ALMOCO' && '🟡 Almoço'}
                 {status === 'ENCERRADO' && '🏁 Encerrado'}
               </Badge>
            </div>

            <CardContent className="p-6">
              
              {/* CENÁRIO 1: OFF (Botão Gigante de Entrada) */}
              {status === 'OFF' && (
                <div className="text-center py-10">
                  <div className="mb-6 inline-flex p-4 bg-primary/10 rounded-full">
                    <Clock className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Pronto para começar?</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Registre sua entrada para liberar o painel de serviços. Certifique-se de estar no local correto.
                  </p>
                  <Button size="lg" className="h-14 px-8 text-lg w-full max-w-sm" onClick={() => handleRegistrarPonto('DISPONIVEL', 'Entrada')}>
                    Registrar Entrada
                  </Button>
                </div>
              )}

              {/* CENÁRIO 2: DISPONÍVEL (Dashboard de Escolha) */}
              {status === 'DISPONIVEL' && (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Form de Início Rápido */}
                      <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border border-dashed border-primary/30">
                         <h4 className="font-semibold mb-4 text-primary flex items-center gap-2">
                           <Play className="w-4 h-4 fill-current" /> Iniciar Novo Serviço
                         </h4>
                         <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Cliente</Label>
                                <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                                  <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                  <SelectContent>
                                    {mockClientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nomeFantasia}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Atividade</Label>
                                <Input 
                                  placeholder="O que será feito?" 
                                  value={atividadeInput}
                                  onChange={e => setAtividadeInput(e.target.value)}
                                  className="bg-background"
                                />
                              </div>
                            </div>
                            <Button className="w-full" onClick={handleIniciarServico}>Começar Agora</Button>
                         </div>
                      </div>

                      {/* Botões Secundários */}
                      <Button variant="outline" className="h-20 flex flex-col gap-1 border-yellow-200 bg-yellow-50/50 hover:bg-yellow-100 hover:border-yellow-300 dark:bg-yellow-900/10" onClick={() => handleRegistrarPonto('ALMOCO', 'Saída para Almoço')}>
                        <Coffee className="w-6 h-6 text-yellow-600" />
                        <span className="text-yellow-700 font-medium">Sair para Almoço</span>
                      </Button>
                      
                      <Button variant="outline" className="h-20 flex flex-col gap-1 border-red-200 bg-red-50/50 hover:bg-red-100 hover:border-red-300 dark:bg-red-900/10" onClick={() => handleRegistrarPonto('ENCERRADO', 'Saída do Trabalho')}>
                        <LogOut className="w-6 h-6 text-red-600" />
                        <span className="text-red-700 font-medium">Encerrar Expediente</span>
                      </Button>
                   </div>
                </div>
              )}

              {/* CENÁRIO 3: EM SERVIÇO (Card de Execução) */}
              {status === 'EM_SERVICO' && servicoAtivo && (
                <div className="relative">
                  <div className="absolute top-0 right-0 animate-pulse">
                    <Badge variant="default" className="bg-green-600">Em Andamento</Badge>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">{servicoAtivo.clienteNome}</h3>
                      <p className="text-lg text-muted-foreground">{servicoAtivo.atividade}</p>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Timer className="w-4 h-4" /> Iniciado às {format(servicoAtivo.inicio, 'HH:mm')}
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Relatório de Finalização</Label>
                      <Textarea 
                        placeholder="Descreva detalhadamente o serviço realizado, peças trocadas e observações..." 
                        className="min-h-[120px] resize-none focus-visible:ring-green-500"
                        value={descricaoFim}
                        onChange={e => setDescricaoFim(e.target.value)}
                      />
                      <Button variant="outline" className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary">
                        <Camera className="w-4 h-4 mr-2" /> Anexar Fotos do Serviço (Opcional)
                      </Button>
                    </div>

                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg" onClick={handleFinalizarServico}>
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Finalizar e Registrar
                    </Button>
                  </div>
                </div>
              )}

              {/* CENÁRIOS DE PAUSA/FIM */}
              {(status === 'ALMOCO' || status === 'ENCERRADO') && (
                 <div className="text-center py-12 flex flex-col items-center justify-center space-y-4">
                    {status === 'ALMOCO' ? (
                      <>
                        <div className="p-4 bg-yellow-100 rounded-full animate-bounce duration-[2000ms]"><Coffee className="w-10 h-10 text-yellow-600" /></div>
                        <h3 className="text-2xl font-bold text-yellow-800">Em Horário de Almoço</h3>
                        <p className="text-muted-foreground">Aproveite seu descanso. Clique abaixo ao retornar.</p>
                        <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white mt-4" onClick={() => handleRegistrarPonto('DISPONIVEL', 'Volta do Almoço')}>
                          Registrar Retorno
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-green-100 rounded-full"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                        <h3 className="text-2xl font-bold text-foreground">Expediente Encerrado</h3>
                        <p className="text-muted-foreground">Bom descanso! Até amanhã.</p>
                        <Button variant="link" onClick={() => window.location.reload()} className="text-muted-foreground">
                          (Resetar Simulação)
                        </Button>
                      </>
                    )}
                 </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* --- COLUNA DIREITA (1/3): RESUMO E INFO --- */}
        <div className="space-y-6">
          
          {/* KPI CARDS (Mini Stats) */}
          <div className="grid grid-cols-2 gap-4">
             <Card className="bg-card shadow-sm">
                <CardContent className="p-4 text-center">
                   <p className="text-xs font-bold text-muted-foreground uppercase">Tempo Total</p>
                   <p className="text-2xl font-bold text-primary mt-1">{calcularHorasTrabalhadas()}</p>
                </CardContent>
             </Card>
             <Card className="bg-card shadow-sm">
                <CardContent className="p-4 text-center">
                   <p className="text-xs font-bold text-muted-foreground uppercase">Serviços</p>
                   <p className="text-2xl font-bold text-green-600 mt-1">{servicosConcluidos}</p>
                </CardContent>
             </Card>
          </div>

          {/* TIMELINE FEED */}
          <Card className="flex-1 shadow-sm flex flex-col h-[500px]">
             <CardHeader className="pb-2 bg-muted/20">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-4 h-4" /> Linha do Tempo
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                   <div className="p-4 space-y-6">
                      {timeline.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground text-sm">
                           <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-20" />
                           Nenhuma atividade hoje.
                        </div>
                      )}

                      {timeline.map((item) => (
                        <div key={item.id} className="relative pl-6 pb-1 last:pb-0">
                           {/* Linha vertical */}
                           <div className="absolute left-[9px] top-2 bottom-0 w-px bg-border last:hidden" />
                           
                           {/* Ícone status */}
                           <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-background z-10 ${
                             item.status === 'running' ? 'border-blue-500' :
                             item.status === 'done' ? 'border-green-500' :
                             item.status === 'warning' ? 'border-yellow-500' : 'border-primary'
                           }`}>
                             <div className={`w-2 h-2 rounded-full ${
                               item.status === 'running' ? 'bg-blue-500 animate-pulse' :
                               item.status === 'done' ? 'bg-green-500' :
                               item.status === 'warning' ? 'bg-yellow-500' : 'bg-primary'
                             }`} />
                           </div>

                           <div className="flex flex-col">
                              <span className="text-xs font-mono text-muted-foreground mb-0.5">{item.hora}</span>
                              <span className="text-sm font-semibold leading-none mb-1">{item.titulo}</span>
                              {item.descricao && (
                                <span className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border mt-1">
                                  {item.descricao}
                                </span>
                              )}
                           </div>
                        </div>
                      ))}
                   </div>
                </ScrollArea>
             </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}