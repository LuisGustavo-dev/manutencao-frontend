'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrichedOS } from '../page'; 
import { Tecnico } from '@/lib/mock-data'; // Removido mockOrdensServico
import { OsTable } from './OsTable';
import { AssignTechnicianModal } from './AssignTechnicianModal';
// --- NOVAS IMPORTAÇÕES ---
import { useAuth } from '@/app/contexts/authContext';
import toast from 'react-hot-toast';

interface OsTabsProps {
  pendentes: EnrichedOS[];
  emAndamento: EnrichedOS[];
  concluidas: EnrichedOS[];
  role: string | null;
  tecnicos: Tecnico[];
  onDataChange: () => void; // <-- 1. NOVA PROP PARA RECARREGAR
}

export function OsTabs({ 
  pendentes, 
  emAndamento, 
  concluidas, 
  role, 
  tecnicos,
  onDataChange // <-- 2. RECEBE A PROP
}: OsTabsProps) {
  
  const { token } = useAuth(); // <-- 3. PEGA O TOKEN PARA A API
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOs, setSelectedOs] = useState<EnrichedOS | null>(null);

  const handleAssignClick = (os: EnrichedOS) => {
    setSelectedOs(os);
    setIsModalOpen(true);
  };

  // --- 4. FUNÇÃO DE SUBMISSÃO ATUALIZADA PARA API ---
  const handleModalSubmit = async (tecnicoId: string) => {
    if (!selectedOs || !token) {
      toast.error("Erro: OS não selecionada ou sessão expirada.");
      return;
    }

    const chamadoId = selectedOs.id;
    const apiUrl = `http://localhost:3340/chamado/atribuir-tecnico/tecnico/${tecnicoId}/chamado/${chamadoId}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao atribuir técnico.");
      }

      toast.success("Técnico atribuído com sucesso! Atualizando lista...");
      
      onDataChange(); // <-- 5. CHAMA A FUNÇÃO PARA RECARREGAR OS DADOS
      
    } catch (error: any) {
      console.error("Erro ao atribuir técnico:", error);
      toast.error(error.message);
    } finally {
      setIsModalOpen(false);
      setSelectedOs(null);
      // REMOVIDO: window.location.reload();
    }
  };

  return (
    <>
      <Tabs defaultValue="pendentes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pendentes">
            Pendentes <Badge variant="secondary" className="ml-2">{pendentes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="em-andamento">
            Em Andamento <Badge variant="secondary" className="ml-2">{emAndamento.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pendentes">
          <Card>
            <CardContent className="p-0">
              {pendentes.length > 0 ? 
                <OsTable ordens={pendentes} role={role} onAssignClick={handleAssignClick} /> :
                <div className="p-10 text-center text-muted-foreground">Nenhuma OS pendente.</div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="em-andamento">
          <Card>
            <CardContent className="p-0">
              {emAndamento.length > 0 ? 
                <OsTable ordens={emAndamento} role={role} onAssignClick={handleAssignClick} /> :
                <div className="p-10 text-center text-muted-foreground">Nenhuma OS em andamento.</div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concluidas">
          <Card>
            <CardContent className="p-0">
              {concluidas.length > 0 ? 
                <OsTable ordens={concluidas} role={role} onAssignClick={handleAssignClick} /> :
                <div className="p-10 text-center text-muted-foreground">Nenhuma OS concluída.</div>
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* O Modal de Atribuição */}
      <AssignTechnicianModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        os={selectedOs}
        tecnicos={tecnicos}
        onSubmit={handleModalSubmit} // <-- Chama a nova função async
      />
    </>
  );
}