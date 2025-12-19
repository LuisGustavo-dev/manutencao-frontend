'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/authContext'; // Importa o hook atualizado
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // --- ATUALIZADO: Puxa 'login' e 'token' (e 'isLoading' do auth) ---
  const { login, token, isLoading: isAuthLoading, role } = useAuth(); 

  // Redireciona se já estiver logado
  useEffect(() => {
    // Se o AuthProvider ainda estiver validando o token, não faça nada
    if (isAuthLoading) {
      return; 
    }
    
    // Se o token existir (AuthProvider validou), redireciona baseado no 'role'
    if (token && role) {
      if (role === 'Admin') router.push('/dashboard/admin');
      else if (role === 'Manutentor') router.push('/dashboard/manutentor');
      else if (role === 'Cliente') router.push('/dashboard/cliente');
      else if (role === 'Colaborador') router.push('/dashboard/colaborador');
    }
  }, [token, role, isAuthLoading, router]); // <-- Depende do carregamento do auth

  // --- FUNÇÃO DE LOGIN ATUALIZADA ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Ativa o loading do *formulário*

    try {
      const response = await fetch('http://localhost:3340/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: senha, // Mapeado 'senha' do estado para 'password' da API
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Usa a mensagem de erro da API se ela existir
        throw new Error(data.message || 'Credenciais inválidas');
      }

      // --- AUTENTICAÇÃO SIMPLIFICADA ---
      
      // 1. Chama a função login do Context com os dados da API
      // O Context vai cuidar de salvar no estado e no localStorage
      login(data); 
      
      toast.success(`Bem-vindo, ${data.user.name}!`);

      // 2. Redirecione o usuário (mapeando a role vinda da API)
      const apiRole = data.user.role.toLowerCase();
      if (apiRole === 'admin') {
        router.push('/dashboard/admin');
      } else if (apiRole === 'technical') {
        router.push('/dashboard/manutentor');
      } else { // 'user'
        router.push('/dashboard/cliente');
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao tentar fazer login.');
      setIsLoading(false); // <-- Libera o botão se der erro
    }
  };
  // --- FIM DA FUNÇÃO DE LOGIN ---

  // Enquanto o AuthProvider verifica o token, mostramos um loader
  if (isAuthLoading || token) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-slate-100">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
  }

  // Se o AuthProvider terminou e não há token, mostra o formulário
  return (
    <main className="bg-slate-100 relative flex min-h-screen flex-col items-center justify-center p-4 pb-16">
      
      <div className="absolute inset-0 z-10" />

      <Card className="w-full max-w-sm relative z-20"> 
        <CardHeader className="items-center text-center">
          <div className="flex flex-col items-center mb-4">
            {/* Assumindo que você tem um logo.png na pasta /public */}
            <img src="/assets/logo.png" alt="MGR Refrigeração" className="w-24 h-auto" /> 
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