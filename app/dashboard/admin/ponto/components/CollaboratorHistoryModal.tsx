'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronRight, ChevronDown, Briefcase, AlertCircle, Download, MapPin 
} from "lucide-react";
import { format, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- IMPORTAÇÃO DAS LIBS DE PDF ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- TIPOS ---
interface HistoryEntry {
  date: string;
  dayName: string;
  status: 'PRESENT' | 'ABSENT' | 'WEEKEND' | 'HOLIDAY';
  entry?: string;
  exit?: string;
  lunchStart?: string;
  lunchEnd?: string;
  services: { client: string; activity: string; time: string }[];
}

interface CollaboratorHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; nome: string; email: string } | null;
}

// --- MOCK GENERATOR (Mantido igual) ---
const generateMonthHistory = (userId: string, monthOffset: number = 0): HistoryEntry[] => {
  const history: HistoryEntry[] = [];
  const today = new Date();
  const baseDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
  const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), i);
    if (currentDate > today) break;

    const isWknd = isWeekend(currentDate);
    let status: HistoryEntry['status'] = isWknd ? 'WEEKEND' : 'PRESENT';
    if (!isWknd && Math.random() > 0.9) status = 'ABSENT'; 

    const entry = status === 'PRESENT' ? `08:${Math.floor(Math.random() * 30).toString().padStart(2, '0')}` : undefined;
    const exit = status === 'PRESENT' ? '18:00' : undefined;
    
    const services = [];
    if (status === 'PRESENT') {
        services.push({ client: 'Padaria Pão Quente', activity: 'Manutenção Preventiva', time: '09:00 - 11:30' });
        if (Math.random() > 0.5) services.push({ client: 'Mercado Central', activity: 'Troca de Gás', time: '14:00 - 16:00' });
    }

    history.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      dayName: format(currentDate, 'EEEE', { locale: ptBR }),
      status,
      entry,
      exit,
      lunchStart: status === 'PRESENT' ? '12:00' : undefined,
      lunchEnd: status === 'PRESENT' ? '13:00' : undefined,
      services
    });
  }
  return history.reverse();
};

