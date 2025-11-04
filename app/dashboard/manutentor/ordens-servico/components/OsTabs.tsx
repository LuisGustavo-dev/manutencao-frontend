'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrichedOS } from '../page'; // Importa o tipo da página pai
import { Tecnico, mockOrdensServico } from '@/lib/mock-data';
import { OsTable } from './OsTable';
import { AssignTechnicianModal } from './AssignTechnicianModal';

interface OsTabsProps {
  pendentes: EnrichedOS[];
  emAndamento: EnrichedOS[];
  concluidas: EnrichedOS[];
  role: string | null;
  tecnicos: Tecnico[];
}

export function OsTabs({ 
  pendentes, 
  emAndamento, 
  concluidas, 
  role, 
  tecnicos 
}: OsTabsProps) {
  
  // --- Estado do Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOs, setSelectedOs] = useState<EnrichedOS | null>(null);

  const handleAssignClick = (os: EnrichedOS) => {
    setSelectedOs(os);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (tecnicoId: string) => {
    // --- LÓGICA DE SUBMISSÃO (MOCK) ---
    // Aqui você faria a chamada de API
    console.log(`Atribuindo OS ${selectedOs?.id} ao técnico ${tecnicoId}`);
    // Atualiza o mock localmente (apenas para demo)
    const osToUpdate = mockOrdensServico.find(os => os.id === selectedOs?.id);
    if(osToUpdate) {
      osToUpdate.tecnicoId = tecnicoId;
      osToUpdate.status = "Em Andamento"; // Opcional: Atribuir = Em Andamento
    }
    setIsModalOpen(false);
    setSelectedOs(null);
    // (Idealmente, a página pai faria o refetch, mas vamos recarregar por enquanto)
    window.location.reload(); 
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
        onSubmit={handleModalSubmit}
      />
    </>
  );
}