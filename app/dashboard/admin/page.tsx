'use client';
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  mockTecnicos // (Continuamos usando o mock de técnicos para o modal)
} from '@/lib/mock-data';
import type { OrdemServico, Tecnico, Cliente, Equipamento } from '@/lib/mock-data';
import toast from 'react-hot-toast';
import { Loader2, AlertTriangle, Building, Package, HardHat } from 'lucide-react'; // Ícones de loading/erro

// Importa os componentes de card
import { AdminPageHeader } from './components/AdminPageHeader';
import { AdminKpiCards } from './components/AdminKpiCards';
import { EquipmentTypeChart } from './components/EquipmentTypeChart';
import { OsTrendChart } from './components/OsTrendChart';
import { TechnicianActivityTable } from './components/TechnicianActivityTable';
import { SystemFeedTable } from './components/SystemFeedTable';

// Importa os componentes de MODAL
import { AssignTechnicianModal } from './components/AssignTechnicianModal';
import { ViewProfileModal } from './components/ViewProfileModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- 1. TIPOS (Movidos de AdminMockData.ts) ---
// (Estes tipos devem bater com o que sua API retorna)
export type Kpi = {
  title: string;
  value: string;
  icon: React.ElementType; // (Você pode querer mudar isso para string)
  color: string;
};
export type ChartData = { name: string; [key: string]: string | number; };
export type Technician = {
  id: string; nome: string; avatar: string; concluidas: number; taxa: string; emAndamento: number;
};
export type EnrichedOS = OrdemServico & {
  equipamentoNome: string; tecnicoNome: string | null; clienteNome: string | null;
};
// --- Fim dos Tipos ---


// Define os tipos de modal que podem ser abertos
type ModalType = 'viewProfile' | 'assignOS' | null;

