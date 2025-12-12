'use client';

import { useEffect, useState, useMemo } from 'react';
import type { OrdemServico, Tecnico } from '@/lib/mock-data'; 
import { useAuth } from '@/app/contexts/authContext';

// Importa os componentes do diretório LOCAL
import { OsPageHeader } from './components/OsPageHeader';
import { OsKpiCards } from './components/OsKpiCards';
import { OsFilterBar } from './components/OsFilterBar';
import { OrderDetails } from './components/OrderDetails';

import { Loader2, Calendar, User, Wrench, MoreVertical, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

// Componentes de UI
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type EnrichedOS = OrdemServico & {
  equipamentoNome: string;
  tecnicoNome: string | null;
  clienteNome: string | null; 
};

export default function AdminOrdensServicoPage() {
  const { role, token } = useAuth(); 

  // --- Estados de Dados ---
  const [allOrdens, setAllOrdens] = useState<EnrichedOS[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');

  // --- Estados do Modal de Detalhes (Visualização) ---
  const [selectedOsId, setSelectedOsId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // --- NOVOS ESTADOS: Modal de Atribuição de Técnico ---
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [osIdToAssign, setOsIdToAssign] = useState<string | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // --- GATILHO PARA RECARREGAR OS DADOS ---
  const [refetchToggle, setRefetchToggle] = useState(false);
  const triggerRefetch = () => setRefetchToggle(prev => !prev);

  // --- Função para abrir o modal de detalhes ---
  const handleOpenDetails = (osId: string) => {
    setSelectedOsId(osId);
    setIsDetailsOpen(true);
  };

  // --- NOVA FUNÇÃO: Abrir modal de atribuição ---
  const handleOpenAssignModal = (osId: string) => {
    setOsIdToAssign(osId);
    setSelectedTechId(''); // Reseta seleção anterior
    setIsAssignModalOpen(true);
  };

  // --- NOVA FUNÇÃO: Executar a atribuição na API ---
  const handleAssignTechnician = async () => {
    if (!osIdToAssign || !selectedTechId) {
        toast.error("Selecione um técnico.");
        return;
    }

    setIsAssigning(true);
    try {
        // Rota: chamado/atribuir-tecnico/tecnico/:tecnicoID/chamado/:chamadoID
        const response = await fetch(`http://localhost:3340/chamado/atribuir-tecnico/tecnico/${selectedTechId}/chamado/${osIdToAssign}`, {
            method: 'POST', 
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao atribuir técnico.');
        }

        toast.success("Técnico atribuído com sucesso!");
        setIsAssignModalOpen(false); // Fecha o modal
        triggerRefetch(); // Recarrega a lista para mostrar o novo técnico na tabela

    } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Erro ao conectar com o servidor.");
    } finally {
        setIsAssigning(false);
    }
  };

  // --- BUSCAR TUDO ---
  useEffect(() => {
    if (!token) {
      if (token === null) setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [ordensResponse, tecnicosResponse] = await Promise.all([
          fetch('http://localhost:3340/chamado', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://localhost:3340/user/tecnicos', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
          })
        ]);

        if (!ordensResponse.ok) throw new Error('Falha ao buscar ordens de serviço');
        if (!tecnicosResponse.ok) throw new Error('Falha ao buscar técnicos');

        const ordensData = await ordensResponse.json();
        const tecnicosData = await tecnicosResponse.json();

        // Processa Técnicos
        const transformedTecnicos: Tecnico[] = tecnicosData.map((tec: any) => ({
          id: String(tec.id),
          nome: tec.name
        }));
        setTecnicos(transformedTecnicos);

        // Processa Ordens
        const enriched: EnrichedOS[] = ordensData.map((apiOS: any) => {
          const mapStatus = (status: string): 'Pendente' | 'Em Andamento' | 'Concluída' => {
            const s = status ? status.toLowerCase() : '';
            if (s === 'pendente') return 'Pendente';
            if (s === 'em andamento') return 'Em Andamento';
            if (s === 'finalizado' || s === 'concluida') return 'Concluída';
            return 'Pendente'; 
          };
          
          const mapTipo = (tipo: string | null): 'Corretiva' | 'Preventiva' => {
            if (tipo && tipo.toLowerCase() === 'preventivo') return 'Preventiva';
            return 'Corretiva'; 
          };

          return {
            id: String(apiOS.id),
            status: mapStatus(apiOS.status),
            dataAbertura: apiOS.horaAbertura, 
            clienteNome: apiOS.name || 'Cliente N/A',
            tecnicoNome: apiOS.tecnicoName || null,
            equipamentoNome: apiOS.modeloCompressor || 'Equipamento N/A',
            equipamentoId: apiOS.equipamentoId || 'N/A', 
            clienteId: apiOS.clienteId || null,
            tipo: mapTipo(apiOS.tipo || 'Corretivo'),
            detalhes: apiOS.detalhes || 'Nenhum detalhe fornecido.',
            tecnicoId: apiOS.tecnicoId || null, 
          };
        });
        
        setAllOrdens(enriched);

      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();

  }, [role, token, refetchToggle]);

  // --- FILTRO ---
  const filteredOrdens = useMemo(() => {
    return allOrdens.filter(os => {
      const searchMatch = searchTerm === '' ||
        os.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.equipamentoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (os.clienteNome && os.clienteNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (os.tecnicoNome && os.tecnicoNome.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const tipoMatch = tipoFilter === 'todos' || os.tipo === tipoFilter;

      return searchMatch && tipoMatch;
    });
  }, [allOrdens, searchTerm, tipoFilter]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Concluída': return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200';
    }
  };

  if (isLoading) {
     return (
       <div className="flex justify-center items-center py-20">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="ml-3 text-muted-foreground">Carregando Ordens de Serviço...</p>
       </div>
     );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* KPI Cards */}
      <OsKpiCards 
        pendentes={allOrdens.filter(os => os.status === 'Pendente').length}
        emAndamento={allOrdens.filter(os => os.status === 'Em Andamento').length}
        concluidas={allOrdens.filter(os => os.status === 'Concluída').length}
      />

      <OsFilterBar
        searchTerm={searchTerm}
        tipoFilter={tipoFilter}
        onSearchChange={setSearchTerm}
        onTipoChange={setTipoFilter}
      />

      {/* TABELA UNIFICADA */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-4 py-3">OS ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Cliente / Equipamento</th>
                <th className="px-4 py-3">Técnico</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrdens.length > 0 ? (
                filteredOrdens.map((os) => (
                  <tr key={os.id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* ID e Tipo */}
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-gray-900">#{os.id}</div>
                      <div className="text-xs text-gray-500">{os.tipo}</div>
                    </td>

                    {/* Status com Badge Colorida */}
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(os.status)}`}>
                        {os.status}
                      </span>
                    </td>

                    {/* Dados Principais */}
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        {os.clienteNome}
                      </div>
                      <div className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                        <Wrench className="w-3 h-3 text-gray-400" />
                        {os.equipamentoNome}
                      </div>
                    </td>

                    {/* Técnico */}
                    <td className="px-4 py-3 align-top">
                      {os.tecnicoNome ? (
                        <div className="flex items-center gap-2 text-gray-700">
                           <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                             {os.tecnicoNome.charAt(0)}
                           </div>
                           {os.tecnicoNome}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Não atribuído</span>
                      )}
                    </td>

                    {/* Data */}
                    <td className="px-4 py-3 align-top text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(os.dataAbertura).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs pl-5">
                         {new Date(os.dataAbertura).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3 align-top text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDetails(os.id)}>
                            Ver Detalhes
                          </DropdownMenuItem>
                          
                          {/* Botão de Atribuir Técnico Modificado */}
                          {os.status === 'Pendente' && (
                             <DropdownMenuItem onClick={() => handleOpenAssignModal(os.id)}>
                               Atribuir Técnico
                             </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem className="text-red-600">
                            Cancelar OS
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Nenhuma ordem de serviço encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Componente Modal de Detalhes (Visualização) */}
      <OrderDetails 
        osId={selectedOsId}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      {/* --- NOVO: MODAL DE ATRIBUIÇÃO DE TÉCNICO --- */}
      {isAssignModalOpen && (
        // Alterado aqui: Removido 'backdrop-blur-sm'
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Atribuir Técnico</h3>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                <p className="text-sm text-gray-500">
                    Selecione o técnico responsável pela OS <span className="font-medium text-gray-900">#{osIdToAssign}</span>.
                </p>

                {/* Select Nativo Estilizado (para garantir funcionamento) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Técnico Disponível</label>
                    <select 
                        className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedTechId}
                        onChange={(e) => setSelectedTechId(e.target.value)}
                    >
                        <option value="" disabled>Selecione um técnico...</option>
                        {tecnicos.map((tec) => (
                            <option key={tec.id} value={tec.id}>
                                {tec.nome}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => setIsAssignModalOpen(false)} disabled={isAssigning}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleAssignTechnician} 
                        disabled={!selectedTechId || isAssigning}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isAssigning ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Confirmar Atribuição
                            </>
                        )}
                    </Button>
                </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}