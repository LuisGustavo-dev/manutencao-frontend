'use client';

import { useEffect, useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Wrench, CalendarCheck, Loader2, AlertCircle, UserX } from "lucide-react";

// Interfaces baseadas no JSON real da API
interface Tecnico {
  id: number;
  name: string;
}

interface RespostaChecklist {
  id: number;
  observacao: string | null;
  erro_controlador: string | null;
}

interface HistoryItem {
  id: number;
  tipo: string; // Ex: "Corretivo"
  horaAbertura: string;
  tecnico: Tecnico | null; // Pode ser null
  respostasChecklist: RespostaChecklist[];
}

interface HistoryModalProps {
  equipmentId: number | string;
  equipmentName: string;
  token: string;
}

export function HistoryModalContent({ equipmentId, equipmentName, token }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!equipmentId || !token) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:3000/equipamento/${equipmentId}/historico`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar histórico');
        }

        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar o histórico.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [equipmentId, token]);

  // Formatação de data e hora
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Função para extrair a descrição (prioriza observação, senão erro, senão padrão)
  const getDescription = (item: HistoryItem) => {
    const checklist = item.respostasChecklist[0]; // Pega a primeira resposta
    if (!checklist) return "Sem detalhes registrados.";
    
    if (checklist.observacao) return checklist.observacao;
    if (checklist.erro_controlador) return `Erro reportado: ${checklist.erro_controlador}`;
    
    return "Manutenção realizada sem observações.";
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Histórico: {equipmentName}</DialogTitle>
        <DialogDescription>
          Todas as manutenções passadas para este equipamento.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Carregando registros...
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex justify-center items-center py-8 text-destructive">
            <AlertCircle className="h-6 w-6 mr-2" />
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && history.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum registro encontrado.
          </div>
        )}

        {/* List */}
        {!isLoading && !error && history.map((item) => (
          <div key={item.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
            {/* Ícone */}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              item.tipo === 'Corretivo' ? 'bg-destructive/10' : 'bg-blue-100 dark:bg-blue-900/20'
            }`}>
              {item.tipo === 'Corretivo' ? 
                <Wrench className="h-5 w-5 text-destructive" /> : 
                <CalendarCheck className="h-5 w-5 text-blue-500" />
              }
            </div>
            
            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <p className="font-semibold text-sm truncate">
                  {item.tipo}
                  <span className="font-normal text-muted-foreground ml-2 inline-flex items-center">
                    {item.tecnico ? (
                        `Téc: ${item.tecnico.name}`
                    ) : (
                        <span className="flex items-center text-xs italic"><UserX className="h-3 w-3 mr-1"/> Sem técnico</span>
                    )}
                  </span>
                </p>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded whitespace-nowrap">
                    {formatDate(item.horaAbertura)}
                </span>
              </div>
              
              <p className="text-sm mt-1 text-gray-700 dark:text-gray-300 break-words">
                {getDescription(item)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}