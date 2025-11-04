'use client';
// (Este componente não precisa do Button ou PlusCircle por enquanto)

interface OsPageHeaderProps {
  role: string | null;
}

export function OsPageHeader({ role }: OsPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
        <p className="text-muted-foreground">
          {role === 'Admin' ? 'Gerencie todas as OS' : 'Acompanhe suas OS atribuídas.'}
        </p>
      </div>
      {/* O Manutentor não cria OS por aqui, ele usa o QR Code */}
    </div>
  );
}