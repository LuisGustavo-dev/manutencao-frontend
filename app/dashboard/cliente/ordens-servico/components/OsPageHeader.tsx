'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Importa o router

export function OsPageHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Minhas Ordens de Serviço</h2>
        <p className="text-muted-foreground">
          Acompanhe o status de todos os seus chamados.
        </p>
      </div>
      {/* O Cliente abre chamado pela página de Equipamentos */}
      <Button 
        size="lg" 
        onClick={() => router.push('/dashboard/cliente/equipamentos')}
      >
        <PlusCircle className="mr-2 h-5 w-5" />
        Abrir Novo Chamado
      </Button>
    </div>
  );
}