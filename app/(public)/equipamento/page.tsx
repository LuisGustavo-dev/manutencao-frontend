'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation'; // Importado usePathname
import { mockEquipamentos, mockOrdensServico } from '@/lib/mock-data';

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
  Loader2 // Importado Loader2
} from "lucide-react";
import toast from 'react-hot-toast'; 

import { FormChecklistCliente } from './components/FormChecklistCliente';
import { FormChecklistManutentorCorretiva } from './components/FormChecklistManutentorCorretiva';

// (Mocks locais para a página funcionar - como no seu código)
function useAuthRole() { 
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => { setRole(localStorage.getItem('user_role')); }, []);
  return role;
}
function useEquipmentStatus(id: string | null) {
  const eq = mockEquipamentos.find(e => e.id === id);
  const [status, setStatus] = useState(eq?.statusManutencao || 'Disponível'); 
  useEffect(() => {
    if (id) {
      const storedStatus = localStorage.getItem(`status_${id}`);
      if (storedStatus) setStatus(storedStatus as any);
    }
  }, [id]);
  const updateStatus = (newStatus: 'Disponível' | 'Manutencao') => { 
    if (id) {
      localStorage.setItem(`status_${id}`, newStatus);
      setStatus(newStatus);
    }
  };
  return { status, updateStatus };
}
const mockHistorico = [
  { id: 1, data: "02/11/25", tipo: "Corretiva", tecnico: "Luis G.", status: "Concluída" },
  { id: 2, data: "28/10/25", tipo: "Preventiva", tecnico: "Ana S.", status: "Concluída" },
  { id: 3, data: "25/10/25", tipo: "Corretiva", tecnico: "Cliente", status: "Aberta" },
];
// (Fim dos Mocks)


export default function EquipamentoPageWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
      <EquipamentoPage />
    </Suspense>
  );
}

function EquipamentoPage() {
  const searchParams = useSearchParams();
  const router = useRouter(); 
  const pathname = usePathname(); // Hook para detectar mudança de página
  const id = searchParams.get('id');
  
  const userRole = useAuthRole();
  const { status, updateStatus } = useEquipmentStatus(id);

  const equipamento = mockEquipamentos.find((e) => e.id === id);
  const osAtiva = mockOrdensServico.find(os => os.equipamentoId === id && os.status !== 'Concluída');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'cliente' | 'corretiva' | null>(null);
  
  // Estado de loading para navegação
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // Limpa o loading quando a nova página carregar
  useEffect(() => {
    setLoadingPath(null);
  }, [pathname]);

  // Função wrapper para navegação com loading
  const handleNavigate = (path: string) => {
    if (loadingPath === path) return; // Já está carregando
    setLoadingPath(path);
    router.push(path);
  };

  const openModal = (type: 'cliente' | 'corretiva') => {
    setModalContent(type);
    setIsModalOpen(true);
  };

  const handleSolicitarManutencao = () => {
    updateStatus('Manutencao'); // Corrigido
    toast.success('Chamado aberto! Em breve um técnico será notificado.');
    setIsModalOpen(false);
  };

  const handleConcluirManutencao = () => {
    updateStatus('Disponível');
    toast.success('Manutenção concluída! O equipamento foi liberado.');
    setIsModalOpen(false);
  };

  if (!equipamento) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold">Equipamento não encontrado.</h1>
      </main>
    );
  }

  // Define os paths de navegação
  const clientePath = `/dashboard/cliente/ordens-servico-detalhe?id=${osAtiva?.id}`;
  const manutentorPath = `/dashboard/manutentor/ordens-servico-detalhe?id=${osAtiva?.id}`; // Exemplo
  const historicoPath = `/dashboard/${userRole?.toLowerCase()}/equipamentos/historico?id=${equipamento.id}`; // Exemplo
  
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        
        <div className="space-y-2">
          <Badge>{equipamento.tipo}</Badge>
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
                {userRole === 'Cliente' && (
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
                        onClick={() => handleNavigate(clientePath)}
                        disabled={loadingPath === clientePath}
                      >
                        {loadingPath === clientePath ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <History className="mr-2 h-5 w-5" />
                        )}
                        Acompanhar Chamado (OS: {osAtiva?.id})
                      </Button>
                    )}
                  </>
                )}

                {(userRole === 'Manutentor' || userRole === 'Admin') && (
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    {status === 'Manutencao' ? ( // Corrigido
                      <Button variant="destructive" size="lg" className="flex-1" onClick={() => openModal('corretiva')}>
                        <HardHat className="mr-2 h-5 w-5" /> Realizar Manutenção (OS: {osAtiva?.id})
                      </Button>
                    ) : (
                      <Button variant="secondary" size="lg" className="flex-1" onClick={() => openModal('corretiva')}>
                        <Wrench className="mr-2 h-5 w-5" /> Iniciar Nova Manutenção Corretiva
                      </Button>
                    )}
                  </div>
                )}
                
                {!userRole && (
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
                {mockHistorico.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <History className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.tipo} ({item.status})</p>
                      <p className="text-sm text-muted-foreground">{item.data} - por {item.tecnico}</p>
                    </div>
                  </div>
                ))}
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
      
      <DialogContent className="sm:max-w-2xl">
        {modalContent === 'cliente' && <FormChecklistCliente onSubmit={handleSolicitarManutencao} />}
        {modalContent === 'corretiva' && <FormChecklistManutentorCorretiva onSubmit={handleConcluirManutencao} />}
      </DialogContent>
    </Dialog>
  );
}