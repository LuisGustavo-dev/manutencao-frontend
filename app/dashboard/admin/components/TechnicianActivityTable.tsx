'use client';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Technician } from '../page'; // <-- Importa o TIPO da página pai

// 1. Define a interface de props
interface TechnicianActivityTableProps {
  technicianData: Technician[]; // <-- Prop 'technicianData' definida
  onViewProfileClick: (tecnico: Technician) => void;
}

// 2. Aceita as props
export function TechnicianActivityTable({ technicianData, onViewProfileClick }: TechnicianActivityTableProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Atividade dos Manutentores (Mês)</CardTitle>
        <CardDescription>Ranking de performance da equipe técnica.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Manutentor</TableHead>
              <TableHead>OS Concluídas</TableHead>
              <TableHead>Em Andamento</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 3. Usa a prop 'technicianData' */}
            {technicianData.map((tech) => (
              <TableRow key={tech.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10">{tech.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{tech.nome}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-lg font-semibold">{tech.concluidas}</div>
                </TableCell>
                <TableCell>
                  <div className="text-lg font-semibold text-blue-500">{tech.emAndamento}</div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onViewProfileClick(tech)}>
                    Ver Perfil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}