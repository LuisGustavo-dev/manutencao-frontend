"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// --- Ícones e Utils ---
import {
  Search,
  Download,
  MapPin,
  Briefcase,
  AlertCircle,
  LayoutGrid,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

// --- Libs de PDF ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CollaboratorHistoryModal } from "./components/CollaboratorHistoryModal";
import { useAuth } from "@/app/contexts/authContext";

// --- INTERFACES DA API ---
interface RegistroAtividade {
  id: number;
  atividade: string;
  empresa: number; // ID da empresa
  inicio: string; // ISO Date
}

interface Collaborator {
  id: number;
  name: string;
  email: string;
  entrada: string | null;
  almoco: string | null;
  retornoAlmoco: string | null;
  saida: string | null;
  externo: boolean;
  registros: RegistroAtividade[];
}

export default function AdminPontoPage() {
  // --- ESTADOS ---
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Controle de Visualização
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  // Adaptado para aceitar a estrutura do user (id number e name)
  const [historyUser, setHistoryUser] = useState<{
    id: string | number;
    nome: string;
    email: string;
  } | null>(null);

  const { token } = useAuth();

  // --- BUSCA DE DADOS (API) ---
  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      // 1. Formata a data selecionada para o padrão internacional YYYY-MM-DD
      // Se não houver data selecionada, usa a data de hoje.
      const dataFormatada = date
        ? format(date, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");

      // 2. Adiciona a data como parâmetro na URL (?date=...)
      // Certifique-se que seu backend espera 'date', 'data' ou 'day'.
      // Estou usando 'date' como padrão comum.
      const url = `http://localhost:3340/colaborador/?date=${dataFormatada}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Falha ao buscar dados");

      const data = await response.json();

      // Garante que é um array
      const dataArray = Array.isArray(data) ? data : [data];
      setCollaborators(dataArray);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar colaboradores.");
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
    // O useEffect depende da data se o backend suportar filtro.
    // Se não, filtramos no front ou apenas recarregamos.
  }, [date]);

  // --- LÓGICA DE STATUS E FILTROS ---

  // Função auxiliar para determinar status baseado nos campos da API
  const getStatus = (colab: Collaborator) => {
    if (colab.saida) return "SAIU";
    if (colab.almoco && !colab.retornoAlmoco) return "ALMOCO";
    if (colab.externo) return "EM_SERVICO";
    if (colab.entrada) return "DISPONIVEL";
    return "AUSENTE";
  };

  // Aplicação dos Filtros (Nome/Email e Status)
  const listaFiltrada = useMemo(() => {
    return collaborators.filter((colab) => {
      const statusAtual = getStatus(colab);
      const termo = searchTerm.toLowerCase();

      // Filtro de Texto
      const matchNomeEmail =
        (colab.name || "").toLowerCase().includes(termo) ||
        (colab.email || "").toLowerCase().includes(termo);

      // Filtro de Status
      const matchStatus =
        statusFilter === "todos" || statusAtual === statusFilter;

      return matchNomeEmail && matchStatus;
    });
  }, [collaborators, searchTerm, statusFilter]);

  // Paginação
  const totalPages = Math.ceil(listaFiltrada.length / itemsPerPage);
  const paginatedData = listaFiltrada.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    setDate(new Date());
    setCurrentPage(1);
    toast.success("Filtros redefinidos");
    fetchCollaborators(); // Recarrega dados
  };

  // Helper para formatar hora ISO para HH:mm
  const formatTime = (isoString: string | null) => {
    if (!isoString) return null;
    try {
      return format(parseISO(isoString), "HH:mm");
    } catch (e) {
      return "--:--";
    }
  };

  // --- FUNÇÃO DE EXPORTAR PDF DA PÁGINA ---
  const handleExportPagePDF = () => {
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório Diário de Ponto", 14, 15);
    doc.setFontSize(10);
    doc.text(
      `Data de Referência: ${date ? format(date, "dd/MM/yyyy") : "Hoje"}`,
      14,
      22
    );
    doc.text(
      `Total de Colaboradores Listados: ${listaFiltrada.length}`,
      14,
      27
    );

    // Dados
    const tableRows = listaFiltrada.map((colab) => {
      const statusAtual = getStatus(colab);
      const chegada = formatTime(colab.entrada) || "-";
      const saidaAlmoco = formatTime(colab.almoco) || "-";
      const voltaAlmoco = formatTime(colab.retornoAlmoco) || "-";
      const saida = formatTime(colab.saida) || "-";

      // Traduzindo status para o PDF
      const mapStatus: Record<string, string> = {
        EM_SERVICO: "Externo",
        ALMOCO: "Almoço",
        DISPONIVEL: "Presente",
        SAIU: "Saiu",
        AUSENTE: "Ausente",
      };

      return [
        colab.name,
        mapStatus[statusAtual] || statusAtual,
        chegada,
        saidaAlmoco,
        voltaAlmoco,
        saida,
      ];
    });

    autoTable(doc, {
      startY: 35,
      head: [
        [
          "Colaborador",
          "Status",
          "Chegada",
          "Saída Almoço",
          "Volta Almoço",
          "Saída",
        ],
      ],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [20, 20, 20] },
    });

    doc.save(
      `relatorio_diario_${date ? format(date, "yyyy-MM-dd") : "geral"}.pdf`
    );
    toast.success("Relatório diário baixado!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* --- HEADER SIMPLIFICADO --- */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Controle de Ponto
          </h2>
          <p className="text-muted-foreground">
            Gerencie a jornada diária da equipe técnica.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportPagePDF}
            className="gap-2"
            disabled={loading}
          >
            <Download className="w-4 h-4" /> Exportar Relatório
          </Button>
        </div>
      </div>

      {/* --- BARRA DE FILTROS --- */}
      <div className="bg-card border rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-end justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* 1. Busca por Nome/Email */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Buscar Colaborador
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome ou email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* 2. Seletor de Status */}
          <div className="w-full md:w-[200px]">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Status
            </label>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="EM_SERVICO">🟢 Em Serviço</SelectItem>
                <SelectItem value="DISPONIVEL">🔵 Disponível</SelectItem>
                <SelectItem value="ALMOCO">🟡 Almoço</SelectItem>
                <SelectItem value="AUSENTE">🔴 Ausente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. DatePicker */}
          <div className="w-full md:w-[240px]">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Data de Referência
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Botão Reset e Toggle View */}
        <div className="flex items-center gap-2 shrink-0 border-l pl-4 ml-2">
          {(searchTerm || statusFilter !== "todos") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetFilters}
              title="Limpar Filtros"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}

          <div className="flex bg-muted rounded-md p-1">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded transition-all",
                viewMode === "table"
                  ? "bg-background shadow text-primary"
                  : "text-muted-foreground"
              )}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-1.5 rounded transition-all",
                viewMode === "cards"
                  ? "bg-background shadow text-primary"
                  : "text-muted-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
            <Search className="w-10 h-10 mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum registro encontrado</p>
            <p className="text-sm">Tente ajustar os filtros selecionados.</p>
          </div>
        ) : viewMode === "table" ? (
          // --- VISÃO TABELA ---
          <Card className="border shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[300px]">Colaborador</TableHead>
                  <TableHead>Status Atual</TableHead>
                  <TableHead className="text-center">Chegada</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">
                    Saída Almoço
                  </TableHead>
                  <TableHead className="text-center hidden lg:table-cell">
                    Volta Almoço
                  </TableHead>
                  <TableHead className="text-center">Saída</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((colab) => {
                  const statusAtual = getStatus(colab);
                  return (
                    <TableRow
                      key={colab.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-input">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {colab.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm leading-none">
                              {colab.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {colab.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={statusAtual} compact />
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {formatTime(colab.entrada) || (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm hidden lg:table-cell">
                        {formatTime(colab.almoco) || (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm hidden lg:table-cell">
                        {formatTime(colab.retornoAlmoco) || (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {formatTime(colab.saida) || (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setViewMode("cards")}
                            >
                              <Clock className="w-4 h-4 mr-2" /> Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setHistoryUser({
                                  id: colab.id,
                                  nome: colab.name,
                                  email: colab.email,
                                })
                              }
                            >
                              <Briefcase className="w-4 h-4 mr-2" /> Histórico
                              Completo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        ) : (
          // --- VISÃO CARDS (GRID) ---
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {paginatedData.map((colab) => {
              const statusAtual = getStatus(colab);
              const hasPonto = !!colab.entrada;

              return (
                <Card
                  key={colab.id}
                  className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-row items-center justify-between p-4 bg-muted/30 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border bg-background">
                        <AvatarFallback>{colab.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm">{colab.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {colab.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={statusAtual} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setHistoryUser({
                                id: colab.id,
                                nome: colab.name,
                                email: colab.email,
                              })
                            }
                          >
                            <Briefcase className="w-4 h-4 mr-2" /> Histórico
                            Completo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {hasPonto ? (
                    <CardContent className="p-0">
                      {/* Grid de Horários */}
                      <div className="grid grid-cols-4 divide-x border-b bg-card">
                        <TimeBlockNew
                          label="Chegada"
                          time={formatTime(colab.entrada)}
                        />
                        <TimeBlockNew
                          label="Almoço"
                          time={formatTime(colab.almoco)}
                        />
                        <TimeBlockNew
                          label="Volta"
                          time={formatTime(colab.retornoAlmoco)}
                        />
                        <TimeBlockNew
                          label="Saída"
                          time={formatTime(colab.saida)}
                        />
                      </div>

                      {/* Timeline de Atividades */}
                      <div className="p-4 bg-muted/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> Atividades do Dia
                          </h4>
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {colab.registros.length} Serviços
                          </span>
                        </div>

                        {colab.registros.length > 0 ? (
                          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                            {colab.registros.map((reg) => (
                              <div
                                key={reg.id}
                                className="group relative pl-4 border-l-2 border-primary/20 hover:border-primary transition-colors pb-1"
                              >
                                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-background border-2 border-primary/40 group-hover:border-primary group-hover:bg-primary transition-all" />
                                <div className="text-xs bg-background p-2 rounded border shadow-sm flex flex-col gap-1">
                                  <div className="flex justify-between items-start">
                                    <span className="font-medium text-foreground">
                                      {reg.atividade}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] h-5"
                                    >
                                      {formatTime(reg.inicio)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <MapPin className="w-3 h-3" /> Empresa ID:{" "}
                                    {reg.empresa}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic py-2 text-center border border-dashed rounded bg-background/50">
                            Nenhuma atividade externa registrada.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/10 h-[200px]">
                      <AlertCircle className="w-8 h-8 opacity-20" />
                      <span className="text-sm">Ausente / Não bateu ponto</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* --- PAGINAÇÃO --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando página{" "}
            <span className="font-medium text-foreground">{currentPage}</span>{" "}
            de <span className="font-medium text-foreground">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* --- MODAL DE HISTÓRICO COMPLETO --- */}
      <CollaboratorHistoryModal
        isOpen={!!historyUser}
        onClose={() => setHistoryUser(null)}
        user={
          historyUser
            ? {
                id: String(historyUser.id),
                nome: historyUser.nome,
                email: historyUser.email,
              }
            : null
        }
      />
    </div>
  );
}

// --- SUBCOMPONENTES AUXILIARES ---

function StatusBadge({
  status,
  compact = false,
}: {
  status: string;
  compact?: boolean;
}) {
  const config: any = {
    EM_SERVICO: {
      label: "Externo",
      fullLabel: "Em Serviço Externo",
      className:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    },
    ALMOCO: {
      label: "Almoço",
      fullLabel: "Horário de Almoço",
      className:
        "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    },
    DISPONIVEL: {
      label: "Disponível",
      fullLabel: "Disponível / Interno",
      className:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    },
    SAIU: {
      label: "Saiu",
      fullLabel: "Expediente Encerrado",
      className:
        "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
    },
    AUSENTE: {
      label: "Ausente",
      fullLabel: "Não Compareceu",
      className:
        "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900",
    },
  };

  const current = config[status] || config["AUSENTE"];
  const displayText = compact ? current.label : current.fullLabel;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.className}`}
    >
      {status === "EM_SERVICO" && (
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {displayText}
    </span>
  );
}

function TimeBlockNew({
  label,
  time,
}: {
  label: string;
  time?: string | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-3 hover:bg-muted/50 transition-colors">
      <span className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">
        {label}
      </span>
      <span
        className={`font-mono text-sm font-medium ${
          !time ? "text-muted-foreground/30" : "text-foreground"
        }`}
      >
        {time || "--:--"}
      </span>
    </div>
  );
}
