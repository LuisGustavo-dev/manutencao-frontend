'use client';
import { useEffect, useState, useMemo } from 'react';
// import { mockOrdensServico, mockEquipamentos, mockTecnicos } from '@/lib/mock-data';
import type { OrdemServico, Tecnico } from '@/lib/mock-data';
import { useAuth } from '@/app/contexts/authContext'; 

// Importa os componentes do diretório LOCAL
import { OsPageHeader } from './components/OsPageHeader';
import { OsKpiCards } from './components/OsKpiCards';
import { OsFilterBar } from './components/OsFilterBar';
import { OsTabs } from './components/OsTabs';
import { Loader2 } from 'lucide-react'; 
import toast from 'react-hot-toast'; 

// --- 1. TIPO CORRIGIDO (para bater com o useMemo) ---
export type EnrichedOS = OrdemServico & {
  equipamentoNome: string;
  tecnicoNome: string | null;
  clienteNome: string | null;
};

export default function ManutentorOrdensServicoPage() {
  const { role, user, token } = useAuth(); // Pega o usuário e o TOKEN

  // --- Estados ---
  const [allOrdens, setAllOrdens] = useState<EnrichedOS[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');

  // --- 2. Carrega e enriquece os dados via API (CORRIGIDO) ---
  useEffect(() => {
    if (!token) {
      if (token === null) setIsLoading(false);
      return;
    }

    const fetchOrdens = async () => {
      setIsLoading(true);
      try {
        // --- ADICIONADO: Parâmetro de cache para evitar 304 ---
        const response = await fetch(`http://localhost:3340/chamado?_=${new Date().getTime()}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar ordens de serviço');
        }

        const dataFromApi = await response.json(); // API agora retorna Chamado[] (lista plana)

        // --- CAMADA DE TRADUÇÃO (API PLANA -> Frontend) ---
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
            // A API não envia 'tecnicoName', então usamos o nome do usuário logado
            // (assumindo que esta API só retorna OSs deste técnico)
            tecnicoNome: user?.nome || null,
            equipamentoNome: apiOS.modeloCompressor || 'Equipamento N/A',
            
            // --- Dados "Polyfill" ---
            equipamentoId: apiOS.equipamentoId || 'N/A', 
            clienteId: apiOS.clienteId || null,
            tipo: mapTipo(apiOS.tipo || 'Corretivo'),
            detalhes: apiOS.detalhes || 'Nenhum detalhe fornecido.',
            tecnicoId: apiOS.tecnicoId || user?.id || null, // Usa o ID do usuário logado
          };
        });
        // --- FIM DA TRADUÇÃO ---

        // --- 3. LÓGICA DE FILTRO REMOVIDA ---
        // Assumindo que a API GET /chamado (com token de técnico)
        // JÁ RETORNA apenas as OSs desse técnico.
        setAllOrdens(enriched);

      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar Ordens de Serviço.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrdens();

  }, [role, user, token]); // Roda se a role, usuário ou token mudar

  // --- 4. Filtra a lista com base nos estados (useMemo) ---
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

  // --- 5. Separa as listas para as Abas ---
  const pendentes = filteredOrdens.filter(os => os.status === 'Pendente');
  const emAndamento = filteredOrdens.filter(os => os.status === 'Em Andamento');
  const concluidas = filteredOrdens.filter(os => os.status === 'Concluída');

  // --- RENDERIZAÇÃO DE LOADING ---
  if (isLoading) {
     return (
       <div className="flex justify-center items-center py-20">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="ml-3 text-muted-foreground">Carregando suas Ordens de Serviço...</p>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. CABEÇALHO */}
      <OsPageHeader role={role} />

      {/* 2. CARDS KPI (Customizados para o técnico) */}
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
        // Não precisa mais passar 'tecnicos'
      />
    </div>
  );
}