export function CollaboratorHistoryModal({ isOpen, onClose, user }: CollaboratorHistoryModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("0");
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      const data = generateMonthHistory(user.id, parseInt(selectedMonth));
      setHistoryData(data);
    }
  }, [isOpen, user, selectedMonth]);

  const toggleDay = (date: string) => {
    setExpandedDays(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  // --- FUNÇÃO DE EXPORTAR FOLHA DE PONTO (PDF) ---
  const handleExportFolha = () => {
    if (!user) return;

    const doc = new jsPDF();

    // 1. Cabeçalho
    doc.setFontSize(16);
    doc.text("Espelho de Ponto", 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Colaborador: ${user.nome}`, 14, 25);
    doc.text(`Email: ${user.email}`, 14, 30);
    doc.text(`Mês Referência: ${selectedMonth === "0" ? "Dezembro/2025" : "Novembro/2025"}`, 14, 35);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 150, 25);

    // 2. Preparar dados para a tabela
    // Invertemos de volta para ordem cronológica (dia 1 ao 30) para o relatório
    const tableRows = [...historyData].reverse().map(item => {
      const dia = format(new Date(item.date + 'T12:00:00'), 'dd/MM');
      const diaSemana = item.dayName.substring(0, 3).toUpperCase();
      
      let statusTexto = "";
      if (item.status === 'WEEKEND') statusTexto = "FIM DE SEMANA";
      else if (item.status === 'ABSENT') statusTexto = "FALTA";
      
      // Colunas: Data, Dia Sem, Ent 1, Sai 1, Ent 2, Sai 2, Obs/Status
      return [
        dia,
        diaSemana,
        item.entry || "-",
        item.lunchStart || "-",
        item.lunchEnd || "-",
        item.exit || "-",
        statusTexto || (item.services.length > 0 ? `${item.services.length} svcs` : "Normal")
      ];
    });

    // 3. Gerar Tabela
    autoTable(doc, {
      startY: 45,
      head: [['Data', 'Semana', 'Entrada', 'Saída Almoço', 'Volta Almoço', 'Saída', 'Observação']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
      styles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // 4. Rodapé de Assinatura
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.line(14, finalY + 40, 100, finalY + 40);
    doc.text("Assinatura do Colaborador", 14, finalY + 45);

    doc.line(110, finalY + 40, 196, finalY + 40);
    doc.text("Assinatura do Gestor", 110, finalY + 45);

    doc.save(`folha_ponto_${user.nome.replace(/\s/g, '_')}.pdf`);
  };

  if (!user) return null;

  const daysWorked = historyData.filter(d => d.status === 'PRESENT').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        
        {/* CABEÇALHO */}
        <DialogHeader className="p-6 pb-4 border-b bg-muted/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-primary text-white text-lg">{user.nome.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{user.nome}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                   {user.email} • Técnico Nível 1
                </DialogDescription>
              </div>
            </div>
            
            <div className="flex gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[160px] bg-background">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Dezembro 2025</SelectItem>
                    <SelectItem value="1">Novembro 2025</SelectItem>
                  </SelectContent>
                </Select>
                {/* BOTÃO DE EXPORTAR FOLHA */}
                <Button variant="outline" size="icon" title="Exportar Folha" onClick={handleExportFolha}>
                    <Download className="w-4 h-4" />
                </Button>
            </div>
          </div>
        </DialogHeader>

        {/* LISTA DE REGISTROS (SCROLLABLE) */}
        <ScrollArea className="flex-1 bg-muted/5">
           <div className="p-6 space-y-3">
              {historyData.map((item) => {
                 const isExpanded = expandedDays.includes(item.date);
                 const dateObj = new Date(item.date + 'T00:00:00');
                 const dayNum = format(dateObj, 'dd');
                 const isWeekendItem = item.status === 'WEEKEND';
                 const isAbsent = item.status === 'ABSENT';

                 return (
                    <div key={item.date} className={`border rounded-lg bg-card transition-all ${isAbsent ? 'border-red-200 bg-red-50/50' : 'hover:border-primary/50'}`}>
                        <div className="flex items-center p-3 cursor-pointer select-none" onClick={() => !isWeekendItem && toggleDay(item.date)}>
                            <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg mr-4 border ${isWeekendItem ? 'bg-muted text-muted-foreground border-muted' : isAbsent ? 'bg-red-100 text-red-700 border-red-200' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                <span className="text-lg font-bold leading-none">{dayNum}</span>
                                <span className="text-[9px] uppercase font-semibold">{item.dayName.substring(0,3)}</span>
                            </div>
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                {isWeekendItem ? <span className="text-sm text-muted-foreground italic col-span-4">Fim de semana</span> : isAbsent ? <span className="text-sm font-medium text-red-600 flex items-center gap-2 col-span-4"><AlertCircle className="w-4 h-4" /> Falta não justificada</span> : (
                                    <>
                                        <div className="flex flex-col"><span className="text-[10px] text-muted-foreground uppercase">Entrada</span><span className="text-sm font-mono font-medium">{item.entry}</span></div>
                                        <div className="hidden md:flex flex-col"><span className="text-[10px] text-muted-foreground uppercase">Almoço</span><span className="text-sm font-mono text-muted-foreground">{item.lunchStart} - {item.lunchEnd}</span></div>
                                        <div className="flex flex-col"><span className="text-[10px] text-muted-foreground uppercase">Saída</span><span className="text-sm font-mono font-medium">{item.exit || '--:--'}</span></div>
                                        <div className="flex items-center justify-end gap-2">
                                            {item.services.length > 0 && <Badge variant="secondary" className="text-[10px]">{item.services.length} Serviços</Badge>}
                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground"/> : <ChevronRight className="w-4 h-4 text-muted-foreground"/>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        {isExpanded && !isWeekendItem && !isAbsent && (
                            <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2">
                                <Separator className="mb-3" />
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2"><Briefcase className="w-3 h-3" /> Atividades Realizadas</h4>
                                <div className="space-y-2">
                                    {item.services.length > 0 ? item.services.map((srv, idx) => (
                                        <div key={idx} className="flex items-start gap-3 text-sm p-2 rounded bg-muted/50 border border-transparent hover:border-border transition-colors">
                                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                <div className="flex justify-between"><span className="font-semibold text-foreground">{srv.client}</span><span className="font-mono text-xs bg-background border px-1.5 rounded">{srv.time}</span></div>
                                                <p className="text-muted-foreground text-xs mt-0.5">{srv.activity}</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-xs text-muted-foreground italic pl-7">Nenhuma atividade externa registrada neste dia.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                 );
              })}
           </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}