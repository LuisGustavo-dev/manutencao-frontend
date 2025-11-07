'use client';

import { useState } from "react"; 
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
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
// --- ÍCONE DE LIXEIRA ADICIONADO ---
import { PlusCircle, HardHat, MoreHorizontal, Pencil, Trash2 } from "lucide-react"; 
import { mockUsuarios } from "@/lib/mock-data"; 
import type { Usuario } from "@/lib/mock-data";
import { NewTecnicoModalContent } from "./components/NewTecnicoModalContent";
import { EditTecnicoModalContent } from "./components/EditTecnicoModalContent";

export default function GerenciarTecnicosPage() {

  type ModalType = 'new' | 'edit' | null;
  const [modalState, setModalState] = useState<{
    type: ModalType;
    tecnico: Usuario | null;
  }>({ type: null, tecnico: null });

  const openModal = (type: ModalType, tecnico: Usuario | null) => {
    setModalState({ type, tecnico });
  };
  const closeModal = () => {
    setModalState({ type: null, tecnico: null });
  };

  const tecnicos = mockUsuarios.filter(u => u.role === 'Manutentor');

  const getFallback = (nome: string) => {
    const parts = nome.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. CABEÇALHO */}
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

      {/* 2. TABELA DE TÉCNICOS */}
      <Card>
        <CardContent className="p-0">
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
              {tecnicos.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10">{getFallback(user.nome)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.nome}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{user.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600 border-green-600">Ativo</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      
                      {/* --- DROPDOWN ATUALIZADO --- */}
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openModal('edit', user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar Técnico
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => alert(`Desativar ${user.nome}`)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Desativar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                      {/* --- FIM DA ATUALIZAÇÃO --- */}

                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Renderização do Dialog Global */}
      <Dialog open={!!modalState.type} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          {modalState.type === 'new' && (
            <NewTecnicoModalContent 
              onClose={closeModal} 
            />
          )}
          {modalState.type === 'edit' && modalState.tecnico && (
            <EditTecnicoModalContent 
              tecnico={modalState.tecnico}
              onClose={closeModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}