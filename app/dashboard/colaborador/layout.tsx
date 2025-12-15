'use client';

import { ReactNode, useEffect } from 'react';
import { ColaboradorAppWrapper } from './sidebar/ColaboradorAppWrapper'; 
import ColaboradorSidebar from './sidebar/ColaboradorSidebar'; 
import { useAuth } from '@/app/contexts/authContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Gatekeeper: Garante que só o Colaborador entre aqui
function ColaboradorGatekeeper({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();

  const role = "Colaborador"; // Simulação de role para este exemplo
  
  useEffect(() => {
    if (token === undefined) return; // Aguarda a verificação do token
    
    // Se não for Colaborador, redireciona para login (ou página de erro)
    if (role !== 'Colaborador') {
      router.push('/login'); 
    }
  }, [role, token, router]);

  // Renderiza o conteúdo apenas se a role for correta
  if (role === 'Colaborador') {
    return <>{children}</>; 
  }
  
  // Loading state enquanto verifica
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Verificando permissões de acesso...</p>
    </div>
  );
}

export default function ColaboradorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ColaboradorAppWrapper
      // Injeta a sidebar específica do Colaborador no wrapper
      sidebar={<ColaboradorSidebar collapsed={false} setCollapsed={() => {}} />}
    >
      <ColaboradorGatekeeper>
        {children}
      </ColaboradorGatekeeper>
    </ColaboradorAppWrapper>
  );
}