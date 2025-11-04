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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Building, MoreHorizontal, PlusCircle, Package } from "lucide-react";
import { mockClientes, mockEquipamentos } from "@/lib/mock-data";
import { useAuth } from "@/app/contexts/authContext";

export default function ClientesPage() {
  const { role } = useAuth();

  // Conta quantos equipamentos cada cliente tem
  const getEquipmentCount = (clienteId: string) => {
    return mockEquipamentos.filter(eq => eq.clienteId === clienteId).length;
  };

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
          <Button size="lg" onClick={() => alert('Abrir modal de criação de cliente...')}>
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
              {mockClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nomeFantasia}</TableCell>
                  <TableCell>
                    <div>{cliente.razaoSocial}</div>
                    <div className="text-xs text-muted-foreground">{cliente.cnpj}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {getEquipmentCount(cliente.id)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar Cliente</DropdownMenuItem>
                        <DropdownMenuItem>Ver Equipamentos</DropdownMenuItem>
                        <DropdownMenuItem>Ver Usuários</DropdownMenuItem>
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