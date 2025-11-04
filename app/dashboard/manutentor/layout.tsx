'use client';
import { ReactNode, useEffect } from 'react';
import { ManutentorAppWrapper } from './sidebar/ManutentorAppWrapper'; // Importa o wrapper LOCAL
import ManutentorSidebar from './sidebar/ManutentorSidebar'; // Importa a sidebar LOCAL
import { useAuth } from '@/app/contexts/authContext';
import { useRouter } from 'next/navigation';

// Gatekeeper: Garante que Manutentor (ou Admin simulando) entre
function ManutentorGatekeeper({ children }: { children: ReactNode }) {
  const { role, token } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (token === undefined) return;
    // Admin pode simular, Manutentor pode entrar
    if (role !== 'Manutentor' && role !== 'Admin') {
      router.push('/login'); // Expulsa se não for Manutentor ou Admin
    }
  }, [role, token, router]);

  if (role === 'Manutentor' || role === 'Admin') {
    return <>{children}</>;
  }
  return <div className="flex h-screen w-full items-center justify-center"><p>Verificando permissões...</p></div>;
}

export default function ManutentorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ManutentorAppWrapper
      // Injeta a sidebar específica do Manutentor no wrapper
      sidebar={<ManutentorSidebar collapsed={false} setCollapsed={() => {}} />}
    >
      <ManutentorGatekeeper>
        {children}
      </ManutentorGatekeeper>
    </ManutentorAppWrapper>
  );
}