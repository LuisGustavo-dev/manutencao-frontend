'use client';

import { useEffect, useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Wrench, CalendarCheck, Loader2, AlertCircle, UserX, User, Clock, Timer } from "lucide-react";

interface Pessoa {
  name: string;
}

interface HistoryItem {
  id: number;
  tipo: string;
  status: string;
  horaAbertura: string;
  horaInicioAtendimento: string | null;
  horaFinalizacao: string | null;
  user: Pessoa | null;
  tecnico: Pessoa | null;
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
      // DEBUG: Verifique no console do navegador (F12) o que está chegando
      console.log("Props recebidas:", { equipmentId, token });

      // Se não tiver ID ou Token, paramos o loading e saímos
      if (!equipmentId || !token) {
        console.warn("Faltando ID ou Token para buscar histórico");
        setIsLoading(false); 
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Buscando histórico na url: http://localhost:3340/equipamento/${equipmentId}/historico`);
        
        const response = await fetch(`http://localhost:3340/equipamento/${equipmentId}/historico`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Erro API: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dados recebidos:", data); // DEBUG
        setHistory(data);

      } catch (err) {
        console.error(err);
        setError("Erro ao carregar o histórico.");
      } finally {
        // O finally garante que o loading pare, independente de sucesso ou erro
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [equipmentId, token]);

  const formatDate = (dateString: string | null) => {
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

  // Helper para cor do status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'em andamento': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'concluído':
      case 'finalizado': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Histórico: {equipmentName}</DialogTitle>
        <DialogDescription>
          Todas as manutenções registradas para este equipamento.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
        {isLoading && (
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Carregando registros...
          </div>
        )}

        {!isLoading && error && (
          <div className="flex justify-center items-center py-8 text-destructive">
            <AlertCircle className="h-6 w-6 mr-2" />
            {error}
          </div>
        )}

        {!isLoading && !error && history.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum registro encontrado.
          </div>
        )}

        {!isLoading && !error && history.map((item) => (
          <div key={item.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
            {/* Ícone Lateral */}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              item.tipo === 'Corretivo' ? 'bg-destructive/10' : 'bg-blue-100 dark:bg-blue-900/20'
            }`}>
              {item.tipo === 'Corretivo' ? 
                <Wrench className="h-5 w-5 text-destructive" /> : 
                <CalendarCheck className="h-5 w-5 text-blue-500" />
              }
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Cabeçalho do Card */}
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-sm">
                    {item.tipo}
                  </p>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                
                <div className="text-right">
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded block">
                    Aberto: {formatDate(item.horaAbertura)}
                  </span>
                </div>
              </div>
              
              {/* Detalhes */}
              <div className="mt-3 text-sm grid grid-cols-1 gap-1 text-muted-foreground">
                
                {/* Solicitante */}
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>Solicitado por: <span className="font-medium text-foreground">{item.user?.name || "Sistema"}</span></span>
                </div>

                {/* Técnico */}
                <div className="flex items-center gap-2">
                  <Wrench className="h-3 w-3" />
                  <span>Técnico: <span className="font-medium text-foreground">{item.tecnico?.name || "Não atribuído"}</span></span>
                </div>

                {/* Data Início Atendimento */}
                <div className={`flex items-center gap-2 ${
                  item.horaInicioAtendimento 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-muted-foreground italic'
                }`}>
                  <Timer className="h-3 w-3" />
                  <span>
                    {item.horaInicioAtendimento 
                      ? `Iniciado em: ${formatDate(item.horaInicioAtendimento)}`
                      : "Ainda não começado"
                    }
                  </span>
                </div>

                {/* Data Finalização (se houver) */}
                {item.horaFinalizacao && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                    <Clock className="h-3 w-3" />
                    <span>Finalizado em: {formatDate(item.horaFinalizacao)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}