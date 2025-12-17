'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, History, AlertCircle, ChevronLeft, ChevronRight, Calendar as CalendarIcon 
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Bibliotecas de Data e PDF
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, isWeekend, isSameDay, differenceInMinutes, parseISO 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/contexts/authContext';

// --- TIPOS ---
type PointStatus = 'COMPLETE' | 'MISSING' | 'WEEKEND' | 'ABSENT' | 'FUTURE';

interface ApiPointRecord {
    id: number;
    entrada: string;
    almoco?: string;
    retornoAlmoço?: string;
    saida?: string;
}

interface PointEntry {
  date: Date;
  entry?: string;
  lunchOut?: string;
  lunchIn?: string;
  exit?: string;
  totalHours: string; 
  status: PointStatus;
}

const API_URL = "http://localhost:3340";

export default function HistoricoPontoPage() {
  const { user, token } = useAuth(); // Assumindo que você tem o token no contexto
  const [currentDate, setCurrentDate] = useState(new Date());
  const [historyData, setHistoryData] = useState<PointEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- HELPER: Converter minutos em HH:mm ---
  const minutesToHHmm = (minutes: number) => {
    if (isNaN(minutes) || minutes < 0) return "00:00";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // --- 1. BUSCAR E PROCESSAR DADOS ---
  const fetchAndProcessData = useCallback(async () => {
    if (!token || !user?.id) return;

    setIsLoading(true);
    try {
        // Busca o histórico completo (ou filtrado, dependendo de como sua API evoluir)
        const response = await fetch(`${API_URL}/colaborador/historico-ponto/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        let apiData: ApiPointRecord[] = [];
        if (response.ok) {
            apiData = await response.json();
        }

        // Gera todos os dias do mês selecionado visualmente
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const daysInMonth = eachDayOfInterval({ start, end });
        const today = new Date();

        const processedData: PointEntry[] = daysInMonth.map(day => {
            // 1. Tenta encontrar um registro da API para este dia
            // Nota: Se houver múltiplos registros no mesmo dia, pegamos o primeiro encontrado ou precisaríamos somar
            // Com base no JSON, filtramos pelo dia da entrada
            const record = apiData.find(item => isSameDay(parseISO(item.entrada), day));

            // A. Cenário: Dia Futuro
            if (day > today) {
                return { date: day, totalHours: '-', status: 'FUTURE' };
            }

            // B. Cenário: Fim de Semana (e sem registro de trabalho extra)
            if (isWeekend(day) && !record) {
                return { date: day, totalHours: '-', status: 'WEEKEND' };
            }

            // C. Cenário: Sem registro no dia (Falta)
            if (!record) {
                // Se já passou o dia e não é fds, é falta
                return { date: day, totalHours: '00:00', status: 'ABSENT' };
            }

            // D. Cenário: Tem registro (Calcula Horas)
            const entrada = parseISO(record.entrada);
            const saida = record.saida ? parseISO(record.saida) : null;
            const almoco = record.almoco ? parseISO(record.almoco) : null;
            const retorno = record.retornoAlmoço ? parseISO(record.retornoAlmoço) : null;

            let minutesWorked = 0;
            let status: PointStatus = 'COMPLETE';

            if (saida) {
                // Diferença total bruta (Entrada -> Saída)
                const totalDiff = differenceInMinutes(saida, entrada);
                
                // Desconta almoço se houver
                let lunchDiff = 0;
                if (almoco && retorno) {
                    lunchDiff = differenceInMinutes(retorno, almoco);
                } else if (almoco && !retorno) {
                    // Almoço em aberto?
                    status = 'MISSING';
                }

                minutesWorked = totalDiff - lunchDiff;
            } else {
                status = 'MISSING'; // Não bateu saída ainda
            }

            return {
                date: day,
                entry: format(entrada, 'HH:mm'),
                lunchOut: almoco ? format(almoco, 'HH:mm') : undefined,
                lunchIn: retorno ? format(retorno, 'HH:mm') : undefined,
                exit: saida ? format(saida, 'HH:mm') : undefined,
                totalHours: status === 'MISSING' ? 'Em andamento' : minutesToHHmm(minutesWorked),
                status: status
            };
        });

        // Ordena: Dias mais recentes primeiro na lista
        setHistoryData(processedData.reverse());

    } catch (error) {
        console.error("Erro ao buscar histórico", error);
        toast.error("Erro ao carregar histórico.");
    } finally {
        setIsLoading(false);
    }
  }, [currentDate, token, user?.id]);

  useEffect(() => {
    fetchAndProcessData();
  }, [fetchAndProcessData]);

  // --- 2. CÁLCULOS (KPIs) ---
  const stats = useMemo(() => {
    // Filtra apenas dias completos para contar dias trabalhados
    const workedDays = historyData.filter(d => d.status === 'COMPLETE' || d.status === 'MISSING').length;
    
    // Cálculo simples de saldo (Exemplo: soma horas reais trabalhadas vs meta mensal)
    // Aqui faremos uma estimativa baseada nos dados carregados
    let totalMinutesMonth = 0;
    historyData.forEach(d => {
        if (d.status === 'COMPLETE' && d.totalHours !== 'Em andamento') {
            const [h, m] = d.totalHours.split(':').map(Number);
            totalMinutesMonth += (h * 60) + m;
        }
    });

    const hours = Math.floor(totalMinutesMonth / 60);
    const mins = totalMinutesMonth % 60;
    
    return {
      workedDays,
      totalHours: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}h`
    };
  }, [historyData]);

  // --- 3. NAVEGAÇÃO DE DATA ---
  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  // --- 4. EXPORTAR PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Espelho de Ponto Individual", 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Colaborador: ${user?.nome || 'Colaborador'}`, 14, 25);
    doc.text(`Período: ${format(currentDate, 'MMMM / yyyy', { locale: ptBR })}`, 14, 30);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 140, 25);

    const tableRows = historyData.map(item => {
      const dia = format(item.date, 'dd/MM (EEE)', { locale: ptBR });
      
      let statusText = item.totalHours;
      if (item.status === 'WEEKEND') statusText = 'Fim de Semana';
      if (item.status === 'ABSENT') statusText = 'FALTA';
      if (item.status === 'MISSING') statusText = 'Incompleto';

      return [
        dia,
        item.entry || '-',
        item.lunchOut || '-',
        item.lunchIn || '-',
        item.exit || '-',
        statusText
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [['Data', 'Entrada', 'Saída Almoço', 'Volta Almoço', 'Saída', 'Total / Obs']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
      styles: { fontSize: 8, cellPadding: 2 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Rodapé Assinatura
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.line(14, finalY + 30, 90, finalY + 30);
    doc.text("Assinatura Colaborador", 14, finalY + 35);
    
    doc.line(110, finalY + 30, 190, finalY + 30);
    doc.text("Visto do Gestor", 110, finalY + 35);

    doc.save(`ponto_${format(currentDate, 'MM-yyyy')}.pdf`);
    toast.success("Relatório baixado com sucesso!");
  };

  // Encontra inconsistências para mostrar o alerta
  const inconsistencias = historyData.filter(d => d.status === 'MISSING');

  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* CABEÇALHO E CONTROLES */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        
        {/* Navegação de Mês */}
        <div className="flex items-center gap-4 bg-muted/30 p-1 rounded-lg border">
           <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
             <ChevronLeft className="w-5 h-5" />
           </Button>
           <div className="flex items-center gap-2 min-w-[140px] justify-center">
             <CalendarIcon className="w-4 h-4 text-muted-foreground" />
             <span className="font-semibold capitalize text-lg">
               {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
             </span>
           </div>
           <Button variant="ghost" size="icon" onClick={handleNextMonth} disabled={addMonths(currentDate, 1) > new Date()}>
             <ChevronRight className="w-5 h-5" />
           </Button>
        </div>

        <div className="flex items-center gap-2">
           <Button onClick={handleExportPDF} className="gap-2 bg-primary hover:bg-primary/90">
             <Download className="w-4 h-4" /> Baixar Folha em PDF
           </Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="p-4 flex flex-col items-center justify-center py-6">
            <p className="text-xs font-bold uppercase text-blue-600 mb-1">Horas Trabalhadas</p>
            <p className="text-3xl font-bold text-blue-900">{isLoading ? '...' : stats.totalHours}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center py-6">
            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Dias Trabalhados</p>
            <p className="text-3xl font-bold">{isLoading ? '...' : stats.workedDays}</p>
          </CardContent>
        </Card>
        <Card>
           <CardContent className="p-4 flex flex-col items-center justify-center py-6">
            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Faltas / Ausências</p>
            <p className="text-3xl font-bold text-red-600">{historyData.filter(d => d.status === 'ABSENT').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* ALERTA DE INCONSISTÊNCIA */}
      {inconsistencias.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3 animate-pulse">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-bold">Atenção: Inconsistências encontradas</p>
            <p>Há {inconsistencias.length} dia(s) com registro de saída pendente ({inconsistencias.map(d => format(d.date, 'dd/MM')).join(', ')}). Contate seu gestor.</p>
          </div>
        </div>
      )}

      {/* TABELA DE PONTO */}
      <Card>
        <CardHeader className="bg-muted/40 py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" /> Detalhamento Diário
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[150px]">Data</TableHead>
                  <TableHead className="text-center">Entrada</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Almoço (S)</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Almoço (V)</TableHead>
                  <TableHead className="text-center">Saída</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">Carregando histórico...</TableCell>
                    </TableRow>
                ) : historyData.map((row, i) => (
                  <TableRow 
                    key={i} 
                    className={`
                      ${row.status === 'WEEKEND' ? 'bg-muted/30 text-muted-foreground' : ''}
                      ${row.status === 'ABSENT' ? 'bg-red-50 hover:bg-red-100' : ''}
                      ${row.status === 'FUTURE' ? 'opacity-50' : ''}
                    `}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className={isSameDay(row.date, new Date()) ? "text-primary font-bold" : ""}>
                          {format(row.date, 'dd/MM', { locale: ptBR })}
                        </span>
                        <span className="text-[10px] uppercase text-muted-foreground">
                          {format(row.date, 'EEEE', { locale: ptBR })}
                        </span>
                      </div>
                    </TableCell>
                    
                    {row.status === 'WEEKEND' ? (
                      <TableCell colSpan={4} className="text-center text-xs italic opacity-70">
                        Fim de Semana
                      </TableCell>
                    ) : row.status === 'ABSENT' ? (
                      <TableCell colSpan={4} className="text-center font-bold text-red-500 text-xs">
                        FALTA / SEM REGISTRO
                      </TableCell>
                    ) : row.status === 'FUTURE' ? (
                      <TableCell colSpan={4} className="text-center text-xs text-muted-foreground">
                        -
                      </TableCell>
                    ) : (
                      <>
                        <TableCell className="text-center font-mono text-sm">{row.entry || '-'}</TableCell>
                        <TableCell className="text-center font-mono text-sm hidden sm:table-cell text-muted-foreground">{row.lunchOut || '-'}</TableCell>
                        <TableCell className="text-center font-mono text-sm hidden sm:table-cell text-muted-foreground">{row.lunchIn || '-'}</TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {row.exit ? row.exit : <span className="text-red-500 font-bold">--:--</span>}
                        </TableCell>
                      </>
                    )}

                    <TableCell className="text-right">
                      {row.status === 'MISSING' ? (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">Incompleto</Badge>
                      ) : (
                        <span className={`font-mono text-sm ${row.status === 'COMPLETE' ? 'font-bold' : ''}`}>
                          {row.totalHours}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}