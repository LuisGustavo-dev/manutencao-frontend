'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockUsuarios } from '@/lib/mock-data'; 
import { useAuth } from '@/app/contexts/authContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setRole, token } = useAuth();

  // Redireciona se já estiver logado (sem alteração)
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
    setIsLoading(true);

    // Simula a demora de uma API
    setTimeout(() => {
      const usuario = mockUsuarios.find(
        (u) => u.email === email && u.senha === senha
      );

      if (usuario) {
        setRole(usuario.role);
        
        // Redireciona (o useEffect acima cuidará disso, mas podemos forçar)
        if (usuario.role === 'Admin') router.push('/dashboard/admin');
        else if (usuario.role === 'Manutentor') router.push('/dashboard/manutentor');
        else router.push('/dashboard/cliente');
      
      } else {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.');
        setIsLoading(false);
      }
    }, 500); 
  };

  return (
    // Container principal que cobre toda a tela e centraliza o conteúdo
    <main className="bg-slate-100 relative flex min-h-screen flex-col items-center justify-center p-4 pb-16">
      
      
      {/* 2. Sobreposição Escura (para legibilidade) */}
      <div className="absolute inset-0 z-10" />

      {/* 3. Card de Login (Flutuando no centro) */}
      {/* 'relative z-20' coloca o card na frente da sobreposição */}
      <Card className="w-full max-w-sm relative z-20"> 
        <CardHeader className="items-center text-center">
          {/* Branding (Logo e Título) */}
          <div className="flex flex-col items-center mb-4">
            <ShieldCheck className="h-12 w-12 text-primary" />
            <h1 className="text-xl font-bold mt-2">GrandTech</h1>
          </div>
          <CardTitle className="text-2xl">Acesso ao Portal</CardTitle>
          <CardDescription>
            Use suas credenciais para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@exemplo.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={senha} 
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" disabled={isLoading} />
                <Label htmlFor="remember" className="text-sm font-normal">Lembrar de mim</Label>
              </div>
              <Link href="#" className="text-sm text-primary hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            {error && (<p className="text-sm text-destructive text-center">{error}</p>)}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}