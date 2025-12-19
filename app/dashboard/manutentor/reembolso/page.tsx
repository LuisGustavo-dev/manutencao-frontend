"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Plus,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";

interface ReembolsoRequest {
  id: number;
  data: string;
  tipo: string;
  valor: string;
  valorNumerico: number;
  status: "APROVADO" | "REJEITADO" | "PENDENTE"; // Tipagem mais estrita ajuda
  comprovante?: string;
}

// Interface baseada no JSON que você forneceu
interface ApiResponse {
  id: number;
  data: string;
  tipo: string;
  valor: string;
  status: string;
  urlArquivo: string;
}

export default function ReembolsoPage() {
  const [requests, setRequests] = useState<ReembolsoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do Formulário
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tipoDespesa, setTipoDespesa] = useState("");
  const [valorInput, setValorInput] = useState("");
  const [comprovante, setComprovante] = useState<File | null>(null);

  const { token } = useAuth();

  // --- INTEGRAÇÃO COM API (GET) ---
  const fetchDespesas = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3340/colaborador/despesas",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao buscar dados");
      }

      const data: ApiResponse[] = await response.json();

      const formattedData: ReembolsoRequest[] = data.map((item) => {
        const valorNum = parseFloat(item.valor);

        // Tratamento de Data
        const dataObj = new Date(item.data);
        const dataFormatada = dataObj.toLocaleDateString("pt-BR");

        // --- NORMALIZAÇÃO DO STATUS ---
        // Transforma "Aprovada"/"Rejeitada" em "APROVADO"/"REJEITADO"
        let statusNormalizado: "APROVADO" | "REJEITADO" | "PENDENTE" =
          "PENDENTE";
        const statusUpper = item.status.toUpperCase();

        if (statusUpper.includes("APROVAD")) {
          statusNormalizado = "APROVADO";
        } else if (statusUpper.includes("REJEITAD")) {
          statusNormalizado = "REJEITADO";
        } else {
          statusNormalizado = "PENDENTE";
        }

        return {
          id: item.id,
          data: dataFormatada,
          tipo: item.tipo, // Assume que já vem correto (ex: Alimentação)
          valor: `R$ ${valorNum.toFixed(2).replace(".", ",")}`,
          valorNumerico: valorNum,
          status: statusNormalizado,
          comprovante: item.urlArquivo,
        };
      });

      setRequests(formattedData);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar despesas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDespesas();
  }, [token]);

  // --- CÁLCULOS (KPIs) ---
  // Agora funcionará corretamente pois o status foi normalizado para "APROVADO"
  const totalAprovado = requests
    .filter((r) => r.status === "APROVADO")
    .reduce((acc, curr) => acc + curr.valorNumerico, 0);

  const totalPendente = requests
    .filter((r) => ["PENDENTE", "EM ANÁLISE"].includes(r.status))
    .reduce((acc, curr) => acc + curr.valorNumerico, 0);

  // --- AÇÕES ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComprovante(e.target.files[0]);
      toast.success("Comprovante anexado!");
    }
  };

  const handleNewRequest = async () => {
    if (!tipoDespesa || !valorInput) {
      toast.error("Preencha o tipo e o valor da despesa.");
      return;
    }

    if (!comprovante) {
      toast.error("É obrigatório anexar o comprovante (imagem).");
      return;
    }

    try {
      setIsSubmitting(true);

      const valorNumerico = parseFloat(valorInput.replace(",", "."));
      const tipoFormatado =
        tipoDespesa.charAt(0).toUpperCase() + tipoDespesa.slice(1);

      const formData = new FormData();

      formData.append(
        "data",
        JSON.stringify({
          tipo: tipoFormatado,
          valor: valorNumerico,
        })
      );

      formData.append("file", comprovante);

      const response = await fetch(
        "http://localhost:3340/colaborador/despesas",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao salvar despesa");
      }

      toast.success("Solicitação enviada com sucesso!");

      setTipoDespesa("");
      setValorInput("");
      setComprovante(null);
      setIsDialogOpen(false);

      fetchDespesas();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar solicitação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const abrirComprovante = (url?: string) => {
    if (url) window.open(url, "_blank");
    else toast.error("Comprovante não disponível");
  };

  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-500">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" /> Reembolsos e
            Despesas
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie seus gastos de viagem para ressarcimento.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" /> Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Registrar Despesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Despesa</Label>
                <Select value={tipoDespesa} onValueChange={setTipoDespesa}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Combustível">Combustível</SelectItem>
                    <SelectItem value="Alimentação">Alimentação</SelectItem>
                    <SelectItem value="Pedágio">Pedágio</SelectItem>
                    <SelectItem value="Estacionamento">
                      Estacionamento
                    </SelectItem>
                    <SelectItem value="Peças">Peças/Materiais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    type="number"
                    placeholder="0,00"
                    className="pl-9"
                    step="0.01"
                    value={valorInput}
                    onChange={(e) => setValorInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Comprovante (Foto/PDF)</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center relative ${
                    comprovante
                      ? "bg-green-50 border-green-200"
                      : "hover:bg-muted/50 border-muted-foreground/25"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  {comprovante ? (
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700 truncate max-w-[200px]">
                        {comprovante.name}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Upload className="w-8 h-8 mb-2 mx-auto opacity-50" />
                      <span className="text-sm font-medium">
                        Clique para enviar foto
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleNewRequest}
                disabled={
                  !tipoDespesa || !valorInput || !comprovante || isSubmitting
                }
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Total Recebido
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {loading
                  ? "..."
                  : `R$ ${totalAprovado.toFixed(2).replace(".", ",")}`}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Em Análise
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {loading
                  ? "..."
                  : `R$ ${totalPendente.toFixed(2).replace(".", ",")}`}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABELA DE HISTÓRICO */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Histórico de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando
              despesas...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center h-24 text-muted-foreground"
                    >
                      Nenhuma despesa encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {req.data}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-muted rounded">
                            {req.tipo === "Combustível"
                              ? "⛽"
                              : req.tipo === "Alimentação"
                              ? "🍔"
                              : "📄"}
                          </span>
                          {req.tipo}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{req.valor}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            req.status === "APROVADO"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : req.status === "REJEITADO"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {req.status === "APROVADO" && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {req.status === "PENDENTE" && (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {req.status === "REJEITADO" && (
                            <X className="w-3 h-3 mr-1" />
                          )}
                          {req.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Ver Comprovante"
                          onClick={() => abrirComprovante(req.comprovante)}
                          disabled={!req.comprovante}
                        >
                          {req.comprovante ? (
                            <ImageIcon className="w-4 h-4 text-primary" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
