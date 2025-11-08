'use client';
// --- Hooks do React ---
import { useState, useEffect } from "react"; 
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
// --- Ícones ---
import { Building, MoreHorizontal, PlusCircle, Package, Pencil, Loader2 } from "lucide-react";
// --- Mocks (apenas para os tipos) ---
// import { mockClientes, mockEquipamentos } from "@/lib/mock-data"; // <-- Mocks removidos
import type { Cliente as BaseCliente } from "@/lib/mock-data"; // <-- Importa o TIPO base
// --- Modais ---
import { NewClienteModalContent } from "./components/NewClienteModalContent";
import { EditClienteModalContent } from "./components/EditClienteModalContent";
// --- Auth & Toast ---
import { useAuth } from "@/app/contexts/authContext";
import toast from "react-hot-toast";

// --- NOVO TIPO: Estende o Cliente base com os dados da API ---
type ClienteComContagem = BaseCliente & {
  quantidadeEquipamentos: string;
};

export default function ClientesPage() {
  const { role, token } = useAuth(); // <-- Pega o token para a API

  // --- ESTADOS DA PÁGINA ---
  const [clientes, setClientes] = useState<ClienteComContagem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchToggle, setRefetchToggle] = useState(false); // Gatilho para recarregar

  // --- Estado do Modal ---
  type ModalType = 'new' | 'edit' | null;
  const [modalState, setModalState] = useState<{
    type: ModalType;
    cliente: ClienteComContagem | null;
  }>({ type: null, cliente: null });

  const openModal = (type: ModalType, cliente: ClienteComContagem | null) => {
    setModalState({ type, cliente });
  };
  
  // --- Atualiza o fechar do modal para forçar o refetch ---
  const closeModalAndRefetch = () => {
    setModalState({ type: null, cliente: null });
    setRefetchToggle(prev => !prev); // Dispara o useEffect
  };
  
  const closeModal = () => {
     setModalState({ type: null, cliente: null });
  }

  // --- CARREGAMENTO DOS DADOS DA API ---
  useEffect(() => {
    if (!token) {
      if (token === null) setIsLoading(false); // Auth carregou, mas não há token
      return;
    }

    const fetchClientes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3340/user/clientes', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar clientes');
        }

        const dataFromApi = await response.json();

        // --- "Tradução" dos dados da API para o tipo do Frontend ---
        const transformedData: ClienteComContagem[] = dataFromApi.map((apiUser: any) => ({
          id: String(apiUser.user_id),
          nomeFantasia: apiUser.user_name,
          razaoSocial: apiUser.user_razaoSocial || 'Não informado', // Garante que não seja nulo
          cnpj: apiUser.user_cnpj || 'Não informado', // Garante que não seja nulo
          quantidadeEquipamentos: apiUser.quantidadeEquipamentos || '0'
        }));

        setClientes(transformedData);

      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar clientes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, [token, refetchToggle]); // <-- Recarrega se o token ou o gatilho mudarem

  // --- FUNÇÃO REMOVIDA ---
  // const getEquipmentCount = (clienteId: string) => { ... };

  // --- RENDERIZAÇÃO DE LOADING ---
  if (isLoading) {
     return (
       <div className="flex justify-center items-center py-20">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="ml-3 text-muted-foreground">Carregando clientes...</p>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">
            Gerencie as empresas e locais de manutenção.
          </p>
        </div>
        {role === 'Admin' && (
          <Button size="lg" onClick={() => openModal('new', null)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Novo Cliente
          </Button>
        )}
      </div>

      {/* 2. LISTA DE CLIENTES */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Fantasia</TableHead>
                <TableHead>Razão Social / CNPJ</TableHead>
                <TableHead>Equipamentos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum cliente cadastrado.
                  </TableCell>
                </TableRow>
              )}
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nomeFantasia}</TableCell>
                  <TableCell>
                    <div>{cliente.razaoSocial}</div>
                    <div className="text-xs text-muted-foreground">{cliente.cnpj}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {/* --- DADO VINDO DIRETO DA API --- */}
                      {cliente.quantidadeEquipamentos}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openModal('edit', cliente)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar Cliente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- Renderização do Dialog Global (com o novo onClose) --- */}
      <Dialog open={!!modalState.type} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          {modalState.type === 'new' && (
            <NewClienteModalContent 
              onClose={closeModalAndRefetch} // <-- Passa o refetch
            />
          )}
          {modalState.type === 'edit' && modalState.cliente && (
            <EditClienteModalContent 
              cliente={modalState.cliente}
              onClose={closeModalAndRefetch} // <-- Passa o refetch
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}