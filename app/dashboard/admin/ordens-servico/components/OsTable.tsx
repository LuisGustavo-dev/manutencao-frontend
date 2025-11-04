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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EnrichedOS } from '../page';
import { MoreHorizontal, UserPlus, Eye } from 'lucide-react';

interface OsTableProps {
  ordens: EnrichedOS[];
  role: string | null;
  onAssignClick: (os: EnrichedOS) => void;
}

export function OsTable({ ordens, role, onAssignClick }: OsTableProps) {
  const router = useRouter();

  const goToDetalhe = (id: string) => {
    router.push(`/dashboard/ordens-servico-detalhe?id=${id}`);
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
          {role !== 'Cliente' && <TableHead>Cliente</TableHead>}
          <TableHead>Equipamento</TableHead>
          {role !== 'Cliente' && <TableHead>Técnico</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordens.map((os) => (
          <TableRow key={os.id}>
            <TableCell className="font-medium">
              <div>{os.id}</div>
              <div className="text-xs text-muted-foreground">{os.dataAbertura}</div>
            </TableCell>
            {role !== 'Cliente' && <TableCell>{os.clienteNome}</TableCell>}
            <TableCell>{os.equipamentoNome}</TableCell>
            {role !== 'Cliente' && (
              <TableCell>
                {os.tecnicoNome ? (
                  <Badge variant="outline">{os.tecnicoNome}</Badge>
                ) : (
                  <Badge variant="secondary">Não atribuído</Badge>
                )}
              </TableCell>
            )}
            <TableCell>
              <Badge variant={getStatusVariant(os.status)}
                    className={os.status === 'Concluída' ? 'text-green-600 border-green-600' : ''}>
                {os.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {role === 'Cliente' ? (
                // --- Visão do Cliente ---
                <Button variant="outline" size="sm" onClick={() => goToDetalhe(os.id)}>
                  Acompanhar
                </Button>
              ) : (
                // --- Visão do Admin/Manutentor ---
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => goToDetalhe(os.id)}>
                      <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAssignClick(os)}>
                      <UserPlus className="mr-2 h-4 w-4" /> 
                      {os.tecnicoId ? 'Mudar Técnico' : 'Atribuir Técnico'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}