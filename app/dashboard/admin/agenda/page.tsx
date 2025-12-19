"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  Plus,
  User,
  MapPin,
  Loader2,
  RefreshCw,
  Briefcase,
  Wrench,
  AlertCircle,
  CalendarClock,
  CalendarCheck,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";
import { format, parseISO, isValid, isSameDay } from "date-fns";

// --- INTERFACES ---
interface Visita {
  id: number;
  status: string;
  horaAbertura: string;
  horaInicioAtendimento: string | null;
  horaFinalizacao: string | null;
  dataMarcada: string | null;
  tipo: string;
  name: string;
  telefone: string;
  modeloCompressor: string;
  equipamentoId: number;
  tecnicoName: string;
}

interface TecnicoOption {
  id: number;
  nome: string;
}

interface ChamadoEquipamento {
  id: number;
  dataMarcada: string | null;
  status: string;
}

interface EquipamentoOption {
  id: number;
  modeloCompressor: string;
  aplicacao: string;
  user: {
    id: number;
    name: string;
  };
  chamados: ChamadoEquipamento[];
}

export default function AdminAgendaPage() {
  const { token } = useAuth();

  // Estados
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal e Formulário
  const [open, setOpen] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [tecnicosList, setTecnicosList] = useState<TecnicoOption[]>([]);
  const [equipamentosList, setEquipamentosList] = useState<EquipamentoOption[]>(
    []
  );

  const [selectedTecnico, setSelectedTecnico] = useState("");
  const [selectedEquipamentoId, setSelectedEquipamentoId] = useState("");

  // Adicionado o campo "tipo" ao formData
  const [formData, setFormData] = useState({
    data: "",
    hora: "",
    atividade: "",
    tipo: "Preventiva", // Valor padrão
  });

  const [dateConflict, setDateConflict] = useState(false);

  // --- 1. BUSCAR VISITAS ---
  const fetchVisitas = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3340/chamado", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Falha ao buscar agenda.");

      const data = await response.json();
      const dadosArray = Array.isArray(data) ? data : [data];
      setVisitas(dadosArray);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar a agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVisitas();
    }
  }, [token]);

  // --- 2. BUSCAR OPÇÕES ---
  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const [resTecnicos, resColaboradores, resEquipamentos] =
        await Promise.all([
          fetch("http://localhost:3340/user/tecnicos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3340/user/colaboradores", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3340/equipamento/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      const dataTecnicos = resTecnicos.ok ? await resTecnicos.json() : [];
      const dataColaboradores = resColaboradores.ok
        ? await resColaboradores.json()
        : [];

      const todosTecnicos = [
        ...(Array.isArray(dataTecnicos) ? dataTecnicos : []),
        ...(Array.isArray(dataColaboradores) ? dataColaboradores : []),
      ];

      const tecnicosUnicos = Array.from(
        new Map(todosTecnicos.map((item) => [item.id, item])).values()
      );

      const tecnicosFormatados = tecnicosUnicos.map((t: any) => ({
        id: t.id,
        nome: t.nome || t.name || t.user || "Sem Nome",
      }));

      const dataEquip = resEquipamentos.ok ? await resEquipamentos.json() : [];
      const equipamentosArray = Array.isArray(dataEquip)
        ? dataEquip
        : [dataEquip];

      setTecnicosList(tecnicosFormatados);
      setEquipamentosList(equipamentosArray);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar listas.");
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (open && token) {
      fetchOptions();
    }
  }, [open, token]);

  // --- 3. VALIDAÇÃO DE CONFLITO ---
  useEffect(() => {
    if (!selectedEquipamentoId || !formData.data) {
      setDateConflict(false);
      return;
    }

    const equipamentoSelecionado = equipamentosList.find(
      (eq) => String(eq.id) === selectedEquipamentoId
    );

    if (!equipamentoSelecionado) return;

    const dataEscolhida = parseISO(formData.data);

    const conflito = equipamentoSelecionado.chamados.some((chamado) => {
      if (!chamado.dataMarcada) return false;
      const dataChamado = parseISO(chamado.dataMarcada);
      return isSameDay(dataChamado, dataEscolhida);
    });

    setDateConflict(conflito);
  }, [selectedEquipamentoId, formData.data, equipamentosList]);

  // --- 4. AGENDAR (NOVA ROTA) ---
  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (dateConflict) {
      toast.error("Este equipamento já possui visita nesta data!");
      return;
    }

    if (
      !selectedTecnico ||
      !selectedEquipamentoId ||
      !formData.data ||
      !formData.hora ||
      !formData.atividade ||
      !formData.tipo
    ) {
      toast.error("Preencha todos os campos.");
      return;
    }

    try {
      const dataHoraString = `${formData.data}T${formData.hora}:00`;
      const dataMarcadaISO = new Date(dataHoraString).toISOString();

      // Nova rota solicitada: /agendar/:tecnicoId/:equipamentoId
      const url = `http://localhost:3340/colaborador/agendar/${selectedTecnico}/${selectedEquipamentoId}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          atividade: formData.atividade,
          dataMarcada: dataMarcadaISO,
          tipo: formData.tipo, // Novo campo
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar agendamento.");

      toast.success("Visita agendada com sucesso!");
      setOpen(false);

      // Limpar formulário (mantendo Preventiva como padrão)
      setFormData({ data: "", hora: "", atividade: "", tipo: "Preventiva" });
      setSelectedTecnico("");
      setSelectedEquipamentoId("");
      setDateConflict(false);
      fetchVisitas();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao agendar visita.");
    }
  };

  // --- HELPERS ---
  const getStatus = (v: Visita) => {
    if (v.horaFinalizacao)
      return { label: "CONCLUÍDO", class: "bg-green-100 text-green-700" };
    if (v.status === "Em andamento" || v.horaInicioAtendimento)
      return { label: "EM ANDAMENTO", class: "bg-blue-100 text-blue-700" };
    if (v.status === "Aberto")
      return { label: "ABERTO", class: "bg-yellow-100 text-yellow-700" };
    return {
      label: v.status?.toUpperCase(),
      class: "bg-gray-100 text-gray-700",
    };
  };

  const formatDataHora = (isoString: string | null) => {
    if (!isoString) return { data: "--/--", hora: "--:--" };
    try {
      const date = parseISO(isoString);
      if (!isValid(date)) return { data: "-", hora: "-" };
      return {
        data: format(date, "dd/MM/yyyy"),
        hora: format(date, "HH:mm"),
      };
    } catch {
      return { data: "-", hora: "-" };
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Agenda de Visitas
          </h1>
          <p className="text-muted-foreground">
            Gestão de chamados corretivos e visitas preventivas.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nova Visita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Agendar Nova Visita</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAgendar} className="space-y-4 py-4">
              {/* SELECT TÉCNICO */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Técnico/Colaborador
                </label>
                <Select
                  value={selectedTecnico}
                  onValueChange={setSelectedTecnico}
                  disabled={loadingOptions}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingOptions ? "Carregando..." : "Selecione o técnico"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {tecnicosList.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SELECT EQUIPAMENTO */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Equipamento / Cliente
                </label>
                <Select
                  value={selectedEquipamentoId}
                  onValueChange={setSelectedEquipamentoId}
                  disabled={loadingOptions}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingOptions
                          ? "Carregando..."
                          : "Selecione o equipamento"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentosList.map((eq) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">
                            {eq.modeloCompressor}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {eq.user?.name} - {eq.aplicacao}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TIPO DE VISITA (NOVO CAMPO) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Visita</label>
                <Select
                  value={formData.tipo}
                  onValueChange={(val) =>
                    setFormData({ ...formData, tipo: val })
                  }
                  disabled={loadingOptions}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventiva">Preventiva</SelectItem>
                    <SelectItem value="Obra">Obra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* DATA E HORA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data</label>
                  <Input
                    type="date"
                    value={formData.data}
                    className={dateConflict ? "border-red-500 bg-red-50" : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, data: e.target.value })
                    }
                  />
                  {dateConflict && (
                    <div className="flex items-center gap-1 text-red-600 text-xs mt-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      Data indisponível
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora</label>
                  <Input
                    type="time"
                    value={formData.hora}
                    onChange={(e) =>
                      setFormData({ ...formData, hora: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* DESCRIÇÃO */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Atividade / Descrição
                </label>
                <Input
                  placeholder="Ex: Manutenção Preventiva Geral"
                  value={formData.atividade}
                  onChange={(e) =>
                    setFormData({ ...formData, atividade: e.target.value })
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={loadingOptions || dateConflict}
                variant={dateConflict ? "destructive" : "default"}
              >
                {loadingOptions ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {dateConflict ? "Data Indisponível" : "Confirmar Agendamento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABELA DE LISTAGEM */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Próximas Visitas</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchVisitas}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : visitas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              Nenhuma visita agendada encontrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Abertura</TableHead>
                  <TableHead>Agendamento</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Cliente / Equipamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitas.map((v) => {
                  const abertura = formatDataHora(v.horaAbertura);
                  const agendamento = formatDataHora(v.dataMarcada);
                  const isScheduled = !!v.dataMarcada;

                  const statusInfo = getStatus(v);
                  const isCorretivo = v.tipo === "Corretivo";
                  const rowClasses = isCorretivo
                    ? "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500"
                    : "hover:bg-slate-50 border-l-4 border-l-transparent";

                  return (
                    <TableRow
                      key={v.id}
                      className={`${rowClasses} transition-colors`}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <CalendarClock className="w-3 h-3" />
                            {abertura.data}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 pl-4">
                            {abertura.hora}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {isScheduled ? (
                          <div className="flex flex-col">
                            <span className="font-bold flex items-center gap-1 text-sm text-foreground">
                              <CalendarCheck className="w-3 h-3 text-primary" />
                              {agendamento.data}
                            </span>
                            <span className="text-xs text-muted-foreground pl-4">
                              {agendamento.hora}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-700 text-[10px] font-medium border border-orange-200">
                            Não agendado
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 font-medium text-sm">
                          <User className="w-3 h-3 text-muted-foreground" />
                          {v.tecnicoName || "Sem técnico"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {v.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Wrench className="w-3 h-3" />
                            {v.modeloCompressor}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div
                          className={`flex items-center gap-2 font-bold text-xs ${
                            isCorretivo
                              ? "text-red-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {isCorretivo ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Briefcase className="w-3 h-3" />
                          )}
                          {v.tipo}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide ${statusInfo.class}`}
                        >
                          {statusInfo.label}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
