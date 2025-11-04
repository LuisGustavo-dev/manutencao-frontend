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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PlusCircle, User, HardHat, MoreHorizontal } from "lucide-react";
import { mockUsuarios } from "@/lib/mock-data"; // Importa usuários

export default function GerenciarUsuariosPage() {

  // Filtra usuários por role
  const tecnicos = mockUsuarios.filter(u => u.role === 'Manutentor');
  const clientes = mockUsuarios.filter(u => u.role === 'Cliente');
  const admins = mockUsuarios.filter(u => u.role === 'Admin');

  // Componente de Tabela Reutilizável
  const renderUserTable = (users: typeof mockUsuarios) => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nome}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-muted-foreground">{user.id}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Redefinir Senha</DropdownMenuItem>
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
  );

  return (
    <div className="space-y-6">
      
      {/* 1. CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h2>
          <p className="text-muted-foreground">
            Crie e gerencie as contas de acesso ao sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <User className="mr-2 h-4 w-4" /> Novo Usuário (Cliente)
          </Button>
          <Button>
            <HardHat className="mr-2 h-4 w-4" /> Novo Técnico
          </Button>
        </div>
      </div>

      {/* 2. ABAS COM LISTAS DE USUÁRIOS */}
      <Tabs defaultValue="tecnicos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tecnicos">
            Técnicos <Badge variant="secondary" className="ml-2">{tecnicos.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="clientes">
            Usuários Clientes <Badge variant="secondary" className="ml-2">{clientes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="admins">
            Administradores <Badge variant="secondary" className="ml-2">{admins.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        {/* Aba de Técnicos */}
        <TabsContent value="tecnicos">
          {renderUserTable(tecnicos)}
        </TabsContent>

        {/* Aba de Clientes */}
        <TabsContent value="clientes">
          {renderUserTable(clientes)}
        </TabsContent>

        {/* Aba de Admins */}
        <TabsContent value="admins">
          {renderUserTable(admins)}
        </TabsContent>
      </Tabs>

    </div>
  );
}