'use client';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Importar Badge
import type { EnrichedOS } from '../page'; // Importa o tipo da página pai

interface SystemFeedTableProps {
  ordensPendentes: EnrichedOS[];
  onAssignClick: (os: EnrichedOS) => void;
}

export function SystemFeedTable({ ordensPendentes, onAssignClick }: SystemFeedTableProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Caixa de Entrada (OS Pendentes)</CardTitle>
        <CardDescription>Ordens de serviço aguardando atribuição.</CardDescription>
      </CardHeader>
      <CardContent>
        {ordensPendentes.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            Nenhuma OS pendente.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OS / Cliente</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordensPendentes.map((os) => (
                <TableRow key={os.id}>
                  <TableCell>
                    <div className="font-medium">{os.id}</div>
                    <div className="text-sm text-muted-foreground">{os.clienteNome}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant={os.tipo === 'Corretiva' ? 'destructive' : 'outline'} 
                      size="sm"
                      onClick={() => onAssignClick(os)} // <-- Chama a função do pai
                    >
                      Atribuir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}