'use client';

import { useEffect, useState, useMemo } from 'react';
import type { OrdemServico } from '@/lib/mock-data';
import { useAuth } from '@/app/contexts/authContext'; 

// Importa os componentes do diretório LOCAL
import { OsPageHeader } from './components/OsPageHeader';
import { OsKpiCards } from './components/OsKpiCards';
import { OsFilterBar } from './components/OsFilterBar';
// REMOVIDO: import { OsTabs } from './components/OsTabs';

import { Loader2, Eye, FileText } from 'lucide-react'; 
import toast from 'react-hot-toast'; 
import Link from 'next/link'; // Importante para o botão de detalhes

// --- TIPO ---
export type EnrichedOS = OrdemServico & {
  equipamentoNome: string;
  tecnicoNome: string | null;
  clienteNome: string | null;
};

export default function ManutentorOrdensServicoPage() {
  const { role, user, token } = useAuth(); 

  // --- Estados ---
  const [allOrdens, setAllOrdens] = useState<EnrichedOS[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');

  // --- Carrega dados ---
  useEffect(() => {
    if (!token) {
      if (token === null) setIsLoading(false);
      return;
    }

    const fetchOrdens = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3340/chamado?_=${new Date().getTime()}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar ordens de serviço');
        }

        const dataFromApi = await response.json();

        // --- TRADUÇÃO ---
        const enriched: EnrichedOS[] = dataFromApi.map((apiOS: any) => {
          
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
            tecnicoNome: user?.nome || null,
            equipamentoNome: apiOS.modeloCompressor || 'Equipamento N/A',
            equipamentoId: apiOS.equipamentoId || 'N/A', 
            clienteId: apiOS.clienteId || null,
            tipo: mapTipo(apiOS.tipo || 'Corretivo'),
            detalhes: apiOS.detalhes || 'Nenhum detalhe fornecido.',
            tecnicoId: apiOS.tecnicoId || user?.id || null, 
          };
        });

        setAllOrdens(enriched);

      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar Ordens de Serviço.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrdens();

  }, [role, user, token]);

  // --- Filtra a lista ---
  const filteredOrdens = useMemo(() => {
    return allOrdens.filter(os => {
      const searchMatch = searchTerm === '' ||
        os.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.equipamentoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (os.clienteNome && os.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const tipoMatch = tipoFilter === 'todos' || os.tipo === tipoFilter;

      return searchMatch && tipoMatch;
    });
  }, [allOrdens, searchTerm, tipoFilter]);

  // --- Contagem para KPIs (Mantido apenas para os Cards) ---
  const pendentes = allOrdens.filter(os => os.status === 'Pendente');
  const emAndamento = allOrdens.filter(os => os.status === 'Em Andamento');
  const concluidas = allOrdens.filter(os => os.status === 'Concluída');

  // --- RENDERIZAÇÃO DE LOADING ---
  if (isLoading) {
     return (
       <div className="flex justify-center items-center py-20">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="ml-3 text-muted-foreground">Carregando suas Ordens de Serviço...</p>
       </div>
     );
  }

  // Helper para cor do status na tabela
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída': return 'bg-green-100 text-green-700 border-green-200';
      case 'Em Andamento': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. CABEÇALHO */}
      <OsPageHeader role={role} />

      {/* 2. CARDS KPI */}
      <OsKpiCards 
        pendentes={pendentes.length}
        emAndamento={emAndamento.length}
        concluidas={concluidas.length}
      />

      {/* 3. BARRA DE FILTRO E PESQUISA */}
      <OsFilterBar
        searchTerm={searchTerm}
        tipoFilter={tipoFilter}
        onSearchChange={setSearchTerm}
        onTipoChange={setTipoFilter}
      />

      {/* 4. TABELA DE DADOS (Substituindo as Tabs) */}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Equipamento</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Data Abertura</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrdens.length > 0 ? (
                filteredOrdens.map((os) => (
                  <tr key={os.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3 font-medium">#{os.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{os.equipamentoNome}</div>
                      {/* <div className="text-xs text-muted-foreground">Modelo X</div> se tiver */}
                    </td>
                    <td className="px-4 py-3">{os.clienteNome}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        os.tipo === 'Preventiva' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {os.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(os.dataAbertura).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(os.status)}`}>
                        {os.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {/* Botão de ação genérico ou link para detalhes */}
                      <Link 
                        href={`/dashboard/ordens/${os.id}`} 
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 opacity-20" />
                      <p>Nenhuma Ordem de Serviço encontrada.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Contador simples no rodapé da tabela */}
      <div className="text-xs text-muted-foreground text-right">
        Mostrando {filteredOrdens.length} registros
      </div>

    </div>
  );
}