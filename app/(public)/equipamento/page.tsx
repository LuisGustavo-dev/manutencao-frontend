'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// import { mockEquipamentos, mockOrdensServico, mockHistorico } from '@/lib/mock-data'; // <-- MOCKS REMOVIDOS
import type { Equipamento } from '@/lib/mock-data'; // <-- Importa o TIPO
import { useAuth } from '@/app/contexts/authContext'; // <-- Importa o Auth real

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
import { 
  HardHat, 
  Wrench, 
  Settings2,
  Droplet,
  Wind,
  Bolt,
  Archive,
  History,
  CheckCircle,
  AlertCircle,
  Loader2 
} from "lucide-react";
import toast from 'react-hot-toast'; 

import { FormChecklistCliente } from './components/FormChecklistCliente';
import { FormChecklistManutentorCorretiva } from './components/FormChecklistManutentorCorretiva';
import Link from 'next/link';

// --- TIPO PARA O HISTÓRICO VINDO DA API ---
type ApiHistoricoItem = {
  id: number;
  data: string;
  tipo: string;
  tecnico: string; // API não fornece, será 'N/A'
  status: string;
};


export default function EquipamentoPageWrapper() {
  return (
    // O Suspense é necessário para useSearchParams()
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <EquipamentoPage />
    </Suspense>
  );
}

function EquipamentoPage() {
  const searchParams = useSearchParams();
  const router = useRouter(); 
  const pathname = usePathname(); 
  const id = searchParams.get('id');
  
  const { role, token } = useAuth(); // <-- Usa o Auth real

  // --- ESTADOS VINDOS DA API ---
  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [historico, setHistorico] = useState<ApiHistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ESTADO DE STATUS LOCAL ---
  const [status, setStatus] = useState<'Disponível' | 'Manutencao' | null>(null);

  // --- 1. GATILHO PARA RECARREGAR OS DADOS ---
  const [refetchToggle, setRefetchToggle] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'cliente' | 'corretiva' | null>(null);
  
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // --- FETCH DOS DADOS ---
  useEffect(() => {
    if (!id || !token) {
      setIsLoading(false);
      setError("ID do equipamento ou token de autenticação não encontrado.");
      return;
    }

    const fetchData = async () => {
      // (Não reseta o loading se for apenas um refetch, para evitar piscar a tela)
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

        // --- TRANSFORMAÇÃO DOS DADOS DA API ---
        
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
          
          // --- CAMPOS FALTANTES (Valores Padrão) ---
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
        
        // --- ATUALIZADO: Define o status com base nos dados da API ---
        // (Remove a lógica antiga do localStorage)
        setStatus(statusManutencao);

      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados.");
        toast.error(err.message || "Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, token, refetchToggle]); // <-- 2. GATILHO ADICIONADO AO ARRAY

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

  // --- 3. NOVA FUNÇÃO DE CALLBACK ---
  // Esta função é passada para os modais. 
  // O modal fará a chamada da API, e ao ter sucesso, chamará esta função.
  const handleModalSuccess = () => {
    closeModal(); // Fecha o modal
    setRefetchToggle(prev => !prev); // 4. Dispara o refetch dos dados
  };

  // --- 5. FUNÇÕES ANTIGAS REMOVIDAS ---
  // const handleSolicitarManutencao = () => { ... }; // <-- REMOVIDA
  // const handleConcluirManutencao = () => { ... }; // <-- REMOVIDA

  // --- RENDERIZAÇÃO DE LOADING E ERRO ---
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
  // --- FIM DA RENDERIZAÇÃO DE LOADING E ERRO ---

  const osAtiva = status === 'Manutencao'; 
  const historicoPath = `/dashboard/${role?.toLowerCase()}/equipamentos/historico?id=${equipamento.id}`; 
  
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{equipamento.nome}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
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
                    {status === 'Disponível' ? (
                      <Button variant="destructive" size="lg" className="w-full" onClick={() => openModal('cliente')}>
                        <AlertCircle className="mr-2 h-5 w-5" /> Solicitar Manutenção Corretiva
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full" 
                        onClick={() => alert('Navegar para OS Ativa (Cliente)')} 
                        disabled={loadingPath === 'clientePath'}
                      >
                        {loadingPath === 'clientePath' ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <History className="mr-2 h-5 w-5" />
                        )}
                        Acompanhar Chamado Ativo
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

            <Card>
              <CardHeader>
                <CardTitle>Ficha Técnica</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                <div className="flex items-center gap-3">
                  <Archive className="h-6 w-6 text-primary" />
                  <div>
                    <Label className="text-xs">Aplicação</Label>
                    <p className="font-semibold">{equipamento.aplicacao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
          
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

                <Separator />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleNavigate(historicoPath)}
                  disabled={loadingPath === historicoPath}
                >
                  {loadingPath === historicoPath ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <History className="mr-2 h-4 w-4" />
                  )}
                  Ver Histórico Completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* --- 6. ATUALIZAÇÃO DA CHAMADA DO MODAL --- */}
      <DialogContent className="sm:max-w-2xl">
        {modalContent === 'cliente' && (
          <FormChecklistCliente 
            equipamentoId={equipamento.id} // <-- 1. Passa o ID
            onClose={closeModal}             // <-- 2. Passa a função de fechar
            onSuccess={handleModalSuccess}   // <-- 3. Passa a nova função de sucesso
          />
        )}
        {modalContent === 'corretiva' && (
          <FormChecklistManutentorCorretiva 
            equipamentoId={equipamento.id} // <-- 1. Passe o ID do equipamento
            onClose={closeModal}           // <-- 2. Passe a função de fechar
            onSuccess={handleModalSuccess} // <-- 3. Passe a função de sucesso
          />
        )}
      </DialogContent>
    </Dialog>
  );
}