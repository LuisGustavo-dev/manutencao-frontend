'use client';
import { ReactNode, useEffect } from 'react';
import { AdminAppWrapper } from './sidebar/AdminAppWrapper'; // Importa o wrapper LOCAL
import AdminSidebar from './sidebar/AdminSidebar'; // Importa a sidebar LOCAL
import { useAuth } from '@/app/contexts/authContext';
import { useRouter } from 'next/navigation';

// Gatekeeper: Garante que só o Admin entre aqui
function AdminGatekeeper({ children }: { children: ReactNode }) {
  const { role, token } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (token === undefined) return; // Espera carregar
    if (role !== 'Admin') {
      router.push('/login'); // Expulsa se não for Admin
    }
  }, [role, token, router]);

  if (role === 'Admin') {
    return <>{children}</>; // Mostra a página
  }
  
  return <div className="flex h-screen w-full items-center justify-center"><p>Verificando permissões...</p></div>;
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminAppWrapper
      // Injeta a sidebar específica do Admin no wrapper
      sidebar={<AdminSidebar collapsed={false} setCollapsed={() => {}} />}
    >
      <AdminGatekeeper>
        {children}
      </AdminGatekeeper>
    </AdminAppWrapper>
  );
}