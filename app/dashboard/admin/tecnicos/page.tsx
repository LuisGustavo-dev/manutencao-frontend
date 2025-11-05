'use client';

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
import { PlusCircle, HardHat, MoreHorizontal } from "lucide-react";
import { mockUsuarios } from "@/lib/mock-data"; // Importa usuários

export default function GerenciarTecnicosPage() {

  // Filtra apenas os Manutentores/Técnicos
  const tecnicos = mockUsuarios.filter(u => u.role === 'Manutentor');

  // Helper de avatar
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
        <Button>
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar Técnico</DropdownMenuItem>
                        <DropdownMenuItem>Redefinir Senha</DropdownMenuItem>
                        <DropdownMenuItem>Ver Relatórios</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Desativar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}