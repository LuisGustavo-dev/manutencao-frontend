'use client';

import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Wrench, CalendarCheck } from "lucide-react";

// Mock de dados apenas para este componente
const mockHistory = [
  { id: 1, type: "Corretiva", date: "02/11/2025", tech: "Luis G.", desc: "Relé de fase trocado." },
  { id: 2, type: "Preventiva", date: "28/10/2025", tech: "Ana S.", desc: "Troca de óleo e filtros." },
  { id: 3, type: "Corretiva", date: "15/09/2025", tech: "Luis G.", desc: "Vazamento de gás corrigido." },
];

interface HistoryModalProps {
  equipmentName: string;
}

export function HistoryModalContent({ equipmentName }: HistoryModalProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Histórico: {equipmentName}</DialogTitle>
        <DialogDescription>
          Todas as manutenções passadas para este equipamento.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
        {mockHistory.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            {/* Ícone baseado no tipo */}
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                item.type === 'Corretiva' ? 'bg-destructive/10' : 'bg-blue-100 dark:bg-blue-900/20'
            }`}>
              {item.type === 'Corretiva' ? 
                <Wrench className="h-5 w-5 text-destructive" /> : 
                <CalendarCheck className="h-5 w-5 text-blue-500" />
              }
            </div>
            {/* Informações */}
            <div className="flex-1">
              <p className="font-semibold">{item.type} (Téc: {item.tech})</p>
              <p className="text-sm text-muted-foreground">{item.date}</p>
              <p className="text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}