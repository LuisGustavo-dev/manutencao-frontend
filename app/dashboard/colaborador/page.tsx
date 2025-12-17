'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, MapPin, Briefcase, CheckCircle2, 
  Coffee, LogOut, CalendarDays, History, PlayCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from "@/app/contexts/authContext";

type StatusPonto = 'OFF' | 'DISPONIVEL' | 'EM_SERVICO' | 'ALMOCO' | 'ENCERRADO';

interface Cliente {
  user_id: number;
  user_name: string;
}

interface ServicoAtivo {
  id: string | number;
  clienteId: string;
  clienteNome: string;
  atividade: string;
  inicio: Date;
}

interface ItemTimeline {
  id: string | number;
  hora: string;
  tipo: 'PONTO' | 'SERVICO';
  titulo: string;
  descricao?: string;
  status?: 'check' | 'running' | 'done' | 'warning';
}

const API_URL = "http://localhost:3340";

export default function PontoColaboradorPage() {
  const { token, user } = useAuth();
  
  // --- ESTADOS ---
  const [status, setStatus] = useState<StatusPonto>('OFF');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pontoId, setPontoId] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicoAtivo, setServicoAtivo] = useState<ServicoAtivo | null>(null);
  const [timeline, setTimeline] = useState<ItemTimeline[]>([]);
  const [localizacao, setLocalizacao] = useState<string>("Av. Presidente Vargas, 1000 - Indaiatuba, SP");
  
  const [horaEntrada, setHoraEntrada] = useState<Date | null>(null);
  const [servicosConcluidos, setServicosConcluidos] = useState(0);

  // Inputs do formulário
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [atividadeInput, setAtividadeInput] = useState('');
  const [descricaoFim, setDescricaoFim] = useState('');

  // --- MAPPER AUXILIAR (Transforma dados da API em itens visuais da Timeline) ---
  const mapApiToTimeline = useCallback((data: any): ItemTimeline[] => {
    const events: ItemTimeline[] = [];
    if (!data) return [];

    // 1. Ponto de Entrada
    if (data.entrada) {
      events.push({ id: `ent-${data.id}`, hora: format(new Date(data.entrada), 'HH:mm'), tipo: 'PONTO', titulo: 'Entrada', status: 'check' });
    }
    
    // 2. Almoço
    if (data.almoco) {
      events.push({ id: `alm-${data.id}`, hora: format(new Date(data.almoco), 'HH:mm'), tipo: 'PONTO', titulo: 'Saída para Almoço', status: 'warning' });
    }
    if (data.retornoAlmoço) {
      events.push({ id: `ret-${data.id}`, hora: format(new Date(data.retornoAlmoço), 'HH:mm'), tipo: 'PONTO', titulo: 'Volta do Almoço', status: 'check' });
    }

    // 3. Serviços (Início e Fim)
    if (data.registroDoColaborador && Array.isArray(data.registroDoColaborador)) {
      data.registroDoColaborador.forEach((reg: any) => {
        
        // ADICIONADO: Evento de INÍCIO do serviço
        if (reg.inicio) {
            events.push({
              id: `ini-${reg.id}`,
              hora: format(new Date(reg.inicio), 'HH:mm'),
              tipo: 'SERVICO',
              titulo: 'Início de Serviço',
              descricao: reg.atividade, // A descrição inicial
              status: 'running' // Status azul (cor primária)
            });
        }

        // Evento de FIM do serviço
        if (reg.finalizacao) { 
          events.push({
            id: `fin-${reg.id}`,
            hora: format(new Date(reg.finalizacao), 'HH:mm'),
            tipo: 'SERVICO',
            titulo: 'Serviço Finalizado',
            descricao: reg.atividadeFinalizada, // O relatório final
            status: 'done' // Status verde
          });
        }
      });
    }

    // 4. Saída
    if (data.saida) {
      events.push({ id: `sai-${data.id}`, hora: format(new Date(data.saida), 'HH:mm'), tipo: 'PONTO', titulo: 'Saída do Trabalho', status: 'done' });
    }

    // Ordena do mais recente para o mais antigo (baseado na hora string HH:mm pode falhar na virada do dia, ideal seria usar timestamp, mas para HH:mm simples ok)
    // Melhoria: Ordenar por timestamps reais se possível, mas mantendo a lógica atual:
    return events.sort((a, b) => b.hora.localeCompare(a.hora));
  }, []);

  // --- FUNÇÃO PRINCIPAL DE CARREGAMENTO (Sincroniza Front com Back) ---
  const carregarDadosPonto = useCallback(async () => {
    if (!user?.id || !token) return;

    try {
      const resPonto = await fetch(`${API_URL}/colaborador/linha-tempo/${user.id}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });

      if (resPonto.ok) {
        const data = await resPonto.json();
        
        // 1. Atualiza dados básicos
        setPontoId(data.id);
        setTimeline(mapApiToTimeline(data));
        setServicosConcluidos(data.registroDoColaborador?.filter((r: any) => r.finalizacao).length || 0);

        // 2. Lógica de Estado (Máquina de Estados)
        if (data.entrada) {
          setHoraEntrada(new Date(data.entrada));
          
          if (data.saida) {
            setStatus('ENCERRADO');
            setServicoAtivo(null);
          } 
          else if (data.almoco && !data.retornoAlmoço) {
            setStatus('ALMOCO');
            setServicoAtivo(null);
          } 
          else {
            // Verifica se tem tarefa aberta (sem data de finalização)
            const tarefaAberta = data.registroDoColaborador?.find((r: any) => !r.finalizacao);
            
            if (tarefaAberta) {
              const nomeCliente = clientes.find(c => c.user_id === tarefaAberta.empresaId)?.user_name || "Cliente em Atendimento";

              setServicoAtivo({
                id: tarefaAberta.id,
                clienteId: String(tarefaAberta.empresaId), 
                clienteNome: nomeCliente,
                atividade: tarefaAberta.atividade,
                inicio: new Date(tarefaAberta.inicio || new Date())
              });
              setStatus('EM_SERVICO');
            } else {
              setServicoAtivo(null);
              setStatus('DISPONIVEL');
            }
          }
        } else {
            setStatus('OFF');
        }
      }
    } catch (e) {
      console.error("Erro ao sincronizar dados:", e);
    }
  }, [user?.id, token, mapApiToTimeline, clientes]); 

  // --- EFEITOS ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInicial = async () => {
      if (!token) return;
      try {
        const resClientes = await fetch(`${API_URL}/user/clientes`, { headers: { 'Authorization': `Bearer ${token}` } });
        const dataClientes = await resClientes.json();
        setClientes(Array.isArray(dataClientes) ? dataClientes : []);
      } catch (e) { console.error(e); }
    };
    fetchInicial();
  }, [token]);

  useEffect(() => {
    if (token && user?.id) {
        carregarDadosPonto();
    }
  }, [carregarDadosPonto, token, user?.id]);


  // --- HANDLERS (Ações do Usuário) ---

  const handleRegistrarPonto = async (novoStatus: StatusPonto, tipoEvento: string) => {
    try {
      if (tipoEvento === 'Entrada') {
        await fetch(`${API_URL}/colaborador`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({})
        });
        toast.success("Entrada registrada!");
      } else {
        const agora = new Date();
        let body = {};
        if (novoStatus === 'ALMOCO') body = { almoco: agora };
        else if (tipoEvento === 'Volta do Almoço') body = { retornoAlmoço: agora };
        else if (novoStatus === 'ENCERRADO') body = { saida: agora };

        await fetch(`${API_URL}/colaborador/${pontoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        toast.success(`${tipoEvento} registrado!`);
      }
      await carregarDadosPonto();
    } catch (e) { 
        toast.error("Erro de conexão com o servidor"); 
    }
  };

  const handleIniciarServico = async () => {
    if (!clienteSelecionado || !atividadeInput) return toast.error("Preencha os campos.");
    try {
      const res = await fetch(`${API_URL}/colaborador/${pontoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ empresaId: Number(clienteSelecionado), atividade: atividadeInput })
      });
      
      if (res.ok) {
        toast.success("Serviço iniciado!");
        setAtividadeInput('');
        await carregarDadosPonto();
      } else {
        toast.error("Não foi possível iniciar o serviço.");
      }
    } catch (e) { toast.error("Erro ao iniciar."); }
  };

  const handleFinalizarServico = async () => {
    if (!descricaoFim) return toast.error("Relatório obrigatório.");
    try {
      const res = await fetch(`${API_URL}/colaborador/${pontoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ atividadeFinalizada: descricaoFim, finalizacao: new Date() })
      });
      
      if (res.ok) {
        toast.success("Serviço finalizado!");
        setDescricaoFim('');
        setClienteSelecionado('');
        await carregarDadosPonto();
      }
    } catch (e) { toast.error("Erro ao finalizar."); }
  };

  const handleReiniciar = () => {
    setStatus('OFF');
    setPontoId(null);
    setTimeline([]);
    setHoraEntrada(null);
    setServicosConcluidos(0);
    setServicoAtivo(null);
    setClienteSelecionado('');
    setAtividadeInput('');
    setDescricaoFim('');
  };

  return (
    <div className="mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.nome || "Colaborador"} 👋</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {localizacao}</p>
        </div>
        <div className="flex items-center gap-4 bg-card border rounded-lg p-3 shadow-sm">
           <div className="text-right px-2">
              <p className="text-xs text-muted-foreground uppercase font-bold">Horário Atual</p>
              <p className="text-2xl font-bold tabular-nums leading-none">
                {format(currentTime, "HH:mm")}<span className="text-sm text-muted-foreground font-normal ml-1">:{format(currentTime, "ss")}</span>
              </p>
           </div>
           <div className="h-10 w-px bg-border" />
           <div className="px-2">
              <p className="text-xs text-muted-foreground uppercase font-bold">Data</p>
              <p className="text-sm font-medium">{format(currentTime, "dd 'de' MMM, yyyy", { locale: ptBR })}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel de Ações */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-t-4 border-t-primary shadow-md overflow-hidden">
            <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
               <h2 className="font-semibold flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Painel de Controle</h2>
               <Badge variant={status === 'EM_SERVICO' ? 'default' : status === 'ALMOCO' ? 'secondary' : 'outline'}>{status}</Badge>
            </div>
            <CardContent className="p-6">
              
              {status === 'OFF' && (
                <div className="text-center py-10">
                  <Clock className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                  <Button size="lg" className="px-10" onClick={() => handleRegistrarPonto('DISPONIVEL', 'Entrada')}>Registrar Entrada</Button>
                </div>
              )}

              {status === 'DISPONIVEL' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border border-dashed border-primary/30">
                    <Label className="text-primary font-bold mb-4 block">Iniciar Novo Serviço</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>Cliente</Label>
                        <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>
                            {clientes.map(c => <SelectItem key={c.user_id} value={String(c.user_id)}>{c.user_name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Atividade</Label>
                        <Input placeholder="O que será feito?" value={atividadeInput} onChange={e => setAtividadeInput(e.target.value)} />
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleIniciarServico}>Começar Agora</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20" onClick={() => handleRegistrarPonto('ALMOCO', 'Saída para Almoço')}><Coffee className="mr-2 h-5 w-5 text-yellow-600"/> Pausa Almoço</Button>
                    <Button variant="outline" className="h-20 border-red-200 hover:bg-red-50" onClick={() => handleRegistrarPonto('ENCERRADO', 'Saída do Trabalho')}><LogOut className="mr-2 h-5 w-5 text-red-600"/> Encerrar Dia</Button>
                  </div>
                </div>
              )}

              {status === 'EM_SERVICO' && servicoAtivo && (
                <div className="space-y-6 animate-in zoom-in-95">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-primary">{servicoAtivo.clienteNome}</h3>
                      <p className="text-muted-foreground">{servicoAtivo.atividade}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">Em Execução</Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Relatório de Conclusão</Label>
                    <Textarea placeholder="Descreva o que foi feito..." value={descricaoFim} onChange={e => setDescricaoFim(e.target.value)} className="min-h-[150px]" />
                  </div>
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={handleFinalizarServico}>Finalizar e Salvar</Button>
                </div>
              )}

              {status === 'ALMOCO' && (
                <div className="text-center py-12">
                  <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Coffee className="w-10 h-10 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Pausa de Almoço</h3>
                  <Button size="lg" variant="default" className="bg-yellow-600" onClick={() => handleRegistrarPonto('DISPONIVEL', 'Volta do Almoço')}>Registrar Retorno</Button>
                </div>
              )}

              {status === 'ENCERRADO' && (
                <div className="flex flex-col items-center justify-center text-center py-10 animate-in zoom-in duration-500">
                    <div className="bg-green-100 dark:bg-green-900/30 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
                        Ótimo trabalho por hoje!
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8 max-w-md">
                        Bom descanso e até a próxima! 🌙
                    </p>
                    <Button variant="outline" size="lg" onClick={handleReiniciar} className="border-dashed">
                        <History className="mr-2 w-4 h-4" />
                        Reiniciar Painel
                    </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase">Tempo Total</p>
              <p className="text-2xl font-bold text-primary">{horaEntrada ? differenceInMinutes(currentTime, horaEntrada) + " min" : "--"}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase">Serviços</p>
              <p className="text-2xl font-bold text-green-600">{servicosConcluidos}</p>
            </CardContent></Card>
          </div>

          <Card className="h-[500px] flex flex-col shadow-sm">
            <CardHeader className="pb-2 bg-muted/20 border-b">
              <CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4" /> Linha do Tempo</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  {timeline.length === 0 ? (
                    <div className="text-center py-20 opacity-30"><CalendarDays className="w-12 h-12 mx-auto mb-2" /><p>Sem registros hoje</p></div>
                  ) : (
                    timeline.map((item) => (
                      <div key={item.id} className="relative pl-6 pb-2">
                        <div className="absolute left-[9px] top-2 bottom-0 w-px bg-border" />
                        <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 bg-background z-10 flex items-center justify-center ${item.status === 'done' ? 'border-green-500' : 'border-primary'}`}>
                          {item.status === 'done' ? (
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                          ) : (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-muted-foreground">{item.hora}</span>
                          <span className="text-sm font-bold">{item.titulo}</span>
                          {item.descricao && <span className="text-xs text-muted-foreground bg-slate-50 p-2 rounded border mt-1 italic">{item.descricao}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}