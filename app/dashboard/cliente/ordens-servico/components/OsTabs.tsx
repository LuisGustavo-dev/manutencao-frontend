'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrichedOS } from '../page'; // Importa o tipo da página pai
import { OsTable } from './OsTable';

interface OsTabsProps {
  pendentes: EnrichedOS[];
  emAndamento: EnrichedOS[];
  concluidas: EnrichedOS[];
  role: string | null;
}

export function OsTabs({ 
  pendentes, 
  emAndamento, 
  concluidas, 
  role 
}: OsTabsProps) {
  
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
                <OsTable ordens={pendentes} role={role} /> :
                <div className="p-10 text-center text-muted-foreground">Nenhuma OS pendente.</div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="em-andamento">
          <Card>
            <CardContent className="p-0">
              {emAndamento.length > 0 ? 
                <OsTable ordens={emAndamento} role={role} /> :
                <div className="p-10 text-center text-muted-foreground">Nenhuma OS em andamento.</div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concluidas">
          <Card>
            <CardContent className="p-0">
              {concluidas.length > 0 ? 
                <OsTable ordens={concluidas} role={role} /> :
                <div className="p-10 text-center text-muted-foreground">Nenhuma OS concluída.</div>
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}