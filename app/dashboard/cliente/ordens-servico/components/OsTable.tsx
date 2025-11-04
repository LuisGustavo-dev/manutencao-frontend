'use client';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnrichedOS } from '../page';
import { Eye } from 'lucide-react';

interface OsTableProps {
  ordens: EnrichedOS[];
  role: string | null;
}

export function OsTable({ ordens, role }: OsTableProps) {
  const router = useRouter();

  const goToDetalhe = (id: string) => {
    // Cliente vai para a página de detalhes do cliente
    router.push(`/dashboard/cliente/ordens-servico-detalhe?id=${id}`);
  };

  const getStatusVariant = (status: string): "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'Em Andamento': return 'destructive';
      case 'Pendente': return 'secondary';
      case 'Concluída': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>OS / Data</TableHead>
          <TableHead>Equipamento</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordens.map((os) => (
          <TableRow key={os.id} className="cursor-pointer" onClick={() => goToDetalhe(os.id)}>
            <TableCell className="font-medium">
              <div>{os.id}</div>
              <div className="text-xs text-muted-foreground">{os.dataAbertura}</div>
            </TableCell>
            <TableCell>{os.equipamentoNome}</TableCell>
            <TableCell>
              <Badge variant={os.tipo === 'Corretiva' ? 'destructive' : 'secondary'}>{os.tipo}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(os.status)}
                    className={os.status === 'Concluída' ? 'text-green-600 border-green-600' : ''}>
                {os.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {/* O Cliente só tem uma ação: Acompanhar */}
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Acompanhar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}