"use client";
import { useState, useEffect, useMemo } from "react";
import type { Equipamento, Cliente } from "@/lib/mock-data"; 
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import {
  Search,
  Settings2,
  Droplet,
  Wind,
  Bolt,
  MoreVertical,
  QrCode,
  Pencil,
  History,
  Package,
  Loader2,
  Gauge,
  Power, // Importado para ícone de Ativar
  Ban,   // Importado para ícone de Desativar
} from "lucide-react";
import { useAuth } from "@/app/contexts/authContext";
import toast from "react-hot-toast";

// Importa os componentes de modal do DIRETÓRIO LOCAL
import { QrCodeModalContent } from "./components/QrCodeModalContent";
import { EditEquipmentModalContent } from "./components/EditEquipmentModalContent";
import { HistoryModalContent } from "./components/HistoryModalContent";
import { NewEquipmentModalContent } from "./components/NewEquipmentModalContent";

export default function AdminEquipamentosPage() {
  const [baseUrl, setBaseUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();
  const { token } = useAuth();

  // --- ESTADOS DA API ---
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchToggle, setRefetchToggle] = useState(false);

  type ModalType = "qr" | "edit" | "history" | "new" | null;
  const [modalState, setModalState] = useState<{
    type: ModalType;
    equipment: Equipamento | null;
  }>({ type: null, equipment: null });

  // --- CARREGA DADOS DA API ---
  useEffect(() => {
    setBaseUrl(window.location.origin);

    if (!token) {
      if (token === null) setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [equipResponse, clientesResponse] = await Promise.all([
          fetch("http://localhost:3340/equipamento", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3340/user/clientes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!equipResponse.ok) throw new Error("Falha ao buscar equipamentos");
        if (!clientesResponse.ok) throw new Error("Falha ao buscar clientes");

        const equipData = await equipResponse.json();
        const clientesData = await clientesResponse.json();

        // 1. Clientes
        const transformedClientes: Cliente[] = clientesData.map(
          (user: any) => ({
            id: String(user.user_id),
            nomeFantasia: user.user_name,
            razaoSocial: user.user_razaoSocial || "N/A",
            cnpj: user.user_cnpj || "N/A",
            email: user.user_email || "",
            telefone: user.user_telefone || "",
          })
        );
        setClientes(transformedClientes);

        // 2. Equipamentos
        const transformedEquipamentos: Equipamento[] = equipData.map(
          (apiEq: any) => {
            const statusManutencao: "Disponível" | "Manutencao" =
              apiEq.status === "disponivel" ? "Disponível" : "Manutencao";

            let tensaoFormatada = "N/A";
            if (apiEq.tensao) {
              const tensaoString = String(apiEq.tensao);
              tensaoFormatada = tensaoString.match(/v/i)
                ? tensaoString
                : `${tensaoString} V`;
            }

            return {
              id: String(apiEq.id),
              clienteId: apiEq.user ? String(apiEq.user.id) : null,
              statusManutencao: statusManutencao,
              
              // Mapeia o isAtivo
              isAtivo: apiEq.isAtivo, 

              modeloCompressor: apiEq.modeloCompressor || "N/A",
              tipoGas: apiEq.tipoGas || "N/A",
              tipoOleo: apiEq.tipoOleo || "N/A",
              tensao: tensaoFormatada,
              aplicacao: apiEq.aplicacao || "N/A",
              nome: apiEq.modeloCompressor || `Equipamento #${apiEq.id}`,
              tipo: apiEq.tipo || "Climatização",
              tipoCondensador: apiEq.tipoCondensador || "N/A",
              tipoEvaporador: apiEq.tipoEvaporador || "N/A",
              tipoValvula: apiEq.tipoValvula || "N/A",
            };
          }
        );
        setEquipamentos(transformedEquipamentos);
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [token, refetchToggle]);

  // --- FUNÇÃO PARA ATIVAR/DESATIVAR ---
  const handleToggleStatus = async (id: string, isAtivo: boolean) => {
    // Se está ativo, vamos desativar. Se não, vamos ativar.
    const action = isAtivo ? "desativar" : "ativar";
    
    try {
        // NOTA: Verifique se seu backend espera PATCH ou POST.
        // Geralmente rotas de ação usam POST ou PATCH.
        const response = await fetch(`http://localhost:3340/equipamento/${id}/${action}`, {
            method: "PATCH", 
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error(`Erro ao tentar ${action} o equipamento.`);
        }

        toast.success(`Equipamento ${isAtivo ? "desativado" : "ativado"} com sucesso!`);
        
        // Atualiza a lista para refletir a mudança visualmente
        setRefetchToggle((prev) => !prev);
    } catch (error) {
        toast.error("Erro ao alterar status do equipamento.");
        console.error(error);
    }
  };

  // --- FILTRO ---
  const filteredEquipamentos = useMemo(() => {
    return equipamentos.filter((eq) => {
      const status =
        typeof window !== "undefined"
          ? localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao
          : eq.statusManutencao;

      const clienteNome =
        clientes.find((c) => c.id === eq.clienteId)?.nomeFantasia || "";

      const statusMatch = statusFilter === "all" || status === statusFilter;

      const searchMatch =
        searchTerm === "" ||
        eq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.modeloCompressor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.aplicacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clienteNome &&
          clienteNome.toLowerCase().includes(searchTerm.toLowerCase()));

      return statusMatch && searchMatch;
    });
  }, [equipamentos, clientes, searchTerm, statusFilter]);

  const openModal = (type: ModalType, equipment: Equipamento) => {
    setModalState({ type, equipment });
  };

  const closeModalAndRefetch = () => {
    setModalState({ type: null, equipment: null });
    setRefetchToggle((prev) => !prev);
  };

  const closeModal = () => {
    setModalState({ type: null, equipment: null });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Carregando equipamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Equipamentos (Admin)
          </h2>
          <p className="text-muted-foreground">
            Gerencie, edite e monitore todo o inventário de equipamentos.
          </p>
        </div>

        <Button onClick={() => setModalState({ type: "new", equipment: null })}>
          + Novo Equipamento
        </Button>
      </div>

      {/* 2. BARRA DE FILTRO */}
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por ID, aplicação, compressor, cliente..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Disponível">Disponível</SelectItem>
              <SelectItem value="Manutencao">Em Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 3. GRID DE EQUIPAMENTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipamentos.map((eq) => {
          // @ts-ignore 
          const isAtivo = eq.isAtivo; 

          const status =
            typeof window !== "undefined"
              ? localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao
              : eq.statusManutencao;
          const cliente = clientes.find((c) => c.id === eq.clienteId);

          return (
            <Card
              key={eq.id}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  
                  <CardTitle className="truncate" title={eq.aplicacao}>
                    {eq.aplicacao && eq.aplicacao !== "N/A" 
                        ? eq.aplicacao 
                        : `Equipamento #${eq.id}`
                    }
                  </CardTitle>
                  
                  <CardDescription className="flex items-center gap-2 mt-2">
                    {cliente ? (
                      <>
                        <Package className="h-4 w-4" /> {cliente.nomeFantasia}
                      </>
                    ) : (
                      <span className="text-yellow-600">
                        Sem cliente (Estoque)
                      </span>
                    )}
                  </CardDescription>
                </div>

                {/* --- ÁREA DOS BADGES E MENU --- */}
                <div className="flex gap-2 items-start">
                  
                  {/* Container vertical para os Badges */}
                  <div className="flex flex-col items-end gap-1.5">
                    
                    {/* 1. Status Principal (EM CIMA) */}
                    {status === "Disponível" ? (
                        <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                        >
                        Disponível
                        </Badge>
                    ) : (
                        <Badge variant="destructive">Em Manutenção</Badge>
                    )}

                    {/* 2. Status Ativo/Inativo (EM BAIXO) */}
                    {isAtivo ? (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 text-xs">
                        Ativo
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-gray-200 text-gray-600 text-xs">
                        Inativo
                        </Badge>
                    )}
                  </div>

                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      
                      {/* OPÇÃO DE EDITAR */}
                      <DropdownMenuItem onClick={() => openModal("edit", eq)}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      
                      {/* --- NOVA OPÇÃO DE ATIVAR/DESATIVAR --- */}
                      <DropdownMenuItem 
                        onClick={() => handleToggleStatus(eq.id, Boolean(isAtivo))}
                        className={isAtivo ? "text-red-600 focus:text-red-600 focus:bg-red-50" : "text-green-600 focus:text-green-600 focus:bg-green-50"}
                      >
                         {isAtivo ? (
                            <>
                                <Ban className="mr-2 h-4 w-4" /> 
                                Desativar
                            </>
                         ) : (
                            <>
                                <Power className="mr-2 h-4 w-4" /> 
                                Ativar
                            </>
                         )}
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => openModal("qr", eq)}>
                        <QrCode className="mr-2 h-4 w-4" /> Ver QR Code
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openModal("history", eq)}
                      >
                        <History className="mr-2 h-4 w-4" /> Ver Histórico
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="flex-grow grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2" title="Compressor">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate" title={eq.modeloCompressor}>
                    {eq.modeloCompressor}
                  </span>
                </div>
                <div className="flex items-center gap-2" title="Gás">
                  <Wind className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{eq.tipoGas}</span>
                </div>
                <div className="flex items-center gap-2" title="Óleo">
                  <Droplet className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{eq.tipoOleo}</span>
                </div>
                <div className="flex items-center gap-2" title="Tensão">
                  <Bolt className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{eq.tensao}</span>
                </div>

                <div className="flex items-center gap-2" title="Válvula de Expansão">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">
                    {eq.tipoValvula} 
                  </span>
                </div>
                
              </CardContent>
            </Card>
          );
        })}

        {!isLoading && filteredEquipamentos.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-12">
            <Package className="h-10 w-10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              Nenhum equipamento encontrado
            </h3>
            <p>
              Não há equipamentos cadastrados ou eles não correspondem ao
              filtro.
            </p>
          </div>
        )}
      </div>

      {/* DIALOGS (Mantidos iguais) */}
      <Dialog
        open={!!modalState.type}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-xl">
          {modalState.type === "qr" && modalState.equipment && (
            <QrCodeModalContent
              equipmentName={modalState.equipment.aplicacao !== "N/A" ? modalState.equipment.aplicacao : modalState.equipment.tipo}
              equipmentId={modalState.equipment.id}
              onClose={closeModal}
            />
          )}
          {modalState.type === "edit" && modalState.equipment && (
            <EditEquipmentModalContent
              equipment={modalState.equipment}
              clientes={clientes}
              onClose={closeModalAndRefetch}
            />
          )}
          {modalState.type === "history" && modalState.equipment && (
            <HistoryModalContent
              equipmentName={modalState.equipment.aplicacao !== "N/A" ? modalState.equipment.aplicacao : modalState.equipment.tipo}
              equipmentId={modalState.equipment.id}
              token={token || ""}
            />
          )}
          {modalState.type === "new" && (
            <NewEquipmentModalContent
              clientes={clientes}
              onClose={closeModalAndRefetch}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}