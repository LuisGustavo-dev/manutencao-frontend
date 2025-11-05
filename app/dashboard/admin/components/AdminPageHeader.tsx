'use client';
import { Button } from "@/components/ui/button";
import { Building, HardHat } from "lucide-react";
import Link from "next/link";

export function AdminPageHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Painel do Administrador</h2>
        <p className="text-muted-foreground">
          Gerenciamento geral do sistema e usuários.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard/admin/tecnicos"><HardHat className="mr-2 h-4 w-4" /> Gerenciar Técnicos</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/admin/clientes"><Building className="mr-2 h-4 w-4" /> Gerenciar Clientes</Link>
        </Button>
      </div>
    </div>
  );
}