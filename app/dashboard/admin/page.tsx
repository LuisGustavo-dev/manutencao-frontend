'use client';
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { OrdemServico, Tecnico, Cliente, Equipamento } from '@/lib/mock-data';
import toast from 'react-hot-toast';
import { Loader2, AlertTriangle, Building, Package, HardHat } from 'lucide-react'; 
import { useAuth } from '@/app/contexts/authContext'; 

import { AdminPageHeader } from './components/AdminPageHeader';
import { AdminKpiCards } from './components/AdminKpiCards';
import { EquipmentTypeChart } from './components/EquipmentTypeChart';
import { OsTrendChart } from './components/OsTrendChart';
import { TechnicianActivityTable } from './components/TechnicianActivityTable';
import { SystemFeedTable } from './components/SystemFeedTable';

import { AssignTechnicianModal } from './components/AssignTechnicianModal';
import { ViewProfileModal } from './components/ViewProfileModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type Kpi = {
  title: string;
  value: string;
  icon: React.ElementType; 
  color: string;
};
export type ChartData = { name: string; [key: string]: string | number; };
export type Technician = {
  id: string; nome: string; avatar: string; concluidas: number; taxa: string; emAndamento: number;
};
export type EnrichedOS = OrdemServico & {
  equipamentoNome: string; tecnicoNome: string | null; clienteNome: string | null;
};


type ModalType = 'viewProfile' | 'assignOS' | null;

const monthMap: { [key: string]: string } = {
  "January": "Jan", "February": "Fev", "March": "Mar", "April": "Abr", "May": "Mai", "June": "Jun",
  "July": "Jul", "August": "Ago", "September": "Set", "October": "Out", "November": "Nov", "December": "Dez"
};

export default function AdminHomePage() {
  const { token } = useAuth(); 
  
  const [kpiData, setKpiData] = useState<Kpi[]>([]);
  const [equipmentChartData, setEquipmentChartData] = useState<ChartData[]>([]);
  const [osTrendData, setOsTrendData] = useState<ChartData[]>([]);
  const [technicianData, setTechnicianData] = useState<Technician[]>([]);
  const [ordensPendentes, setOrdensPendentes] = useState<EnrichedOS[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [refetchToggle, setRefetchToggle] = useState(false);
  const triggerRefetch = () => setRefetchToggle(prev => !prev);


  async function fetchDashboardData() {
    if (!token) {
       if (token === null) { 
          setIsLoading(false);
          setError("Usuário não autenticado.");
       }
       return; 
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3340/dashboard/admin?_=${new Date().getTime()}`, { 
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar dados do painel");
      }

      const apiData = await response.json();

      const derivedKpiData: Kpi[] = [
        { 
          title: "Total de Clientes Ativos", 
          value: String(apiData.totalClientes), 
          icon: Building, 
          color: "text-green-600" 
        },
        { 
          title: "Equipamentos Monitorados", 
          value: String(apiData.totalDeEquipamentosMonitorados), 
          icon: Package, 
          color: "text-gray-500" 
        },
        { 
          title: "Total de Técnicos", 
          value: String(apiData.totalTecnicos), 
          icon: HardHat, 
          color: "text-blue-500" 
        },
        { 
          title: "OS Pendentes", 
          value: String(apiData.totalOsPendentes), 
          icon: AlertTriangle, 
          color: "text-destructive" 
        },
      ];
      setKpiData(derivedKpiData);

      const transformedTrendData = apiData.tecnicosSeisMeses.map((m: any) => ({
        name: monthMap[m.month] || m.month.substring(0, 3), 
        Corretivas: m.corretivo,
        Preventivas: m.preventivo,
        Operacional: m.operacional
      })).reverse(); 
      setOsTrendData(transformedTrendData);

      const transformedTechnicianList: Technician[] = apiData.tecnicos.map((t: any) => ({
        id: String(t.id) || t.name, 
        nome: t.name.replace(/_/g, ' '), 
        avatar: t.name.split('_').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(), 
        concluidas: t.finalizados,
        taxa: `${parseFloat(t.taxaSucesso).toFixed(0)}%`, 
        emAndamento: t.emAndamento
      }));
      setTechnicianData(transformedTechnicianList);
      
      const modalTecnicosList: Tecnico[] = apiData.tecnicos.map((t: any) => ({
         id: String(t.id), 
         nome: t.name
      }));
      setTecnicos(modalTecnicosList);

      const transformedPendingOs: EnrichedOS[] = apiData.chamadosPendentes.map((os: any) => ({
        id: String(os.id),
        status: "Pendente", 
        dataAbertura: os.horaAbertura,
        clienteNome: os.name,
        
        equipamentoNome: "Equipamento (ver OS)", 
        tipo: 'Corretiva', 
        detalhes: "Detalhes não fornecidos pela API. Verificar OS no sistema.", 
        tecnicoId: null,
        tecnicoNome: null,
        clienteId: null, 
        equipamentoId: "N/A", 
      }));
      setOrdensPendentes(transformedPendingOs);

      const transformedEquipChart = apiData.chamadosPorTipo.map((eq: any) => ({
         name: eq.modeloCompressor, 
         os: parseInt(eq.total_chamados, 10) 
      }));
      setEquipmentChartData(transformedEquipChart); 

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refetchToggle]); 

  const [modalState, setModalState] = useState<{
    type: ModalType;
    data: any; 
  }>({ type: null, data: null });

  const handleViewProfile = (tecnico: Technician) => { 
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
      const response = await fetch(`http://localhost:3340/chamado/atribuir-tecnico/tecnico/${tecnicoId}/chamado/${osId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      });
      
      if (!response.ok) {
         const errData = await response.json();
         throw new Error(errData.message || 'Falha ao atribuir OS');
      }
      
      toast.success("OS atribuída com sucesso!");
      closeModal();
      
      triggerRefetch(); 

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  };
  
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

  return (
    <div className="space-y-6">
      
      <AdminPageHeader />
      
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
              tecnicos={tecnicos} 
              onClose={closeModal}
              onSubmit={handleAssignSubmit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}