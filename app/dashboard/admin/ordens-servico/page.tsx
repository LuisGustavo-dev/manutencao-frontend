'use client';
import { useEffect, useState, useMemo } from 'react';
import type { OrdemServico, Tecnico } from '@/lib/mock-data';
import { useAuth } from '@/app/contexts/authContext';

// Importa os componentes do diretório LOCAL
import { OsPageHeader } from './components/OsPageHeader';
import { OsKpiCards } from './components/OsKpiCards';
import { OsFilterBar } from './components/OsFilterBar';
// import { OsTabs } from './components/OsTabs'; // REMOVIDO
import { Loader2, Calendar, User, Wrench, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

// Componentes de UI (Supondo uso de Shadcn ou Tailwind puro)
import { Badge } from '@/components/ui/badge'; // Ajuste o import conforme seu projeto
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

  // --- Estados ---
  const [allOrdens, setAllOrdens] = useState<EnrichedOS[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');

  // --- GATILHO PARA RECARREGAR OS DADOS ---
  const [refetchToggle, setRefetchToggle] = useState(false);
  const triggerRefetch = () => setRefetchToggle(prev => !prev);

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
            const s = status.toLowerCase();
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

  // Função auxiliar para cor do Status
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
      


      {/* KPI Cards mantidos pois dão um resumo rápido */}
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

      {/* NOVA VISUALIZAÇÃO: TABELA UNIFICADA */}
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

                    {/* Ações (Menu Dropdown ou Botão) */}
                    <td className="px-4 py-3 align-top text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { /* Lógica de Ver Detalhes */ }}>
                            Ver Detalhes
                          </DropdownMenuItem>
                          {os.status === 'Pendente' && (
                             <DropdownMenuItem onClick={() => { /* Lógica de Atribuir */ }}>
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
    </div>
  );
}