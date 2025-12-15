'use client';
// --- Hooks do React ---
import { useState, useEffect } from "react"; 
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
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
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
// --- UI Extras ---
import { Badge } from "@/components/ui/badge"; 
// --- Ícones ---
import { MoreHorizontal, PlusCircle, Package, Pencil, Loader2, Power } from "lucide-react";
// --- Tipos ---
import type { Cliente as BaseCliente } from "@/lib/mock-data"; 
// --- Modais ---
import { NewClienteModalContent } from "./components/NewClienteModalContent";
import { EditClienteModalContent } from "./components/EditClienteModalContent";
// --- Auth & Toast ---
import { useAuth } from "@/app/contexts/authContext";
import toast from "react-hot-toast";

// --- TIPO: Estende o Cliente base com os dados da API ---
type ClienteComContagem = BaseCliente & {
  quantidadeEquipamentos: string;
  status: 'Ativo' | 'Inativo'; 
};

export default function ClientesPage() {
  const { role, token } = useAuth(); 

  // --- ESTADOS ---
  const [clientes, setClientes] = useState<ClienteComContagem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchToggle, setRefetchToggle] = useState(false);

  // --- Estado do Modal ---
  type ModalType = 'new' | 'edit' | null;
  const [modalState, setModalState] = useState<{
    type: ModalType;
    cliente: ClienteComContagem | null;
  }>({ type: null, cliente: null });

  const openModal = (type: ModalType, cliente: ClienteComContagem | null) => {
    setModalState({ type, cliente });
  };
  
  const closeModalAndRefetch = () => {
    setModalState({ type: null, cliente: null });
    setRefetchToggle(prev => !prev); 
  };
  
  const closeModal = () => {
     setModalState({ type: null, cliente: null });
  }

  // --- FUNÇÃO DE ALTERAR STATUS (ATUALIZADA) ---
  const handleToggleStatus = async (cliente: ClienteComContagem) => {
    if (!token) return;

    const isAtivo = cliente.status === 'Ativo';
    
    // Se está Ativo, vamos chamar a rota de DESATIVAR.
    // Se está Inativo, vamos chamar a rota de ATIVAR.
    const actionRoute = isAtivo ? 'desativar' : 'ativar';
    const url = `http://localhost:3340/user/${actionRoute}/${cliente.id}`;
    
    const toastId = toast.loading(isAtivo ? "Desativando..." : "Ativando...");

    try {
      const response = await fetch(url, {
        method: 'PATCH', // Assumindo PATCH, mas pode ser PUT ou POST dependendo do seu backend
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        // Geralmente rotas de ação específicas não precisam de corpo (body),
        // mas mantemos o objeto vazio caso o backend espere um JSON válido.
        body: JSON.stringify({}) 
      });

      if (!response.ok) {
        throw new Error(`Falha ao ${actionRoute} cliente`);
      }

      toast.success(
        `Cliente ${isAtivo ? 'desativado' : 'ativado'} com sucesso!`, 
        { id: toastId }
      );
      
      setRefetchToggle(prev => !prev);

    } catch (error) {
      console.error(error);
      toast.error(`Erro ao ${actionRoute} status.`, { id: toastId });
    }
  };

  // --- CARREGAMENTO DOS DADOS ---
  useEffect(() => {
    if (!token) {
      if (token === null) setIsLoading(false);
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

        // --- MAPEAMENTO FINAL ---
        const transformedData: ClienteComContagem[] = dataFromApi.map((apiUser: any) => ({
          id: String(apiUser.user_id),
          nomeFantasia: apiUser.user_name,
          razaoSocial: apiUser.user_razaoSocial || 'Não informado',
          cnpj: apiUser.user_cnpj || 'Não informado',
          quantidadeEquipamentos: apiUser.quantidadeEquipamentos || '0', 
          status: (apiUser.user_isActive === 1) ? 'Ativo' : 'Inativo'
        }));

        setClientes(transformedData);

      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar clientes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, [token, refetchToggle]); 

  // --- RENDERIZAÇÃO ---
  if (isLoading) {
     return (
       <div className="flex justify-center items-center py-20">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="ml-3 text-muted-foreground">Carregando clientes...</p>
       </div>
     );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
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

      {/* LISTA DE CLIENTES */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Fantasia</TableHead>
                <TableHead>Razão Social / CNPJ</TableHead>
                <TableHead>Equipamentos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
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
                      {cliente.quantidadeEquipamentos}
                    </div>
                  </TableCell>
                  
                  {/* Coluna Status com Badge */}
                  <TableCell>
                    <Badge variant={cliente.status === 'Ativo' ? 'default' : 'secondary'}>
                      {cliente.status}
                    </Badge>
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

                        <DropdownMenuSeparator />

                        {/* --- BOTÃO ATIVAR / DESATIVAR --- */}
                        <DropdownMenuItem 
                            onClick={() => handleToggleStatus(cliente)}
                            className={cliente.status === 'Ativo' ? "text-red-600 focus:text-red-600" : "text-green-600 focus:text-green-600"}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          {cliente.status === 'Ativo' ? 'Desativar' : 'Ativar'}
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

      {/* Dialog Global */}
      <Dialog open={!!modalState.type} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          {modalState.type === 'new' && (
            <NewClienteModalContent onClose={closeModalAndRefetch} />
          )}
          {modalState.type === 'edit' && modalState.cliente && (
            <EditClienteModalContent cliente={modalState.cliente} onClose={closeModalAndRefetch} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}