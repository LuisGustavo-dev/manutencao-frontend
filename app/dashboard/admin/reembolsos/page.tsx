"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  Filter,
  Loader2,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "@/app/contexts/authContext";

// --- INTERFACE ---
interface Despesa {
  id: number;
  data: string;
  tipo: string;
  valor: string;
  status: string;
  urlArquivo: string;
  user: string;
  email: string;
}

export default function AdminReembolsosPage() {
  const { token } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);

  // --- BUSCAR DADOS ---
  const fetchDespesas = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3340/colaborador/despesas",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Falha ao buscar despesas");

      const data = await response.json();
      const dadosArray = Array.isArray(data) ? data : [data];
      setSolicitacoes(dadosArray);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar solicitações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDespesas();
  }, [token]);

  // --- AÇÕES (APROVAR/REJEITAR) ---
  const handleAction = async (id: number, action: "APROVAR" | "REJEITAR") => {
    const anterior = [...solicitacoes];
    // Ajustado para "Aprovada" (feminino) para bater com o padrão da API
    const novoStatusVisual = action === "APROVAR" ? "Aprovada" : "Rejeitada";

    setSolicitacoes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: novoStatusVisual } : s))
    );

    try {
      const endpoint =
        action === "APROVAR"
          ? `aprova-despesas/${id}`
          : `rejeita-despesas/${id}`;

      const response = await fetch(
        `http://localhost:3340/colaborador/${endpoint}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao processar solicitação na API");
      }

      toast.success(
        `Solicitação ${novoStatusVisual.toLowerCase()} com sucesso!`
      );
    } catch (err) {
      console.error(err);
      setSolicitacoes(anterior);
      toast.error("Erro ao atualizar status. Tente novamente.");
    }
  };

  // --- CÁLCULO DE TOTAIS ---
  const totalPendente = solicitacoes
    .filter((s) => s.status.toUpperCase() === "PENDENTE")
    .reduce((acc, curr) => acc + Number(curr.valor), 0);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Reembolsos
          </h1>
          <p className="text-muted-foreground">
            Aprove ou rejeite despesas lançadas pelos colaboradores.
          </p>
        </div>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 py-3 flex items-center gap-4">
            <div className="p-2 bg-yellow-100 rounded-full text-yellow-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-800 uppercase">
                Pendente de Aprovação
              </p>
              <p className="text-xl font-bold text-yellow-900">
                {totalPendente.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Solicitações Recentes</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={fetchDespesas}
          >
            <Filter className="w-4 h-4" /> Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : solicitacoes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Nenhuma solicitação encontrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Comprovante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitacoes.map((s) => {
                  const statusNormalizado = s.status.toUpperCase();

                  // Lógica corrigida para cobrir "APROVADO" e "APROVADA"
                  let badgeClass = "bg-gray-100 text-gray-700";

                  if (statusNormalizado === "PENDENTE") {
                    badgeClass = "bg-yellow-100 text-yellow-700";
                  } else if (statusNormalizado.includes("APROVAD")) {
                    // .includes garante que pegue APROVADO ou APROVADA
                    badgeClass = "bg-green-100 text-green-700";
                  } else if (statusNormalizado.includes("REJEITAD")) {
                    badgeClass = "bg-red-100 text-red-700";
                  }

                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        {format(new Date(s.data), "dd/MM/yyyy")}
                        <div className="text-[10px] text-muted-foreground">
                          {format(new Date(s.data), "HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{s.user}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.email}
                        </div>
                      </TableCell>
                      <TableCell>{s.tipo}</TableCell>
                      <TableCell>
                        {Number(s.valor).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell>
                        {s.urlArquivo ? (
                          <a
                            href={s.urlArquivo}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="link"
                              className="h-auto p-0 text-blue-600 flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" /> Ver{" "}
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </Button>
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">
                            Sem anexo
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold inline-block min-w-[80px] text-center ${badgeClass}`}
                        >
                          {s.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {statusNormalizado === "PENDENTE" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleAction(s.id, "APROVAR")}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleAction(s.id, "REJEITAR")}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
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
