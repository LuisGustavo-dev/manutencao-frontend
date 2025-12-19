"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  MapPin,
  ArrowRight,
  CheckCircle2,
  FileText,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Clock, // Ícone novo para "Em andamento"
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";
import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isValid,
  isPast,
} from "date-fns";

interface VisitaAPI {
  id: number;
  atividade: string;
  dataMarcada: string;
  status: string; // "Pendente" | "Iniciado"
  empresa: string;
}

export default function AgendaPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [visitas, setVisitas] = useState<VisitaAPI[]>([]);
  const [loading, setLoading] = useState(true);

  // State para controlar qual botão está carregando
  const [startingId, setStartingId] = useState<number | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // --- BUSCAR DADOS DA API ---
  const fetchAgenda = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3340/colaborador/visita-agendada/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao buscar agenda");

      const data = await response.json();
      setVisitas(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar sua agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, [token]);

  // --- LÓGICA DE STATUS ---
  const getStatusInfo = (visita: VisitaAPI) => {
    const date = parseISO(visita.dataMarcada);

    if (!isValid(date))
      return {
        label: "-",
        hora: "-",
        color: "gray",
        statusText: "Indefinido",
        isUrgent: false,
      };

    const hora = format(date, "HH:mm");
    const diaMes = format(date, "dd/MM");

    // 1. PRIORIDADE: Se já foi INICIADO
    // Ao definir isUrgent: false, o botão de iniciar some
    if (visita.status === "Iniciado") {
      return {
        label: "ANDAMENTO",
        hora: hora,
        color: "blue", // Cor azul para indicar progresso
        statusText: "Atendimento em andamento",
        isUrgent: false, // <--- Isso remove o botão de Iniciar
      };
    }

    // 2. Atrasado (Data passou E status é Pendente)
    if (isPast(date) && visita.status === "Pendente") {
      return {
        label: "ATRASADO",
        hora: hora,
        color: "red",
        statusText: `Era para: ${diaMes} às ${hora}`,
        isUrgent: true,
      };
    }

    // 3. Hoje (Pendente)
    if (isToday(date)) {
      return {
        label: "HOJE",
        hora: hora,
        color: "green",
        statusText: "Visita agendada para hoje",
        isUrgent: true,
      };
    }

    // 4. Amanhã
    if (isTomorrow(date)) {
      return {
        label: "AMANHÃ",
        hora: hora,
        color: "blue", // Azul claro (visual padrão do card)
        statusText: "Visita agendada para amanhã",
        isUrgent: false,
      };
    }

    // 5. Futuro
    return {
      label: diaMes,
      hora: hora,
      color: "gray",
      statusText: `Agendado para ${diaMes}`,
      isUrgent: false,
    };
  };

  const getCardStyles = (color: string) => {
    switch (color) {
      case "red":
        return "border-l-red-600 bg-red-50/30";
      case "green":
        return "border-l-green-500 bg-green-50/10";
      case "blue":
        // Diferencia levemente o azul de "Andamento" vs "Amanhã" se desejar, ou mantém padrão
        return "border-l-blue-500 bg-blue-50/20";
      default:
        return "border-l-gray-300";
    }
  };

  const getDateBoxStyles = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-100 text-red-700 border-red-200";
      case "green":
        return "bg-green-100 text-green-800 border-green-200";
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-muted/50 text-muted-foreground border-muted";
    }
  };

  const handleOpenDetails = (visita: VisitaAPI) => {
    const info = getStatusInfo(visita);
    const eventDetails = {
      ...visita,
      infoDisplay: info,
      localDisplay: visita.empresa,
    };
    setSelectedEvent(eventDetails);
    setIsDetailsOpen(true);
  };

  // --- AÇÃO: INICIAR SERVIÇO ---
  const handleStartService = async (visita: VisitaAPI) => {
    if (!token) {
      toast.error("Erro de autenticação.");
      return;
    }

    setStartingId(visita.id);

    try {
      const response = await fetch(
        `http://localhost:3340/colaborador/visita-agendada/colaborador/${visita.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao iniciar visita.");
      }

      toast.success(`Iniciando atendimento em ${visita.empresa}`);

      setIsDetailsOpen(false);
      router.push("/dashboard/colaborador");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao iniciar a visita. Tente novamente.");
    } finally {
      setStartingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando agenda...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" /> Minha Agenda
        </h1>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="text-sm border-red-200 text-red-700 bg-red-50"
          >
            {
              visitas.filter((v) => {
                const d = parseISO(v.dataMarcada);
                // Conta apenas pendentes e passadas
                return isPast(d) && v.status === "Pendente";
              }).length
            }{" "}
            Atrasadas
          </Badge>
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="grid gap-4">
        {visitas.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
            Nenhuma visita encontrada.
          </div>
        ) : (
          visitas.map((item) => {
            const info = getStatusInfo(item);
            const cardStyle = getCardStyles(info.color);
            const dateBoxStyle = getDateBoxStyles(info.color);
            const isItemLoading = startingId === item.id;

            return (
              <Card
                key={item.id}
                className={`border-l-4 transition-all hover:shadow-md ${cardStyle}`}
              >
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Data/Hora Box */}
                    <div
                      className={`flex flex-col items-center justify-center min-w-[85px] rounded-lg p-2 border ${dateBoxStyle}`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {info.label}
                      </span>
                      <span className="text-xl font-bold">{info.hora}</span>
                      {info.color === "red" && (
                        <AlertTriangle className="w-4 h-4 mt-1" />
                      )}
                      {info.label === "ANDAMENTO" && (
                        <Clock className="w-4 h-4 mt-1 animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg leading-none mb-1">
                        {item.empresa}
                      </h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[200px] md:max-w-md">
                          {item.empresa}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Badge
                          variant="secondary"
                          className="font-normal text-muted-foreground bg-muted"
                        >
                          {item.atividade}
                        </Badge>
                        <Badge
                          variant={
                            item.status === "Iniciado" ? "default" : "outline"
                          }
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                    {/*
                      O botão de iniciar só renderiza se info.isUrgent for true.
                      Como definimos isUrgent: false para status 'Iniciado', o botão some.
                    */}
                    {info.isUrgent ? (
                      <Button
                        disabled={isItemLoading}
                        className={`w-full md:w-auto gap-2 text-white shadow-sm ${
                          info.color === "red"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                        onClick={() => handleStartService(item)}
                      >
                        {isItemLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {isItemLoading ? "Iniciando..." : "Iniciar"}
                      </Button>
                    ) : null}

                    <Button
                      variant="secondary"
                      className="w-full md:w-auto gap-2"
                      onClick={() => handleOpenDetails(item)}
                      disabled={isItemLoading}
                    >
                      Ver Detalhes <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* --- MODAL DE DETALHES --- */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={
                      selectedEvent.infoDisplay.color === "red"
                        ? "border-red-500 text-red-500"
                        : selectedEvent.infoDisplay.color === "blue"
                        ? "border-blue-500 text-blue-500"
                        : ""
                    }
                  >
                    {selectedEvent.infoDisplay.statusText}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">
                  {selectedEvent.empresa}
                </DialogTitle>
                <DialogDescription className="flex items-start gap-2 text-left mt-1">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  {selectedEvent.localDisplay}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1 mb-2">
                    <FileText className="w-3 h-3" /> Atividade Prevista
                  </span>
                  <div className="p-3 border rounded-lg bg-card text-muted-foreground">
                    <p className="font-medium text-foreground text-lg">
                      {selectedEvent.atividade}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded border">
                    <span className="text-xs text-muted-foreground font-bold">
                      Data Marcada
                    </span>
                    <p>
                      {format(
                        parseISO(selectedEvent.dataMarcada),
                        "dd/MM/yyyy"
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded border">
                    <span className="text-xs text-muted-foreground font-bold">
                      Horário
                    </span>
                    <p>
                      {format(parseISO(selectedEvent.dataMarcada), "HH:mm")}
                    </p>
                  </div>
                </div>

                {selectedEvent.infoDisplay.color === "red" && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 p-3 rounded border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Esta visita está atrasada. Inicie o atendimento assim que
                      possível.
                    </span>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                  disabled={startingId !== null}
                >
                  Fechar
                </Button>

                {/* Botão no Modal também obedece à regra isUrgent */}
                {selectedEvent.infoDisplay.isUrgent && (
                  <Button
                    disabled={startingId !== null}
                    className={
                      selectedEvent.infoDisplay.color === "red"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }
                    onClick={() => handleStartService(selectedEvent)}
                  >
                    {startingId === selectedEvent.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    {startingId === selectedEvent.id
                      ? "Iniciando..."
                      : "Iniciar Agora"}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
