'use client';
import { useState, useEffect, useMemo } from 'react';
// import { mockEquipamentos, mockClientes } from '@/lib/mock-data'; // <-- REMOVIDO
import type { Equipamento, Cliente } from '@/lib/mock-data'; // <-- Tipos ainda são usados
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { 
  Search,
  Settings2,
  Droplet,
  Wind,
  Bolt,
  MoreVertical,
  QrCode,
  Pencil,
  History,
  Package,
  Loader2 // <-- ADICIONADO
} from 'lucide-react';
import { useAuth } from '@/app/contexts/authContext'; // <-- ADICIONADO
import toast from 'react-hot-toast'; // <-- ADICIONADO

// Importa os componentes de modal do DIRETÓRIO LOCAL
import { QrCodeModalContent } from './components/QrCodeModalContent';
// import { EditEquipmentModalContent } from './components/EditEquipmentModalContent'; // Manutentor não edita
import { HistoryModalContent } from './components/HistoryModalContent';

// --- 1. NOVO TIPO: Anexa o clienteNome ao Equipamento ---
type EnrichedEquipamento = Equipamento & {
  clienteNome: string | null;
};

export default function ManutentorEquipamentosPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();
  const { token } = useAuth(); // <-- Pega o token para a API

  // --- 2. ESTADOS DA API ATUALIZADOS ---
  const [equipamentos, setEquipamentos] = useState<EnrichedEquipamento[]>([]); // <-- Usa o novo tipo
  // const [clientes, setClientes] = useState<Cliente[]>([]); // <-- REMOVIDO
  const [isLoading, setIsLoading] = useState(true);

  type ModalType = 'qr' | 'edit' | 'history' | null;
  const [modalState, setModalState] = useState<{
    type: ModalType;
    equipment: EnrichedEquipamento | null; // <-- Usa o novo tipo
  }>({ type: null, equipment: null });

  // --- 3. CARREGA DADOS DA API (OTIMIZADO) ---
  useEffect(() => {
    setBaseUrl(window.location.origin);

    if (!token) {
      if(token === null) setIsLoading(false);
      return;
    }

    const fetchEquipamentos = async () => {
      setIsLoading(true);
      try {
        // Busca apenas os equipamentos (a info do cliente já vem nela)
        const equipResponse = await fetch('http://localhost:3340/equipamento', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!equipResponse.ok) throw new Error('Falha ao buscar equipamentos');

        const equipData = await equipResponse.json();
        
        // "Tradução" dos Equipamentos
        const transformedEquipamentos: EnrichedEquipamento[] = equipData.map((apiEq: any) => {
          const statusManutencao: 'Disponível' | 'Manutencao' = 
            apiEq.status === 'disponivel' ? 'Disponível' : 'Manutencao';
          
          return {
            id: String(apiEq.id),
            clienteId: apiEq.user ? String(apiEq.user.id) : null,
            clienteNome: apiEq.user ? apiEq.user.name : null, // <-- DADO ADICIONADO AQUI
            statusManutencao: statusManutencao,
            modeloCompressor: apiEq.modeloCompressor || 'N/A',
            tipoGas: apiEq.tipoGas || 'N/A',
            tipoOleo: apiEq.tipoOleo || 'N/A',
            tensao: String(apiEq.tensao) || 'N/A',
            aplicacao: apiEq.aplicacao || 'N/A',
            
            // Campos "Polyfill" (para o tipo Equipamento)
            nome: apiEq.nome || `Equipamento #${apiEq.id}`, 
            tipo: apiEq.tipo || 'Climatização', 
            tipoCondensador: apiEq.tipoCondensador || 'N/A',
            tipoEvaporador: apiEq.tipoEvaporador || 'N/A',
            valvulaExpansao: apiEq.valvulaExpansao || 'N/A',
          };
        });
        setEquipamentos(transformedEquipamentos);

      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipamentos();
  }, [token]); // Recarrega se o token mudar

  // --- 4. FILTRO ATUALIZADO (useMemo) ---
  const filteredEquipamentos = useMemo(() => {
    return equipamentos.filter(eq => {
      const status = typeof window !== 'undefined' ? 
                       localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao : 
                       eq.statusManutencao;
      
      const clienteNome = eq.clienteNome || ''; // <-- Busca o nome direto do objeto 'eq'
      
      const statusMatch = statusFilter === 'all' || status === statusFilter;
      
      const searchMatch = searchTerm === '' ||
        eq.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        eq.tipo.toLowerCase().includes(searchTerm.toLowerCase()) || // (Ainda usa 'tipo' do polyfill)
        eq.modeloCompressor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
        
      return statusMatch && searchMatch;
    });
  }, [equipamentos, searchTerm, statusFilter]); // <-- 'clientes' removido das dependências

  const openModal = (type: ModalType, equipment: EnrichedEquipamento) => { // <-- Usa o novo tipo
    setModalState({ type, equipment });
  };
  const closeModal = () => {
    setModalState({ type: null, equipment: null });
  };

  // --- RENDERIZAÇÃO DE LOADING ---
  if (isLoading) {
     return (
       <div className="flex justify-center items-center py-20">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="ml-3 text-muted-foreground">Carregando equipamentos...</p>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO DA PÁGINA (SEM o botão "Novo") */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Equipamentos</h2>
          <p className="text-muted-foreground">
            Visualize o inventário de equipamentos dos clientes.
          </p>
        </div>
      </div>

      {/* 2. BARRA DE FILTRO E PESQUISA (Idêntica) */}
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar por ID, tipo, compressor, cliente..." 
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
      
      {/* 3. GRID DE EQUIPAMENTOS (Idêntico ao do Admin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipamentos.map((eq) => {
          const status = typeof window !== 'undefined' ? 
                           localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao : 
                           eq.statusManutencao;
          
          // --- 5. RENDERIZAÇÃO ATUALIZADA ---
          // const cliente = clientes.find(c => c.id === eq.clienteId); // <-- REMOVIDO

          return (
            <Card key={eq.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="truncate">{eq.tipo}</CardTitle>
                  <CardDescription>ID: {eq.id}</CardDescription>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    {/* --- Usa eq.clienteNome diretamente --- */}
                    {eq.clienteNome ? (
                      <>
                        <Package className="h-4 w-4" /> {eq.clienteNome}
                      </>
                    ) : (
                      <span className="text-yellow-600">Sem cliente (Estoque)</span>
                    )}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  {status === 'Disponível' ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">Disponível</Badge>
                  ) : (
                    <Badge variant="destructive">Em Manutenção</Badge>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openModal('qr', eq)}>
                        <QrCode className="mr-2 h-4 w-4" /> Ver QR Code
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openModal('history', eq)}>
                        <History className="mr-2 h-4 w-4" /> Ver Histórico
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-muted-foreground" /><span className="truncate" title={eq.modeloCompressor}>{eq.modeloCompressor}</span></div>
                <div className="flex items-center gap-2"><Wind className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tipoGas}</span></div>
                <div className="flex items-center gap-2"><Droplet className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tipoOleo}</span></div>
                <div className="flex items-center gap-2"><Bolt className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tensao}</span></div>
              </CardContent>
            </Card>
          );
        })}

        {!isLoading && filteredEquipamentos.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-12">
            <Package className="h-10 w-10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum equipamento encontrado</h3>
            <p>Não há equipamentos cadastrados ou eles não correspondem ao filtro.</p>
          </div>
        )}
      </div>

      {/* RENDERIZAÇÃO DO DIALOG GLOBAL (Pode ter menos modais, ex: sem 'edit') */}
      <Dialog open={!!modalState.type} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-xl">
          {modalState.type === 'qr' && modalState.equipment && (
            <QrCodeModalContent 
              equipmentName={modalState.equipment.tipo}
              equipmentId={modalState.equipment.id} 
              onClose={closeModal} 
            />
          )}
          {/* O Manutentor não tem o modal 'edit' */}
          {modalState.type === 'history' && modalState.equipment && (
            <HistoryModalContent 
              equipmentName={modalState.equipment.tipo}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}