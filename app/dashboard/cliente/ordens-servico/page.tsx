'use client';
import { useEffect, useState, useMemo } from 'react';
// --- MOCKS REMOVIDOS ---
// import { mockOrdensServico, mockEquipamentos } from '@/lib/mock-data';
import type { OrdemServico } from '@/lib/mock-data';
import { useAuth } from '@/app/contexts/authContext'; 

// Importa os componentes do diretório LOCAL
import { OsPageHeader } from './components/OsPageHeader';
import { OsKpiCards } from './components/OsKpiCards';
import { OsFilterBar } from './components/OsFilterBar';
import { OsTabs } from './components/OsTabs';
import { Loader2 } from 'lucide-react'; // <-- Importa o Loader
import toast from 'react-hot-toast'; // <-- Importa o Toast

// Adicionamos 'export'
export type EnrichedOS = OrdemServico & {
  equipamentoNome: string;
};

export default function ClienteOrdensServicoPage() {
  const { role, user, token } = useAuth(); // <-- Pega o usuário e o TOKEN

  // --- Estados ---
  const [allOrdens, setAllOrdens] = useState<EnrichedOS[]>([]);
  const [isLoading, setIsLoading] = useState(true); // <-- Estado de Loading
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');

  // --- 1. Carrega e enriquece os dados via API ---
  useEffect(() => {
    // Não executa se o token ainda não foi carregado
    if (!token) {
      // Se o AuthProvider já carregou e não há token, para o loading
      
      // --- CORREÇÃO DO BUG DE TIPO ---
      // Comparação direta com null, não com a string "null"
      if (token === null) setIsLoading(false);
      // --- FIM DA CORREÇÃO ---
      
      return;
    }

    const fetchOrdens = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3340/chamado', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar ordens de serviço');
        }

        const dataFromApi = await response.json();

        // --- CAMADA DE TRADUÇÃO (API -> Frontend) ATUALIZADA ---
        const enriched: EnrichedOS[] = dataFromApi.map((apiOS: any) => {
          
          const mapStatus = (status: string): 'Pendente' | 'Em Andamento' | 'Concluída' => {
            const s = status.toLowerCase();
            if (s === 'pendente') return 'Pendente';
            if (s === 'em andamento') return 'Em Andamento';
            if (s === 'finalizado' || s === 'concluida') return 'Concluída';
            return 'Pendente'; // Padrão
          };
          
           const mapTipo = (tipo: string | null): 'Corretiva' | 'Preventiva' => {
            if (tipo && tipo.toLowerCase() === 'preventivo') return 'Preventiva';
            return 'Corretiva'; // Padrão
          };

          return {
            // --- Dados de OrdemServico ---
            id: String(apiOS.id),
            status: mapStatus(apiOS.status),
            dataAbertura: new Date(apiOS.horaAbertura).toLocaleDateString('pt-BR'),
            
            // --- ATUALIZADO: Leitura do campo plano ---
            clienteNome: apiOS.name || 'Cliente N/A',
            
            // --- Dados "Polyfill" (API não envia, mas o frontend precisa) ---
            // TODO: Atualizar a API GET /chamado para retornar estes campos
            equipamentoId: apiOS.equipamentoId || 'N/A', // <-- API NÃO ENVIA MAIS
            clienteId: apiOS.clienteId || null,       // <-- API NÃO ENVIA MAIS
            tipo: mapTipo(apiOS.tipo || 'Corretivo'),   // <-- API NÃO ENVIA MAIS 'tipo'
            detalhes: apiOS.detalhes || 'Nenhum detalhe fornecido.', // <-- API NÃO ENVIA MAIS
            tecnicoId: apiOS.tecnicoId || null,         // <-- API NÃO ENVIA MAIS

            // --- Dados de EnrichedOS ---
            // --- ATUALIZADO: Leitura do campo plano ---
            equipamentoNome: apiOS.modeloCompressor || 'Equipamento N/A',
          };
        });
        // --- FIM DA CAMADA DE TRADUÇÃO ---

        setAllOrdens(enriched);

      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar Ordens de Serviço.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrdens();

  }, [role, user, token]); // Roda sempre que o usuário (ou token) mudar

  // --- 2. Filtra a lista com base nos estados (useMemo) ---
  const filteredOrdens = useMemo(() => {
    return allOrdens.filter(os => {
      const searchMatch = searchTerm === '' ||
        os.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.equipamentoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const tipoMatch = tipoFilter === 'todos' || os.tipo === tipoFilter;

      return searchMatch && tipoMatch;
    });
  }, [allOrdens, searchTerm, tipoFilter]);

  // --- 3. Separa as listas para as Abas ---
  const pendentes = filteredOrdens.filter(os => os.status === 'Pendente');
  const emAndamento = filteredOrdens.filter(os => os.status === 'Em Andamento');
  const concluidas = filteredOrdens.filter(os => os.status === 'Concluída');

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

      {/* 4. ABAS E TABELAS */}
      <OsTabs
        pendentes={pendentes}
        emAndamento={emAndamento}
        concluidas={concluidas}
        role={role}
      />
    </div>
  );
}