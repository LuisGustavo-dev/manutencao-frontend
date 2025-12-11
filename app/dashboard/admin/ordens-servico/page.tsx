'use client';
import { useEffect, useState, useMemo } from 'react';
// 1. IMPORTAR TIPO Tecnico (o mock 'mockTecnicos' não é mais necessário)
import type { OrdemServico, Tecnico } from '@/lib/mock-data';
import { useAuth } from '@/app/contexts/authContext';

// Importa os componentes do diretório LOCAL
import { OsPageHeader } from './components/OsPageHeader';
import { OsKpiCards } from './components/OsKpiCards';
import { OsFilterBar } from './components/OsFilterBar';
import { OsTabs } from './components/OsTabs';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

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

  // --- 1. GATILHO PARA RECARREGAR OS DADOS ---
  const [refetchToggle, setRefetchToggle] = useState(false);
  const triggerRefetch = () => setRefetchToggle(prev => !prev);
  // --- FIM DA ADIÇÃO ---

  // --- ATUALIZAR O 'useEffect' PARA BUSCAR TUDO ---
  useEffect(() => {
    if (!token) {
      if (token === null) setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Busca Ordens de Serviço E Técnicos em paralelo
        const [ordensResponse, tecnicosResponse] = await Promise.all([
          fetch('http://localhost:3340/chamado', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch('http://localhost:3340/user/tecnicos', { // <-- NOVA CHAMADA
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
          })
        ]);

        if (!ordensResponse.ok) throw new Error('Falha ao buscar ordens de serviço');
        if (!tecnicosResponse.ok) throw new Error('Falha ao buscar técnicos');

        const ordensData = await ordensResponse.json();
        const tecnicosData = await tecnicosResponse.json(); // <-- NOVOS DADOS

        // --- 3a. Processa e "traduz" os técnicos ---
        const transformedTecnicos: Tecnico[] = tecnicosData.map((tec: any) => ({
          id: String(tec.id),
          nome: tec.name
        }));
        setTecnicos(transformedTecnicos); // <-- Salva no estado

        // --- 3b. Processa e "traduz" as Ordens de Serviço ---
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

  }, [role, token, refetchToggle]); // <-- 2. ADICIONA O GATILHO AQUI

  // --- ATUALIZAR O 'useMemo' para Admin ---
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

  // --- Separa as listas para as Abas ---
  const ordensPendentes = filteredOrdens.filter(os => os.status === 'Pendente');
  const ordensEmAndamento = filteredOrdens.filter(os => os.status === 'Em Andamento');
  const ordensConcluidas = filteredOrdens.filter(os => os.status === 'Concluída');

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
      

      {/* 2. CARDS KPI */}
      <OsKpiCards 
        pendentes={ordensPendentes.length}
        emAndamento={ordensEmAndamento.length}
        concluidas={ordensConcluidas.length}
      />

      {/* 3. BARRA DE FILTRO E PESQUISA */}
      <OsFilterBar
        searchTerm={searchTerm}
        tipoFilter={tipoFilter}
        onSearchChange={setSearchTerm}
        onTipoChange={setTipoFilter}
      />

      {/* 4. ABAS E TABELAS */}
      <OsTabs
        pendentes={ordensPendentes}
        emAndamento={ordensEmAndamento}
        concluidas={ordensConcluidas}
        role={role}
        tecnicos={tecnicos} 
        onDataChange={triggerRefetch} // <-- 3. ADICIONA A PROP FALTANTE
      />
    </div>
  );
}