export default function AdminHomePage() {
  
  // --- 2. NOVOS ESTADOS DE DADOS ---
  const [kpiData, setKpiData] = useState<Kpi[]>([]);
  const [equipmentChartData, setEquipmentChartData] = useState<ChartData[]>([]);
  const [osTrendData, setOsTrendData] = useState<ChartData[]>([]);
  const [technicianData, setTechnicianData] = useState<Technician[]>([]);
  const [ordensPendentes, setOrdensPendentes] = useState<EnrichedOS[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]); // Para o modal
  
  // --- 3. ESTADOS DE LOADING E ERRO ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 4. FUNÇÃO DE DATA FETCHING ---
  async function fetchDashboardData() {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vamos buscar todos os dados da API em paralelo
      const [
        kpiRes,
        equipChartRes,
        trendRes,
        techActivityRes,
        pendingOsRes,
        tecnicosRes
      ] = await Promise.all([
        fetch('/api/admin/kpis'), // (Endpoint de exemplo)
        fetch('/api/admin/charts/equipment-type'),
        fetch('/api/admin/charts/os-trend'),
        fetch('/api/admin/technicians/activity'),
        fetch('/api/admin/os/pending'),
        fetch('/api/admin/tecnicos') // (Lista de técnicos para o modal)
      ]);

      // (Em um app real, você checaria cada 'res.ok' individualmente)
      if (!kpiRes.ok) throw new Error("Falha ao carregar KPIs");

      // Extrai os dados
      const kpis = await kpiRes.json();
      const equipChart = await equipChartRes.json();
      const trend = await trendRes.json();
      const techActivity = await techActivityRes.json();
      const pendingOs = await pendingOsRes.json();
      const tecnicosList = await tecnicosRes.json();
      
      // Popula o estado com os dados da API
      setKpiData(kpis);
      setEquipmentChartData(equipChart);
      setOsTrendData(trend);
      setTechnicianData(techActivity);
      setOrdensPendentes(pendingOs);
      setTecnicos(tecnicosList);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  // --- 5. useEffect para buscar os dados na montagem ---
  useEffect(() => {
    // (Usando mocks por enquanto, comente a linha abaixo para usar a API real)
    // fetchDashboardData(); 
    
    // --- Simulação (para o layout não quebrar) ---
    // (Remova isso quando sua API estiver pronta)
    setIsLoading(false); 
    setKpiData(mockKpiData);
    setEquipmentChartData(mockEquipmentTypeChartData);
    setOsTrendData(mockOsTrendData);
    setTechnicianData(mockTechnicianData);
    setOrdensPendentes(mockOrdensPendentes); // (Você precisará criar este mock)
    setTecnicos(mockTecnicos);
    // --- Fim da Simulação ---
    
  }, []);

  // --- 6. ESTADOS E FUNÇÕES DO MODAL (Atualizado para API) ---
  const [modalState, setModalState] = useState<{
    type: ModalType;
    data: any; 
  }>({ type: null, data: null });

  const handleViewProfile = (tecnico: Tecnico) => {
    setModalState({ type: 'viewProfile', data: tecnico });
  };

  const handleAssignClick = (os: EnrichedOS) => {
    setModalState({ type: 'assignOS', data: os });
  };

  const closeModal = () => {
    setModalState({ type: null, data: null });
  };
  
  const handleAssignSubmit = async (osId: string, tecnicoId: string) => {
    try {
      // 1. Chamar a API para atualizar
      const response = await fetch(`/api/admin/os/${osId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tecnicoId }),
      });
      
      if (!response.ok) throw new Error('Falha ao atribuir OS');
      
      const updatedOs = await response.json(); // A API deve retornar a OS atualizada

      // 2. Atualizar o estado local (Removendo da lista de pendentes)
      setOrdensPendentes(prevOrdens => 
        prevOrdens.filter(os => os.id !== osId)
      );
      
      toast.success("OS atribuída com sucesso!");
      closeModal();
      
      // (Opcional: você pode querer recarregar os KPIs ou outras tabelas)
      // fetchDashboardData(); // (Ou uma função mais granular)

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  };
  
  // --- 7. RENDERIZAÇÃO CONDICIONAL (LOADING/ERRO) ---
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Carregando dados do painel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center text-center">
        <Card className="w-96 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle /> Erro ao Carregar</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">Tentar Novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- 8. RENDERIZAÇÃO PRINCIPAL (Passando props) ---
  return (
    <div className="space-y-6">
      
      <AdminPageHeader />
      
      {/* Passa os dados da API para os componentes filhos */}
      <AdminKpiCards kpiData={kpiData} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <EquipmentTypeChart chartData={equipmentChartData} />
        <OsTrendChart chartData={osTrendData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <TechnicianActivityTable 
          technicianData={technicianData}
          onViewProfileClick={handleViewProfile}
        />
        <SystemFeedTable 
          ordensPendentes={ordensPendentes} 
          onAssignClick={handleAssignClick}
        />
      </div>

      <Dialog open={!!modalState.type} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-xl">
          {modalState.type === 'viewProfile' && modalState.data && (
            <ViewProfileModal 
              tecnico={modalState.data}
              onClose={closeModal}
            />
          )}

          {modalState.type === 'assignOS' && modalState.data && (
            <AssignTechnicianModal
              os={modalState.data}
              tecnicos={tecnicos} // Passa a lista de técnicos vinda da API
              onClose={closeModal}
              onSubmit={handleAssignSubmit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Mocks temporários (para o 'useEffect' de simulação) ---
// (Remova isso quando a API estiver pronta)
const mockKpiData: Kpi[] = [
  { title: "Total de Clientes Ativos", value: "12", icon: Building, color: "text-green-600" },
  { title: "Equipamentos Monitorados", value: "178", icon: Package, color: "text-gray-500" },
  { title: "Total de Técnicos", value: "8", icon: HardHat, color: "text-blue-500" },
  { title: "OS Pendentes (Urgente)", value: "7", icon: AlertTriangle, color: "text-destructive" },
];
const mockEquipmentTypeChartData: ChartData[] = [
  { name: 'Túnel Congel.', os: 25 },
  { name: 'Câmara Cong.', os: 40 },
  { name: 'Câmara Resf.', os: 30 },
];
const mockOsTrendData: ChartData[] = [
  { name: 'Ago', Corretivas: 30, Preventivas: 15 },
  { name: 'Set', Corretivas: 25, Preventivas: 20 },
  { name: 'Out', Corretivas: 18, Preventivas: 25 },
];
const mockTechnicianData: Technician[] = [
  { id: 'man001', nome: 'Luis Gustavo', avatar: 'LG', concluidas: 28, taxa: "95%", emAndamento: 2 },
  { id: 'man002', nome: 'Ana Silva', avatar: 'AS', concluidas: 22, taxa: "92%", emAndamento: 1 },
];
const mockOrdensPendentes: EnrichedOS[] = [
  { id: 'os-p-1', equipamentoId: 'eq-1', tipo: 'Corretiva', status: 'Pendente', detalhes: '...', tecnicoId: null, clienteId: 'cli-1', dataAbertura: '...', equipamentoNome: 'TCF-001', tecnicoNome: null, clienteNome: 'Cliente A' },
  { id: 'os-p-2', equipamentoId: 'eq-2', tipo: 'Preventiva', status: 'Pendente', detalhes: '...', tecnicoId: null, clienteId: 'cli-2', dataAbertura: '...', equipamentoNome: 'Câmara Fria B', tecnicoNome: null, clienteNome: 'Cliente B' },
];