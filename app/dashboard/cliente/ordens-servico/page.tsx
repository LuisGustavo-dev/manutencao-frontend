'use client';
import { useEffect, useState, useMemo } from 'react';
import type { OrdemServico } from '@/lib/mock-data';
import { useAuth } from '@/app/contexts/authContext'; 

// Importa os componentes do diretório LOCAL
import { OsPageHeader } from './components/OsPageHeader';
import { OsKpiCards } from './components/OsKpiCards';
import { OsFilterBar } from './components/OsFilterBar';
// --- 1. IMPORTAÇÕES ATUALIZADAS ---
// import { OsTabs } from './components/OsTabs'; // <-- REMOVIDO
import { OsTable } from './components/OsTable'; // <-- ADICIONADO
import { Card, CardContent } from '@/components/ui/card'; // <-- ADICIONADO
// --- FIM DAS IMPORTAÇÕES ---

import { Loader2 } from 'lucide-react'; 
import toast from 'react-hot-toast'; 

// Adicionamos 'export'
export type EnrichedOS = OrdemServico & {
  equipamentoNome: string;
  clienteNome: string | null;
  horaInicioAtendimento: string | null; 
  horaFinalizacao: string | null; 
};

export default function ClienteOrdensServicoPage() {
  const { role, user, token } = useAuth(); 

  // --- Estados ---
  const [allOrdens, setAllOrdens] = useState<EnrichedOS[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');

  // --- 1. Carrega e enriquece os dados via API ---
  useEffect(() => {
    if (!token) {
      if (token === null) setIsLoading(false);
      return;
    }

    const fetchOrdens = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3340/chamado`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar ordens de serviço');
        }

        const dataFromApi = await response.json();

        // --- CAMADA DE TRADUÇÃO (API PLANA -> Frontend) ATUALIZADA ---
        const enriched: EnrichedOS[] = dataFromApi.map((apiOS: any) => {
          
          const mapStatus = (status: string): 'Pendente' | 'Em Andamento' | 'Concluída' => {
            const s = status.toLowerCase();
            if (s === 'pendente' || s === 'aberto') return 'Pendente'; 
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
            horaInicioAtendimento: apiOS.horaInicioAtendimento, 
            horaFinalizacao: apiOS.horaFinalizacao,         
            equipamentoNome: apiOS.equipamentoId 
              ? `Equipamento #${apiOS.equipamentoId}` 
              : 'Equipamento N/A',
            equipamentoId: String(apiOS.equipamentoId) || 'N/A', 
            clienteNome: apiOS.name || null,
            clienteId: apiOS.clienteId || null,
            tipo: mapTipo(apiOS.tipo || 'Corretivo'), 
            detalhes: apiOS.detalhes || 'Nenhum detalhe fornecido.',
            tecnicoId: apiOS.tecnicoId || null, 
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

  // --- 2. Filtra a lista com base nos estados (useMemo) ---
  const filteredOrdens = useMemo(() => {
    return allOrdens.filter(os => {
      const searchMatch = searchTerm === '' ||
        os.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.equipamentoNome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const tipoMatch = tipoFilter === 'todos' || os.tipo === tipoFilter;

      return searchMatch && tipoMatch;
    });
  }, [allOrdens, searchTerm, tipoFilter]);

  // --- 3. Separa as listas para as Abas (REMOVIDO) ---
  // const pendentes = filteredOrdens.filter(os => os.status === 'Pendente');
  // const emAndamento = filteredOrdens.filter(os => os.status === 'Em Andamento');
  // const concluidas = filteredOrdens.filter(os => os.status === 'Concluída');

  // --- RENDERIZAÇÃO DE LOADING ---
  if (isLoading) {
     return (
       <div className="flex justify-center items-center py-20">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="ml-3 text-muted-foreground">Carregando Ordens de Serviço...</p>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. CABEÇALHO */}
      <OsPageHeader />

      {/* 2. CARDS KPI --- (Agora contam o total filtrado) --- */}
      <OsKpiCards 
        pendentes={filteredOrdens.filter(os => os.status === 'Pendente').length}
        emAndamento={filteredOrdens.filter(os => os.status === 'Em Andamento').length}
        concluidas={filteredOrdens.filter(os => os.status === 'Concluída').length}
      />

      {/* 3. BARRA DE FILTRO E PESQUISA */}
      <OsFilterBar
        searchTerm={searchTerm}
        tipoFilter={tipoFilter}
        onSearchChange={setSearchTerm}
        onTipoChange={setTipoFilter}
      />

      {/* 4. TABELA ÚNICA (SUBSTITUIU AS ABAS) */}
      <Card>
        <CardContent className="p-0">
          {filteredOrdens.length > 0 ? (
            <OsTable
              ordens={filteredOrdens} // <-- Passa a lista completa
              role={role}
            />
          ) : (
            <div className="p-10 text-center text-muted-foreground">
              Nenhuma Ordem de Serviço encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}