'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas'; // <--- Biblioteca de assinatura
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // <--- Shadcn Dialog
import { useAuth } from '@/app/contexts/authContext';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, 
  Search,
  Settings2,
  Droplet,
  Wind,
  Bolt,
  Package,
  Loader2,
  PenTool, // Icone para assinatura
  Eraser,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast'; 

// --- TIPAGENS ATUALIZADAS ---
type Chamado = {
  id: number;
  tipo: string;
  status: string;
  horaFinalizacao?: string | null;
};

// Estendendo o tipo Equipamento para incluir os dados necessários para a lógica
interface EquipamentoEstendido {
  id: string;
  clienteId: string | null;
  nome: string;
  tipo: string;
  tipoCondensador: string;
  tipoEvaporador: string;
  valvulaExpansao: string;
  statusManutencao: 'Disponível' | 'Manutencao';
  modeloCompressor: string;
  tipoGas: string;
  tipoOleo: string;
  tensao: string;
  aplicacao: string;
  // Novos campos para lógica de assinatura
  requiresSubscription: boolean;
  chamadoPendenteAssinatura: Chamado | null; 
}

export default function ClienteEquipamentosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user, token } = useAuth(); 
  const router = useRouter();

  const [equipamentos, setEquipamentos] = useState<EquipamentoEstendido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ESTADOS PARA O MODAL DE ASSINATURA ---
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [chamadoParaAssinar, setChamadoParaAssinar] = useState<number | null>(null);
  const [isSendingSignature, setIsSendingSignature] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    const fetchEquipamentos = async () => {
      if (!token) {
        setIsLoading(false);
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3340/equipamento', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar equipamentos');
        }

        const dataFromApi = await response.json();

        const transformedData: EquipamentoEstendido[] = dataFromApi.map((apiEq: any) => {
          const statusManutencao: 'Disponível' | 'Manutencao' = 
            apiEq.status === 'manutencao' ? 'Manutencao' : 'Disponível';
          
          // Lógica para encontrar chamado que precisa de assinatura
          // 1. O usuário (empresa) requer assinatura?
          const requiresSubscription = apiEq.user?.requiresSubscription === true;
          
          // 2. Existe algum chamado "Em andamento" E com "horaFinalizacao"?
          let chamadoPendente = null;
          if (apiEq.chamados && Array.isArray(apiEq.chamados)) {
            chamadoPendente = apiEq.chamados.find((c: any) => 
              c.status === 'Em andamento' && c.horaFinalizacao != null
            ) || null;
          }

          return {
            id: String(apiEq.id),
            clienteId: apiEq.user ? String(apiEq.user.id) : null,
            nome: apiEq.nome || 'Equipamento s/ nome', 
            tipo: apiEq.tipo || 'Climatização',
            tipoCondensador: apiEq.tipoCondensador || 'N/A',
            tipoEvaporador: apiEq.tipoEvaporador || 'N/A',
            valvulaExpansao: apiEq.valvulaExpansao || 'N/A',
            statusManutencao: statusManutencao,
            modeloCompressor: apiEq.modeloCompressor || 'N/A',
            tipoGas: apiEq.tipoGas || 'N/A',
            tipoOleo: apiEq.tipoOleo || 'N/A',
            tensao: String(apiEq.tensao) + 'V', 
            aplicacao: apiEq.aplicacao || 'N/A',
            // Novos campos mapeados
            requiresSubscription: requiresSubscription,
            chamadoPendenteAssinatura: chamadoPendente
          };
        });

        setEquipamentos(transformedData);

      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipamentos();
  }, [token]); 

  // --- LÓGICA DE FILTRO ---
  const filteredEquipamentos = useMemo(() => {
    return equipamentos.filter(eq => {
      const status = typeof window !== 'undefined' ? 
                     localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao : 
                     eq.statusManutencao;
      
      const statusMatch = statusFilter === 'all' || status === statusFilter;
      
      const searchMatch = searchTerm === '' ||
        eq.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        eq.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.modeloCompressor.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [equipamentos, searchTerm, statusFilter]);

  const handleClientAction = (id: string) => {
    router.push(`/equipamento?id=${id}`);
  };

  // --- FUNÇÕES DE ASSINATURA ---
  const openSignatureModal = (chamadoId: number) => {
    setChamadoParaAssinar(chamadoId);
    setIsSignModalOpen(true);
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const submitSignature = async () => {
    // 1. Verifica se está vazio
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Por favor, assine antes de enviar.");
      return;
    }

    if (!chamadoParaAssinar) return;

    // --- CORREÇÃO AQUI ---
    // Removemos o .getTrimmedCanvas() pois ele quebra no Next.js
    // Usamos .getCanvas() para pegar a imagem completa (com fundo transparente)
    const signatureDataUrl = sigCanvas.current?.getCanvas().toDataURL('image/png');

    setIsSendingSignature(true);
    try {
      const response = await fetch(`http://localhost:3340/chamado/${chamadoParaAssinar}/assinar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assinatura: signatureDataUrl })
      });

      if (!response.ok) throw new Error("Erro ao enviar assinatura");

      toast.success("Assinatura enviada com sucesso!");
      setIsSignModalOpen(false);
      
      // Opcional: Atualizar a página ou lista para sumir o botão
      // window.location.reload(); 

    } catch (error) {
      toast.error("Erro ao salvar assinatura.");
      console.error(error);
    } finally {
      setIsSendingSignature(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Carregando seus equipamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meus Equipamentos</h2>
          <p className="text-muted-foreground">Monitore e solicite manutenção para seus equipamentos.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar por ID, tipo..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Disponível">Disponível</SelectItem>
              <SelectItem value="Manutencao">Em Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipamentos.map((eq) => {
          const status = typeof window !== 'undefined' ? 
                         localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao : 
                         eq.statusManutencao;

          // Verifica se precisa mostrar o botão de assinatura
          const showSignatureButton = eq.requiresSubscription && eq.chamadoPendenteAssinatura;

          return (
            <Card key={eq.id} className="flex flex-col hover:shadow-lg transition-shadow border-l-4 border-l-transparent hover:border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="truncate">Equipamento #{eq.id}</CardTitle>
                    <CardDescription>{eq.aplicacao}</CardDescription>
                  </div>
                  {status === 'Disponível' ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">Disponível</Badge>
                  ) : (
                    <Badge variant="destructive">Manutenção</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-muted-foreground" /><span className="truncate" title={eq.modeloCompressor}>{eq.modeloCompressor}</span></div>
                <div className="flex items-center gap-2"><Wind className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tipoGas}</span></div>
                <div className="flex items-center gap-2"><Droplet className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tipoOleo}</span></div>
                <div className="flex items-center gap-2"><Bolt className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tensao}</span></div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                {/* BOTÃO DE ASSINATURA (PRIORIDADE) */}
                {showSignatureButton ? (
                   <Button 
                     variant="default" 
                     className="w-full bg-blue-600 hover:bg-blue-700 animate-pulse"
                     onClick={() => openSignatureModal(eq.chamadoPendenteAssinatura!.id)}
                   >
                     <PenTool className="mr-2 h-4 w-4" />
                     Assinar Entrega Técnica
                   </Button>
                ) : (
                  // LÓGICA PADRÃO DOS BOTÕES
                  status === 'Disponível' ? (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleClientAction(eq.id)}
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Solicitar Manutenção
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleClientAction(eq.id)}
                    >
                      Ver Status do Chamado
                    </Button>
                  )
                )}
              </CardFooter>
            </Card>
          );
        })}

        {!isLoading && filteredEquipamentos.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-12">
            <Package className="h-10 w-10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum equipamento encontrado</h3>
          </div>
        )}
      </div>

      {/* --- MODAL DE ASSINATURA --- */}
      <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assinatura do Cliente</DialogTitle>
            <DialogDescription>
              Por favor, assine abaixo para confirmar a finalização do serviço técnico.
            </DialogDescription>
          </DialogHeader>
          
          <div className="border-2 border-dashed border-gray-300 rounded-md bg-gray-50 flex justify-center items-center mt-2">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 400, 
                height: 200, 
                className: 'cursor-crosshair'
              }} 
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">Desenhe sua assinatura acima</p>

          <DialogFooter className="sm:justify-between flex-row items-center gap-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={clearSignature}
              className="gap-2"
            >
              <Eraser className="h-4 w-4" /> Limpar
            </Button>
            
            <Button 
              type="button" 
              onClick={submitSignature}
              disabled={isSendingSignature}
              className="gap-2"
            >
              {isSendingSignature ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirmar e Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}