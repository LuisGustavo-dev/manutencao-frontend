'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { io } from "socket.io-client"; // <--- IMPORTANTE: Import do Socket.io
import Link from 'next/link';
import toast from 'react-hot-toast';

// --- CONTEXTOS E MOCKS (Do seu projeto) ---
import type { Equipamento } from '@/lib/mock-data'; 
import { useAuth } from '@/app/contexts/authContext'; 

// --- UI COMPONENTS ---
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// --- ICONS ---
import { 
  HardHat, 
  Wrench, 
  Settings2,
  Droplet,
  Wind,
  Bolt,
  History,
  CheckCircle,
  AlertCircle,
  Loader2,
  Activity,
  RefreshCcw,
  CheckSquare,
  Square
} from "lucide-react";

// --- COMPONENTES DE FORMULÁRIO ---
import { FormChecklistCliente } from './components/FormChecklistCliente';
import { FormChecklistManutentorCorretiva } from './components/FormChecklistManutentorCorretiva';

// --- TIPOS ---

type ApiHistoricoItem = {
  id: number;
  data: string;
  tipo: string;
  tecnico: string;
  status: string;
};

type ChecklistItem = {
  id: number;
  nomeChecklist: string;
  estado: boolean;
  observacao: string | null;
  operacional: boolean;
  urlMedia: string | null;
};

// --- WRAPPER PRINCIPAL ---
export default function EquipamentoPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <EquipamentoPage />
    </Suspense>
  );
}

