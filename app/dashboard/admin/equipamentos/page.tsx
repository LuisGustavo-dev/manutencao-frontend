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
import { EditEquipmentModalContent } from './components/EditEquipmentModalContent';
import { HistoryModalContent } from './components/HistoryModalContent';
import { NewEquipmentModalContent } from './components/NewEquipmentModalContent';

export default function AdminEquipamentosPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter(); 
  const { token } = useAuth(); // <-- Pega o token para a API

  // --- ESTADOS DA API ---
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchToggle, setRefetchToggle] = useState(false); // Gatilho

  type ModalType = 'qr' | 'edit' | 'history' | 'new' | null;
  const [modalState, setModalState] = useState<{
    type: ModalType;
    equipment: Equipamento | null;
  }>({ type: null, equipment: null });

  // --- CARREGA DADOS DA API ---
  useEffect(() => {
    setBaseUrl(window.location.origin);

    if (!token) {
      if(token === null) setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Busca equipamentos e clientes em paralelo
        const [equipResponse, clientesResponse] = await Promise.all([
          fetch('http://localhost:3340/equipamento', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:3340/user/clientes', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!equipResponse.ok) throw new Error('Falha ao buscar equipamentos');
        if (!clientesResponse.ok) throw new Error('Falha ao buscar clientes');

        const equipData = await equipResponse.json();
        const clientesData = await clientesResponse.json();

        // 1. "Tradução" dos Clientes (para os modais)
        const transformedClientes: Cliente[] = clientesData.map((user: any) => ({
          id: String(user.user_id),
          nomeFantasia: user.user_name,
          razaoSocial: user.user_razaoSocial || 'N/A',
          cnpj: user.user_cnpj || 'N/A',
        }));
        setClientes(transformedClientes);

        // 2. "Tradução" dos Equipamentos (para os cards)
        const transformedEquipamentos: Equipamento[] = equipData.map((apiEq: any) => {
          const statusManutencao: 'Disponível' | 'Manutencao' = 
            apiEq.status === 'disponivel' ? 'Disponível' : 'Manutencao';
          
          return {
            id: String(apiEq.id),
            clienteId: apiEq.user ? String(apiEq.user.id) : null,
            statusManutencao: statusManutencao,
            modeloCompressor: apiEq.modeloCompressor || 'N/A',
            tipoGas: apiEq.tipoGas || 'N/A',
            tipoOleo: apiEq.tipoOleo || 'N/A',
            tensao: String(apiEq.tensao) + 'V',
            aplicacao: apiEq.aplicacao || 'N/A',
            
            // Campos "Polyfill" (API não envia, mas o tipo/frontend precisa)
            nome: apiEq.modeloCompressor || `Equipamento #${apiEq.id}`, // Usa o compressor como "nome"
            tipo: apiEq.tipo || 'Climatização', // <-- TODO: API precisa enviar 'tipo'
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

    fetchAllData();
  }, [token, refetchToggle]); // Recarrega se o token ou o gatilho mudarem

  // --- FILTRO ATUALIZADO (useMemo) ---
  const filteredEquipamentos = useMemo(() => {
    return equipamentos.filter(eq => {
      const status = typeof window !== 'undefined' ? 
                       localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao : 
                       eq.statusManutencao;
      
      // Encontra o nome do cliente no estado 'clientes'
      const clienteNome = clientes.find(c => c.id === eq.clienteId)?.nomeFantasia || '';
      
      const statusMatch = statusFilter === 'all' || status === statusFilter;
      
      // Pesquisa por ID, Tipo, Compressor ou Nome do Cliente
      const searchMatch = searchTerm === '' ||
        eq.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        eq.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.modeloCompressor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clienteNome && clienteNome.toLowerCase().includes(searchTerm.toLowerCase()));
        
      return statusMatch && searchMatch;
    });
  }, [equipamentos, clientes, searchTerm, statusFilter]); // <-- Depende dos clientes e equipamentos

  const openModal = (type: ModalType, equipment: Equipamento) => {
    setModalState({ type, equipment });
  };
  
  // O modal agora dispara o refetch
  const closeModalAndRefetch = () => {
    setModalState({ type: null, equipment: null });
    setRefetchToggle(prev => !prev); // Dispara o useEffect
  };
  
  const closeModal = () => {
     setModalState({ type: null, equipment: null });
  }

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
      {/* 1. CABEÇALHO DA PÁGINA (com botão "Novo") */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Equipamentos (Admin)</h2>
          <p className="text-muted-foreground">
            Gerencie, edite e monitore todo o inventário de equipamentos.
          </p>
        </div>
        
        <Button onClick={() => setModalState({ type: 'new', equipment: null })}>
          + Novo Equipamento
        </Button>
      </div>

      {/* 2. BARRA DE FILTRO E PESQUISA */}
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar por ID, tipo, compressor, cliente..." // <-- ATUALIZADO
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
      
      {/* 3. GRID DE EQUIPAMENTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipamentos.map((eq) => {
          const status = typeof window !== 'undefined' ? 
                           localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao : 
                           eq.statusManutencao;
          const cliente = clientes.find(c => c.id === eq.clienteId); // <-- Usa o estado 'clientes'

          return (
            <Card key={eq.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  
                  {/* --- ATUALIZADO: Título e Descrição --- */}
                  <CardTitle className="truncate">Equipamento #{eq.id}</CardTitle>
                  {/* <CardDescription>ID: {eq.id}</CardDescription> */}
                  
                  <CardDescription className="flex items-center gap-2 mt-2">
                    {cliente ? (
                      <>
                        <Package className="h-4 w-4" /> {cliente.nomeFantasia}
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

                  {/* Dropdown Menu (Admin/Manutentor) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openModal('edit', eq)}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
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

        {/* --- ATUALIZADO: Mensagem de "nenhum resultado" --- */}
        {!isLoading && filteredEquipamentos.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-12">
            <Package className="h-10 w-10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum equipamento encontrado</h3>
            <p>Não há equipamentos cadastrados ou eles não correspondem ao filtro.</p>
          </div>
        )}
      </div>

      {/* RENDERIZAÇÃO DO DIALOG GLOBAL */}
      <Dialog open={!!modalState.type} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-xl">
          {modalState.type === 'qr' && modalState.equipment && (
            <QrCodeModalContent 
              equipmentName={modalState.equipment.tipo} // <-- (Nome para o arquivo)
              equipmentId={modalState.equipment.id} // <-- PROP NOVA
              onClose={closeModal} 
            />
          )}
          {modalState.type === 'edit' && modalState.equipment && (
            <EditEquipmentModalContent 
              equipment={modalState.equipment}
              clientes={clientes} // <-- Passa clientes da API
              onClose={closeModalAndRefetch} // <-- Atualiza ao fechar
            />
          )}
          {modalState.type === 'history' && modalState.equipment && (
            <HistoryModalContent 
              equipmentName={modalState.equipment.tipo} // <-- Usa o 'tipo'
              equipmentId={modalState.equipment.id}
              token={token || ''}
            />
          )}
          {modalState.type === 'new' && (
            <NewEquipmentModalContent 
              clientes={clientes} // <-- Passa clientes da API
              onClose={closeModalAndRefetch} // <-- Atualiza ao fechar
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}