"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  ChevronDown,
  Briefcase,
  AlertCircle,
  Download,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  format,
  isWeekend,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast"; // Opcional: para feedback de erro

// --- IMPORTAÇÃO DAS LIBS DE PDF ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "@/app/contexts/authContext"; // Ajuste o caminho conforme seu projeto

// --- TIPOS DA API ---
interface ApiRegistro {
  id: number;
  atividade: string;
  empresa: string;
  inicio: string;
}

interface ApiPonto {
  id: number;
  name: string;
  email: string;
  userId: number;
  entrada: string | null;
  almoco: string | null;
  retornoAlmoco: string | null;
  saida: string | null;
  registros: ApiRegistro[];
}

// --- TIPOS INTERNOS (UI) ---
interface HistoryEntry {
  date: string; // YYYY-MM-DD
  dayName: string;
  status: "PRESENT" | "ABSENT" | "WEEKEND" | "HOLIDAY";
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

export function CollaboratorHistoryModal({
  isOpen,
  onClose,
  user,
}: CollaboratorHistoryModalProps) {
  const { token } = useAuth(); // Recuperar token para a chamada API

  // Estado para Mês Selecionado (Formato YYYY-MM)
  // Inicializa com o mês atual
  const [selectedMonthStr, setSelectedMonthStr] = useState<string>(
    format(new Date(), "yyyy-MM")
  );

  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<ApiPonto[]>([]);

  // --- 1. GERAR LISTA DE MESES PARA O SELECT ---
  // Gera os últimos 6 meses dinamicamente
  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 6; i++) {
      const date = subMonths(new Date(), i);
      options.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy", { locale: ptBR }),
      });
    }
    return options;
  }, []);

  // --- 2. BUSCAR DADOS DA API ---
  const fetchHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Nota: A API retorna o histórico completo ou filtrado?
      // O endpoint fornecido é `/:id`. Assumindo que traz tudo ou o backend filtra.
      // Se precisar passar data na URL, adicione query params aqui.
      const response = await fetch(
        `http://localhost:3340/colaborador/historico-ponto-admin/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao buscar histórico");

      const data: ApiPonto[] = await response.json();
      setApiData(data); // Salva os dados brutos
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar o histórico.");
      setApiData([]);
    } finally {
      setLoading(false);
    }
  };

  // Chama a API quando o modal abre ou o usuário muda
  useEffect(() => {
    if (isOpen && user) {
      fetchHistory();
      // Resetar mês selecionado para atual ao abrir
      setSelectedMonthStr(format(new Date(), "yyyy-MM"));
    }
  }, [isOpen, user]);

  // --- 3. PROCESSAR E MESCLAR DADOS (CALENDÁRIO + API) ---
  useEffect(() => {
    if (!selectedMonthStr) return;

    // Data base do mês selecionado
    const [year, month] = selectedMonthStr.split("-").map(Number);
    const dateBase = new Date(year, month - 1, 1); // JS Month é 0-indexado

    const start = startOfMonth(dateBase);
    const end = endOfMonth(dateBase);
    const today = new Date();

    // Gera todos os dias do mês selecionado
    const daysInMonth = eachDayOfInterval({ start, end });

    const processedHistory: HistoryEntry[] = daysInMonth
      .map((dayDate) => {
        // Verifica se o dia é futuro
        if (dayDate > today) return null;

        // Procura registro na API para este dia
        // O filtro verifica se a string ISO 'entrada' bate com o dia atual do loop
        const recordsForDay = apiData.filter(
          (record) =>
            record.entrada && isSameDay(parseISO(record.entrada), dayDate)
        );

        // Definição de Status Básico
        const isWknd = isWeekend(dayDate);
        let status: HistoryEntry["status"] = isWknd ? "WEEKEND" : "ABSENT";

        // Se houver registros da API
        let entryTime, exitTime, lunchStart, lunchEnd;
        let services: HistoryEntry["services"] = [];

        if (recordsForDay.length > 0) {
          status = "PRESENT";

          // Lógica para múltiplos registros no mesmo dia (ex: turnos quebrados ou erro de registro)
          // Aqui pegamos o primeiro registro encontrado para simplificar,
          // ou você pode pegar a menor entrada e maior saída se houver múltiplos objetos
          const mainRecord = recordsForDay[0];

          entryTime = mainRecord.entrada
            ? format(parseISO(mainRecord.entrada), "HH:mm")
            : undefined;
          lunchStart = mainRecord.almoco
            ? format(parseISO(mainRecord.almoco), "HH:mm")
            : undefined;
          lunchEnd = mainRecord.retornoAlmoco
            ? format(parseISO(mainRecord.retornoAlmoco), "HH:mm")
            : undefined;
          exitTime = mainRecord.saida
            ? format(parseISO(mainRecord.saida), "HH:mm")
            : undefined;

          // Mapear os serviços (atividades externas) de todos os registros do dia
          recordsForDay.forEach((rec) => {
            rec.registros.forEach((reg) => {
              services.push({
                client: reg.empresa,
                activity: reg.atividade,
                time: format(parseISO(reg.inicio), "HH:mm"),
              });
            });
          });
        }

        return {
          date: format(dayDate, "yyyy-MM-dd"),
          dayName: format(dayDate, "EEEE", { locale: ptBR }),
          status,
          entry: entryTime,
          exit: exitTime,
          lunchStart,
          lunchEnd,
          services,
        };
      })
      .filter(Boolean) as HistoryEntry[]; // Remove dias futuros (null)

    // Ordena do mais recente para o mais antigo (opcional, igual ao mock anterior)
    setHistoryData(processedHistory.reverse());
  }, [apiData, selectedMonthStr]); // Reexecuta quando a API retorna ou o mês muda

  const toggleDay = (date: string) => {
    setExpandedDays((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  // --- FUNÇÃO DE EXPORTAR FOLHA DE PONTO (PDF) ---
  const handleExportFolha = () => {
    if (!user) return;

    const doc = new jsPDF();
    const [ano, mes] = selectedMonthStr.split("-");
    const nomeMes = format(
      new Date(parseInt(ano), parseInt(mes) - 1, 1),
      "MMMM/yyyy",
      { locale: ptBR }
    );

    // 1. Cabeçalho
    doc.setFontSize(16);
    doc.text("Espelho de Ponto Detalhado", 14, 15);

    doc.setFontSize(10);
    doc.text(`Colaborador: ${user.nome}`, 14, 25);
    doc.text(`Email: ${user.email}`, 14, 30);
    doc.text(
      `Mês Referência: ${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}`,
      14,
      35
    );
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 140, 25);

    // 2. Tabela
    // Reverte para ordem cronológica para o relatório
    const tableRows = [...historyData].reverse().map((item) => {
      const dateObj = parseISO(item.date);
      const dia = format(dateObj, "dd/MM");
      const diaSemana = item.dayName.substring(0, 3).toUpperCase();

      let statusTexto = "";
      if (item.status === "WEEKEND") statusTexto = "FIM DE SEMANA";
      else if (item.status === "ABSENT") statusTexto = "FALTA";

      // Se tem serviços, lista no status ou observação
      const obs =
        item.services.length > 0
          ? `${item.services.length} atendimentos externos`
          : statusTexto || "Normal";

      return [
        dia,
        diaSemana,
        item.entry || "-",
        item.lunchStart || "-",
        item.lunchEnd || "-",
        item.exit || "-",
        obs,
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: [
        [
          "Data",
          "Sem.",
          "Entrada",
          "Saída Almoço",
          "Volta Almoço",
          "Saída",
          "Observação",
        ],
      ],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [40, 40, 40] },
      styles: { fontSize: 8, cellPadding: 2 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      // Destaque para linhas de fim de semana ou falta
      didParseCell: function (data) {
        if (data.section === "body") {
          const rowStatus = (data.row.raw as string[])[6]; // Coluna Observação
          if (rowStatus === "FIM DE SEMANA") {
            data.cell.styles.textColor = [150, 150, 150];
          }
          if (rowStatus === "FALTA") {
            data.cell.styles.textColor = [220, 50, 50];
          }
        }
      },
    });

    // 3. Rodapé
    const finalY = (doc as any).lastAutoTable.finalY || 150;

    if (finalY < 250) {
      doc.setLineWidth(0.5);
      doc.line(14, finalY + 30, 90, finalY + 30);
      doc.text("Assinatura do Colaborador", 14, finalY + 35);

      doc.line(110, finalY + 30, 190, finalY + 30);
      doc.text("Assinatura do Gestor", 110, finalY + 35);
    } else {
      doc.addPage();
      doc.line(14, 40, 90, 40);
      doc.text("Assinatura do Colaborador", 14, 45);
      doc.line(110, 40, 190, 40);
      doc.text("Assinatura do Gestor", 110, 45);
    }

    doc.save(
      `folha_ponto_${user.nome.replace(/\s/g, "_")}_${selectedMonthStr}.pdf`
    );
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* CABEÇALHO */}
        <DialogHeader className="p-6 pb-4 border-b bg-muted/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-primary text-white text-lg">
                  {user.nome.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{user.nome}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  {user.email}
                </DialogDescription>
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={selectedMonthStr}
                onValueChange={setSelectedMonthStr}
              >
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* BOTÃO DE EXPORTAR FOLHA */}
              <Button
                variant="outline"
                size="icon"
                title="Exportar Folha"
                onClick={handleExportFolha}
                disabled={loading || historyData.length === 0}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* LISTA DE REGISTROS (SCROLLABLE) */}
        <ScrollArea className="flex-1 bg-muted/5">
          <div className="p-6 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                <p>Carregando histórico...</p>
              </div>
            ) : historyData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum registro encontrado para este mês.</p>
              </div>
            ) : (
              historyData.map((item) => {
                const isExpanded = expandedDays.includes(item.date);
                const dayNum = format(parseISO(item.date), "dd");
                const isWeekendItem = item.status === "WEEKEND";
                const isAbsent = item.status === "ABSENT";

                return (
                  <div
                    key={item.date}
                    className={`border rounded-lg bg-card transition-all ${
                      isAbsent
                        ? "border-red-200 bg-red-50/50"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div
                      className="flex items-center p-3 cursor-pointer select-none"
                      onClick={() => !isWeekendItem && toggleDay(item.date)}
                    >
                      <div
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg mr-4 border ${
                          isWeekendItem
                            ? "bg-muted text-muted-foreground border-muted"
                            : isAbsent
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
                        <span className="text-lg font-bold leading-none">
                          {dayNum}
                        </span>
                        <span className="text-[9px] uppercase font-semibold">
                          {item.dayName.substring(0, 3)}
                        </span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                        {isWeekendItem ? (
                          <span className="text-sm text-muted-foreground italic col-span-4">
                            Fim de semana
                          </span>
                        ) : isAbsent ? (
                          <span className="text-sm font-medium text-red-600 flex items-center gap-2 col-span-4">
                            <AlertCircle className="w-4 h-4" /> Falta / Sem
                            registro
                          </span>
                        ) : (
                          <>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-muted-foreground uppercase">
                                Entrada
                              </span>
                              <span className="text-sm font-mono font-medium">
                                {item.entry}
                              </span>
                            </div>
                            <div className="hidden md:flex flex-col">
                              <span className="text-[10px] text-muted-foreground uppercase">
                                Almoço
                              </span>
                              <span className="text-sm font-mono text-muted-foreground">
                                {item.lunchStart
                                  ? `${item.lunchStart} - ${
                                      item.lunchEnd || "?"
                                    }`
                                  : "Não reg."}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-muted-foreground uppercase">
                                Saída
                              </span>
                              <span className="text-sm font-mono font-medium">
                                {item.exit || "--:--"}
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              {item.services.length > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {item.services.length} Serviços
                                </Badge>
                              )}
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {isExpanded && !isWeekendItem && !isAbsent && (
                      <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2">
                        <Separator className="mb-3" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                          <Briefcase className="w-3 h-3" /> Atividades
                          Realizadas
                        </h4>
                        <div className="space-y-2">
                          {item.services.length > 0 ? (
                            item.services.map((srv, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 text-sm p-2 rounded bg-muted/50 border border-transparent hover:border-border transition-colors"
                              >
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <span className="font-semibold text-foreground">
                                      {srv.client}
                                    </span>
                                    <span className="font-mono text-xs bg-background border px-1.5 rounded">
                                      {srv.time}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground text-xs mt-0.5">
                                    {srv.activity}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground italic pl-7">
                              Nenhuma atividade externa registrada neste dia.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