// --- COMPONENTE DA PÁGINA ---
function EquipamentoPage() {
  const searchParams = useSearchParams();
  const router = useRouter(); 
  const pathname = usePathname(); 
  const id = searchParams.get('id');
  
  const { role, token } = useAuth();

  // --- ESTADOS GERAIS ---
  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [historico, setHistorico] = useState<ApiHistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'Disponível' | 'Manutencao' | null>(null);
  const [refetchToggle, setRefetchToggle] = useState(false);

  // --- ESTADOS DE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'cliente' | 'corretiva' | null>(null);
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // --- ESTADOS PARA TEMPO REAL ---
  const [checklistAtivo, setChecklistAtivo] = useState<ChecklistItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 1. FETCH DOS DADOS DO EQUIPAMENTO (Carregamento Inicial Estático)
  useEffect(() => {
    if (!id || !token) {
      setIsLoading(false);
      setError("ID do equipamento ou token de autenticação não encontrado.");
      return;
    }

    const fetchData = async () => {
      if (equipamento === null) {
        setIsLoading(true);
      }
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:3340/equipamento/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar dados do equipamento.');
        }

        const apiData = await response.json();

        const statusManutencao: 'Disponível' | 'Manutencao' = 
          apiData.status === 'disponivel' ? 'Disponível' : 'Manutencao';
        
        const transformedEq: Equipamento = {
          id: String(apiData.id),
          modeloCompressor: apiData.modeloCompressor,
          tipoGas: apiData.tipoGas,
          tipoOleo: apiData.tipoOleo,
          tensao: `${apiData.tensao}V`, 
          aplicacao: apiData.aplicacao,
          statusManutencao: statusManutencao,
          nome: apiData.nome || `Equipamento #${apiData.id}`, 
          tipo: apiData.tipo || 'Não especificado', 
          clienteId: apiData.clienteId || null, 
          tipoCondensador: apiData.tipoCondensador || 'N/A',
          tipoEvaporador: apiData.tipoEvaporador || 'N/A',
          valvulaExpansao: apiData.valvulaExpansao || 'N/A',
        };
        
        const transformedHistory: ApiHistoricoItem[] = apiData.chamadosFechados
          .map((item: any) => ({
            id: item.id,
            data: new Date(item.horaAbertura).toLocaleDateString('pt-BR'),
            tipo: item.tipo, 
            tecnico: item.tecnicoNome || 'N/A', 
            status: item.status, 
          }))
          .reverse(); 

        setEquipamento(transformedEq);
        setHistorico(transformedHistory.slice(0, 3)); 
        setStatus(statusManutencao);

      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados.");
        toast.error(err.message || "Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, token, refetchToggle]);

  // 2. NOVO EFFECT: WEBSOCKET LISTENER (TEMPO REAL)
  // Substitui o setInterval anterior pelo Socket.IO
  useEffect(() => {
    // Só ativa o listener se tiver ID, Token e estiver em MANUTENÇÃO
    if (!id || !token || status !== 'Manutencao') {
      setChecklistAtivo([]); 
      setLastUpdate(null);
      return;
    }

    // Função de busca (chamada ao iniciar e quando o socket avisa)
    const fetchChecklist = async () => {
      try {
        const response = await fetch(`http://localhost:3340/equipamento/${id}/realtime`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Garante array
          const lista = Array.isArray(data) ? data : [data];
          setChecklistAtivo(lista);
          setLastUpdate(new Date()); // Atualiza o badge de horário
        }
      } catch (error) {
        console.error("Erro ao buscar dados realtime:", error);
      }
    };

    // --- CONEXÃO WEBSOCKET ---
    // Conecta ao servidor (mesma porta do backend NestJS)
    const socket = io('http://localhost:3340', {
      transports: ['websocket'], // Força websocket para evitar atrasos de long-polling
    });

    // Escuta o evento específico deste equipamento
    // O backend envia: this.server.emit(`checklist-update-${equipamentoId}`, { refresh: true });
    socket.on(`checklist-update-${id}`, (payload) => {
      console.log("Evento Socket Recebido:", payload);
      if (payload?.refresh) {
        fetchChecklist();
      }
    });

    // Chamada inicial para preencher a tela assim que entrar
    fetchChecklist();

    // Limpeza ao desmontar o componente ou sair do status de manutenção
    return () => {
      socket.disconnect();
    };
  }, [id, token, status]);

  // --- Handlers ---
  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

  const handleNavigate = (path: string) => {
    if (loadingPath === path) return; 
    setLoadingPath(path);
    router.push(path);
  };

  const openModal = (type: 'cliente' | 'corretiva') => {
    setModalContent(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  }

  const handleModalSuccess = () => {
    closeModal();
    setRefetchToggle(prev => !prev);
  };

  // --- RENDERIZAÇÃO: LOADING E ERRO ---
  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Carregando dados do equipamento...</p>
      </main>
    );
  }

  if (error || !equipamento) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Equipamento não encontrado</h1>
        <p className="text-muted-foreground">{error || "O ID solicitado não existe."}</p>
        <Button variant="outline" asChild className="mt-6">
          <Link href="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </main>
    );
  }

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* CABEÇALHO */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{equipamento.nome}</h1>
          <p className="font-semibold text-muted-foreground">{equipamento.aplicacao}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUNA ESQUERDA (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CARD 1: STATUS E AÇÕES */}
            <Card>
              <CardHeader>
                <CardTitle>Status e Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-6 rounded-lg ${status === 'Disponível' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' : 'bg-destructive/5 dark:bg-destructive/20 border border-destructive/20'}`}>
                  <div className="flex items-center gap-3">
                    {status === 'Disponível' ? 
                      <CheckCircle className="h-8 w-8 text-green-600" /> : 
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    }
                    <div>
                      <h3 className="text-xl font-semibold">{status}</h3>
                      <p className="text-muted-foreground">
                        {status === 'Disponível' ? 'Equipamento operando normalmente.' : 'Este equipamento tem um chamado ativo.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                {role === 'Cliente' && (
                  <>
                    {status === 'Disponível' && (
                      <Button variant="destructive" size="lg" className="w-full" onClick={() => openModal('cliente')}>
                        <AlertCircle className="mr-2 h-5 w-5" /> Solicitar Manutenção Corretiva
                      </Button>
                    )}
                  </>
                )}

                {(role === 'Manutentor' || role === 'Admin') && (
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    {status === 'Manutencao' ? ( 
                      <Button variant="destructive" size="lg" className="flex-1" onClick={() => openModal('corretiva')}>
                        <HardHat className="mr-2 h-5 w-5" /> Realizar Manutenção
                      </Button>
                    ) : (
                      <Button variant="secondary" size="lg" className="flex-1" onClick={() => openModal('corretiva')}>
                        <Wrench className="mr-2 h-5 w-5" /> Iniciar Nova Manutenção Corretiva
                      </Button>
                    )}
                  </div>
                )}
                
                {!role && (
                  <Button asChild className="w-full"><a href="/login">Fazer Login</a></Button>
                )}
              </CardFooter>
            </Card>

            {/* CARD 2: ACOMPANHAMENTO EM TEMPO REAL (WEBSOCKET) */}
            {status === 'Manutencao' && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary animate-pulse" />
                      <CardTitle>Acompanhamento em Tempo Real</CardTitle>
                    </div>
                    {lastUpdate && (
                      <Badge variant="outline" className="text-xs font-normal gap-1 bg-background/50">
                        <RefreshCcw className="h-3 w-3" />
                        Atualizado às {lastUpdate.toLocaleTimeString()}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Monitorando atividades da ordem de serviço atual.
                  </CardDescription>
                </CardHeader>
                <Separator className="bg-primary/10" />
                <CardContent className="pt-4">
                  {checklistAtivo.length > 0 ? (
                    <div className="space-y-4">
                      {checklistAtivo.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-start gap-3 p-3 rounded-md transition-colors ${item.estado ? 'bg-green-500/10 border border-green-500/20' : 'bg-background border border-border'}`}
                        >
                          {/* Ícone de Check */}
                          <div className="mt-0.5">
                            {item.estado ? (
                              <CheckSquare className="h-5 w-5 text-green-600" />
                            ) : (
                              <Square className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <p className={`font-medium text-sm ${item.estado ? 'text-green-900 dark:text-green-100' : ''}`}>
                                {item.nomeChecklist}
                              </p>
                              {item.estado && (
                                <Badge variant="secondary" className="text-[10px] h-5 bg-green-200 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300">
                                  Concluído
                                </Badge>
                              )}
                            </div>
                            
                            {/* Observação */}
                            {item.observacao && (
                              <p className="text-xs text-muted-foreground bg-black/5 dark:bg-white/5 p-2 rounded mt-1">
                                <span className="font-semibold">Obs:</span> {item.observacao}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground space-y-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <p className="text-sm">Aguardando início das atividades...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* CARD 3: FICHA TÉCNICA */}
            <Card>
              <CardHeader>
                <CardTitle>Ficha Técnica</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Settings2 className="h-6 w-6 text-primary" />
                  <div>
                    <Label className="text-xs">Compressor</Label>
                    <p className="font-semibold">{equipamento.modeloCompressor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wind className="h-6 w-6 text-primary" />
                  <div>
                    <Label className="text-xs">Gás</Label>
                    <p className="font-semibold">{equipamento.tipoGas}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Droplet className="h-6 w-6 text-primary" />
                  <div>
                    <Label className="text-xs">Óleo</Label>
                    <p className="font-semibold">{equipamento.tipoOleo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Bolt className="h-6 w-6 text-primary" />
                  <div>
                    <Label className="text-xs">Tensão</Label>
                    <p className="font-semibold">{equipamento.tensao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
          
          {/* COLUNA DIREITA (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Atividade</CardTitle>
                <CardDescription>Últimas 3 intervenções</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {historico.length > 0 ? (
                  historico.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <History className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.tipo} ({item.status})</p>
                        <p className="text-sm text-muted-foreground">{item.data} - por {item.tecnico}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum histórico de manutenção encontrado.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* MODAL / DIALOG */}
      <DialogContent className="sm:max-w-2xl">
        {modalContent === 'cliente' && (
          <FormChecklistCliente 
            equipamentoId={equipamento.id} 
            onClose={closeModal} 
            onSuccess={handleModalSuccess} 
          />
        )}
        {modalContent === 'corretiva' && (
          <FormChecklistManutentorCorretiva 
            equipamentoId={equipamento.id} 
            onClose={closeModal} 
            onSuccess={handleModalSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}