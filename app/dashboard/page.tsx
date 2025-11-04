'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/authContext';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { role } = useAuth();

  useEffect(() => {
    if (role === 'Admin') {
      router.push('/dashboard/admin');
    } else if (role === 'Manutentor') {
      router.push('/dashboard/manutentor');
    } else if (role === 'Cliente') {
      router.push('/dashboard/cliente');
    } else if (role === null) {
      // Se caiu aqui sem role, volta pro login
      router.push('/login');
    }
  }, [role, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <p>Redirecionando...</p>
    </div>
  );
}