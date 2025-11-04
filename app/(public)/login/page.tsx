'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockUsuarios } from '@/lib/mock-data'; 
import { useAuth } from '@/app/contexts/authContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { setRole, token } = useAuth(); // Usando setRole do contexto

  // Redireciona se já estiver logado
  useEffect(() => {
    if (token) {
      if (token === 'Admin') router.push('/dashboard/admin');
      else if (token === 'Manutentor') router.push('/dashboard/manutentor');
      else if (token === 'Cliente') router.push('/dashboard/cliente');
    }
  }, [token, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Valida o usuário no mock
    const usuario = mockUsuarios.find(
      (u) => u.email === email && u.senha === senha
    );

    if (usuario) {
      // Define a role no contexto (que salva no localStorage e no estado)
      setRole(usuario.role);
      
      // Redireciona para o painel correto
      if (usuario.role === 'Admin') {
        router.push('/dashboard/admin'); // <-- Rota do Admin
      } else if (usuario.role === 'Manutentor') {
        router.push('/dashboard/manutentor');
      } else {
        router.push('/dashboard/cliente');
      }

    } else {
      setError('Credenciais inválidas. Tente admin@grandtech.com (senha 123)');
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Acessar Painel</CardTitle>
          <CardDescription>
            Entre com seus dados para gerenciar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@exemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
            </div>
            {error && (<p className="text-sm text-destructive">{error}</p>)}
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}