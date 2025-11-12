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
import { EnrichedOS } from '../page'; // Assumindo que o tipo EnrichedOS está na página pai
import { Eye, Clock, Play, Check } from 'lucide-react';

interface OsTableProps {
  ordens: EnrichedOS[];
  role: string | null;
}

// --- HELPERS DE FORMATAÇÃO DE DATA/HORA ---
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) {
    return null; // Retorna nulo se a data não existir
  }
  try {
    const date = new Date(dateString);
    const data = date.toLocaleDateString('pt-BR');
    const hora = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${data} às ${hora}`;
  } catch (e) {
    return 'Data inválida';
  }
};
// --- FIM DOS HELPERS ---

export function OsTable({ ordens, role }: OsTableProps) {
  const router = useRouter();

  // --- ATUALIZADO: Navega com ambos os IDs ---
  const goToDetalhe = (osId: string, equipamentoId: string) => {
    router.push(`/dashboard/cliente/ordens-servico-detalhe?osId=${osId}&equipId=${equipamentoId}`);
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
          {/* --- COLUNAS ATUALIZADAS --- */}
          <TableHead>OS</TableHead>
          <TableHead>Equipamento</TableHead>
          <TableHead className="hidden lg:table-cell">Horários</TableHead> {/* <-- NOVA COLUNA */}
          <TableHead className="hidden md:table-cell">Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ação</TableHead>
          {/* --- FIM DA ATUALIZAÇÃO --- */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordens.map((os) => {
          // --- Formata todos os horários ---
          const abertura = formatDateTime(os.dataAbertura);
          const inicio = formatDateTime(os.horaInicioAtendimento);
          const finalizacao = formatDateTime(os.horaFinalizacao);

          return (
            // --- ATUALIZADO: onClick envia ambos os IDs ---
            <TableRow key={os.id} className="cursor-pointer" onClick={() => goToDetalhe(os.id, os.equipamentoId)}>
              
              {/* --- CÉLULA 1: ID DA OS --- */}
              <TableCell className="font-medium">
                <div className="font-bold">{os.id}</div>
              </TableCell>

              {/* --- CÉLULA 2: EQUIPAMENTO --- */}
              <TableCell>{os.equipamentoNome}</TableCell>
              
              {/* --- CÉLULA 3: HORÁRIOS (NOVA) --- */}
              <TableCell className="hidden lg:table-cell">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> 
                  <strong>Abertura:</strong> 
                  {abertura || 'N/A'}
                </div>
                {inicio && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Play className="h-3 w-3 text-blue-500" /> 
                    <strong>Início:</strong> 
                    {inicio}
                  </div>
                )}
                {finalizacao && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-green-600" /> 
                    <strong>Fim:</strong> 
                    {finalizacao}
                  </div>
                )}
              </TableCell>

              {/* --- CÉLULA 4: TIPO --- */}
              <TableCell className="hidden md:table-cell">
                <Badge variant={os.tipo === 'Corretiva' ? 'destructive' : 'secondary'}>{os.tipo}</Badge>
              </TableCell>
              
              {/* --- CÉLULA 5: STATUS --- */}
              <TableCell>
                <Badge variant={getStatusVariant(os.status)}
                      className={os.status === 'Concluída' ? 'text-green-600 border-green-600' : ''}>
                  {os.status}
                </Badge>
              </TableCell>
              
              {/* --- CÉLULA 6: AÇÃO --- */}
              <TableCell className="text-right">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Acompanhar</span>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}