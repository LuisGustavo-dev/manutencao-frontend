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
import { MoreHorizontal, Eye, HardHat, CheckCircle } from 'lucide-react'; // Ícones diferentes
import { useAuth } from '@/app/contexts/authContext'; // Importa Auth

interface OsTableProps {
  ordens: EnrichedOS[];
  role: string | null;
  // Removido: onAssignClick
}

export function OsTable({ ordens, role }: OsTableProps) {
  const router = useRouter();
  const { role: loggedInRole } = useAuth(); // Pega a role (para simulação)

  // O Manutentor vai para a página de detalhes do manutentor
  const goToDetalhe = (id: string) => {
    router.push(`/dashboard/manutentor/ordens-servico-detalhe?id=${id}`);
  };

  // O Manutentor vai para a página do EQUIPAMENTO para executar a OS
  const goToExecutar = (equipamentoId: string) => {
    router.push(`/equipamento?id=${equipamentoId}`);
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
          <TableHead>Cliente</TableHead>
          <TableHead>Equipamento</TableHead>
          {/* A coluna "Técnico" é desnecessária se estiver filtrado
              (mas o Admin simulando pode querer ver) */}
          {loggedInRole === 'Admin' && <TableHead>Técnico</TableHead>}
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
            <TableCell>{os.clienteNome}</TableCell>
            <TableCell>{os.equipamentoNome}</TableCell>
            {loggedInRole === 'Admin' && (
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
              {/* O Manutentor vê ações de EXECUÇÃO */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* 1. Botão "Iniciar" ou "Continuar" */}
                  {os.status !== 'Concluída' && (
                    <DropdownMenuItem onClick={() => goToExecutar(os.equipamentoId)}>
                      <HardHat className="mr-2 h-4 w-4" /> 
                      {os.status === 'Pendente' ? 'Iniciar OS' : 'Continuar OS'}
                    </DropdownMenuItem>
                  )}
                  
                  {/* 2. Botão "Ver Detalhes" (página read-only) */}
                  <DropdownMenuItem onClick={() => goToDetalhe(os.id)}>
                    <Eye className="mr-2 h-4 w-4" /> 
                    {os.status === 'Concluída' ? 'Ver Resumo' : 'Acompanhar'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}