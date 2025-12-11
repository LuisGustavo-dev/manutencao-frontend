'use client';

import { useState, useEffect, useCallback } from "react"; 
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
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
// --- 1. NOVOS IMPORTS DO ALERT DIALOG ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, MoreHorizontal, Pencil, Loader2, Ban, CheckCircle } from "lucide-react"; 
import { NewTecnicoModalContent } from "./components/NewTecnicoModalContent";
import { EditTecnicoModalContent } from "./components/EditTecnicoModalContent";
import { useAuth } from "@/app/contexts/authContext";
import toast from "react-hot-toast"; 

interface Tecnico {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

export default function GerenciarTecnicosPage() {
  const { token } = useAuth();

  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 2. ESTADO PARA O ALERT DIALOG PERSONALIZADO ---
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    tecnico: Tecnico | null;
  }>({ isOpen: false, tecnico: null });

  type ModalType = 'new' | 'edit' | null;
  const [modalState, setModalState] = useState<{
    type: ModalType;
    tecnico: Tecnico | null;
  }>({ type: null, tecnico: null });

  const fetchTecnicos = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3340/user/tecnicos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar técnicos');
      }

      const data = await response.json();
      setTecnicos(data);
    } catch (error) {
      console.error("Erro ao carregar técnicos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTecnicos();
  }, [fetchTecnicos]);

  // --- 3. PASSO 1: ABRIR O MODAL DE CONFIRMAÇÃO ---
  const openChangeStatusModal = (tecnico: Tecnico) => {
    setConfirmDialog({ isOpen: true, tecnico });
  };

  // --- 4. PASSO 2: EXECUTAR A AÇÃO APÓS CONFIRMAÇÃO VISUAL ---
  const executeToggleStatus = async () => {
    const tecnico = confirmDialog.tecnico;
    if (!tecnico || !token) return;

    // Fecha o modal imediatamente para UX fluida (ou mantenha aberto com loading se preferir)
    setConfirmDialog({ isOpen: false, tecnico: null });

    const isActive = tecnico.isActive;
    const endpointAction = isActive ? "desativar" : "ativar"; 
    
    const url = `http://localhost:3340/user/${endpointAction}/${tecnico.id}`;
    
    // Toast de loading
    const toastId = toast.loading(`${isActive ? 'Desativando' : 'Ativando'} técnico...`);

    try {
        const response = await fetch(url, {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro ao alterar status.`);
        }

        toast.success(`Técnico ${isActive ? 'desativado' : 'ativado'} com sucesso!`, { id: toastId });
        fetchTecnicos(); 

    } catch (error: any) {
        console.error("Erro na operação:", error);
        toast.error(error.message || "Ocorreu um erro.", { id: toastId });
    }
  };

  const openModal = (type: ModalType, tecnico: Tecnico | null) => {
    setModalState({ type, tecnico });
  };
  
  const closeModal = () => {
    setModalState({ type: null, tecnico: null });
    fetchTecnicos();
  };

  const getFallback = (nome: string) => {
    const parts = nome.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Técnicos</h2>
          <p className="text-muted-foreground">
            Crie e gerencie as contas de login da sua equipe técnica.
          </p>
        </div>
        <Button onClick={() => openModal('new', null)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Técnico
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ID de Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tecnicos.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            Nenhum técnico encontrado.
                        </TableCell>
                    </TableRow>
                ) : (
                    tecnicos.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10">{getFallback(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{user.name}</div>
                        </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-muted-foreground">{user.id}</TableCell>
                        <TableCell>
                        {user.isActive ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">Ativo</Badge>
                        ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">Inativo</Badge>
                        )}
                        </TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openModal('edit', user)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar Técnico
                            </DropdownMenuItem>
                            
                            {/* Alterado para chamar openChangeStatusModal */}
                            <DropdownMenuItem 
                                className={`cursor-pointer ${user.isActive ? 'text-destructive focus:text-destructive' : 'text-green-600 focus:text-green-600'}`}
                                onClick={() => openChangeStatusModal(user)}
                            >
                                {user.isActive ? (
                                    <>
                                        <Ban className="mr-2 h-4 w-4" />
                                        Desativar
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Ativar
                                    </>
                                )}
                            </DropdownMenuItem>
                            
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL DE EDIÇÃO/CRIAÇÃO */}
      <Dialog open={!!modalState.type} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          {modalState.type === 'new' && (
            <NewTecnicoModalContent onClose={closeModal} />
          )}
          {modalState.type === 'edit' && modalState.tecnico && (
            <EditTecnicoModalContent tecnico={modalState.tecnico as any} onClose={closeModal} />
          )}
        </DialogContent>
      </Dialog>

      {/* --- 5. COMPONENTE ALERT DIALOG --- */}
      <AlertDialog 
        open={confirmDialog.isOpen} 
        onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, tecnico: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
                {confirmDialog.tecnico?.isActive ? 'Desativar Técnico?' : 'Ativar Técnico?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.tecnico?.isActive 
                ? `O técnico ${confirmDialog.tecnico?.name} perderá o acesso ao sistema imediatamente. Você poderá reativá-lo depois.`
                : `O técnico ${confirmDialog.tecnico?.name} terá o acesso ao sistema restabelecido.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            
            {/* O botão de ação muda de cor dependendo se é destrutivo (desativar) ou não */}
            <AlertDialogAction 
                onClick={executeToggleStatus}
                className={confirmDialog.tecnico?.isActive ? "bg-destructive hover:bg-destructive/90" : "bg-green-600 hover:bg-green-700"}
            >
              {confirmDialog.tecnico?.isActive ? 'Sim, desativar' : 'Sim, ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}