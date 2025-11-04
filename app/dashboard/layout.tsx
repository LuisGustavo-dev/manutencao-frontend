'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/authContext';
import { AppWrapper } from './sidebar/sidebarProvider';

/**
 * Componente interno que protege as rotas.
 */
function DashboardGatekeeper({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (role) {
      // --- LÓGICA DO "PORTEIRO" ATUALIZADA ---
      if (role === 'Admin') {
        // Admin pode ir a qualquer lugar, não fazemos nada.
      } else if (role === 'Cliente') {
        // Se é Cliente, bloqueia rotas de Manutentor e Admin
        if (pathname.startsWith('/dashboard/manutentor') || 
            pathname.startsWith('/dashboard/clientes') ||
            pathname.startsWith('/dashboard/admin')) {
          router.push('/dashboard/cliente'); 
        }
      } else if (role === 'Manutentor') {
        // Se é Manutentor, bloqueia rotas de Cliente e Admin
        if (pathname.startsWith('/dashboard/cliente') ||
            pathname.startsWith('/dashboard/admin')) {
          router.push('/dashboard/manutentor'); 
        }
      }
      // ------------------------------------------

    } else if (role === null && isClient) {
      // Se não está logado, expulsa
      router.push('/login');
    }
  }, [pathname, role, router, isClient]);

  if (!role && isClient) {
    return <div className="flex min-h-screen items-center justify-center">Verificando acesso...</div>;
  }

  return <>{children}</>;
}

/**
 * Layout principal do Dashboard.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O AuthProvider está no app/layout.tsx, então só precisamos do AppWrapper
  return (
    <AppWrapper>
      <DashboardGatekeeper>
        {children}
      </DashboardGatekeeper>
    </AppWrapper>
  );
}