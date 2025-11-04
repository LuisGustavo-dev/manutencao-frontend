'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface OsPageHeaderProps {
  role: string | null;
}

export function OsPageHeader({ role }: OsPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
        <p className="text-muted-foreground">
          Gerencie todas as solicitações de manutenção.
        </p>
      </div>
      {(role === 'Admin' || role === 'Manutentor') && (
        <Button size="lg" onClick={() => alert('Abrir modal/página de criação de OS')}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Nova Ordem de Serviço
        </Button>
      )}
    </div>
  );
}