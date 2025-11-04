'use client';
import { ReactNode, useEffect } from 'react';
import { ClienteAppWrapper } from './sidebar/ClienteAppWrapper'; // Importa o wrapper LOCAL
import ClienteSidebar from './sidebar/ClienteSidebar'; // Importa a sidebar LOCAL
import { useAuth } from '@/app/contexts/authContext';
import { useRouter } from 'next/navigation';

// Gatekeeper: Garante que Cliente (ou Admin simulando) entre
function ClienteGatekeeper({ children }: { children: ReactNode }) {
  const { role, token } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (token === undefined) return;
    // Admin pode simular, Cliente pode entrar
    if (role !== 'Cliente' && role !== 'Admin') {
      router.push('/login'); // Expulsa se não for Cliente ou Admin
    }
  }, [role, token, router]);

  if (role === 'Cliente' || role === 'Admin') {
    return <>{children}</>;
  }
  return <div className="flex h-screen w-full items-center justify-center"><p>Verificando permissões...</p></div>;
}

export default function ClienteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClienteAppWrapper
      // Injeta a sidebar específica do Cliente no wrapper
      sidebar={<ClienteSidebar collapsed={false} setCollapsed={() => {}} />}
    >
      <ClienteGatekeeper>
        {children}
      </ClienteGatekeeper>
    </ClienteAppWrapper>
  );
}