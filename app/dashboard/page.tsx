'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/authContext';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { role, token } = useAuth();

  useEffect(() => {
    if (token === undefined) return;

    if (role === 'Admin') {
      router.push('/dashboard/admin');
    } else if (role === 'Manutentor') {
      router.push('/dashboard/manutentor');
    } else if (role === 'Cliente') {
      router.push('/dashboard/cliente');
    } else if (role === 'Colaborador') {
      router.push('/dashboard/colaborador');
    } else{
      router.push('/login');
    }
  }, [role, token, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Carregando seu painel...</p>
    </div>
  );
}