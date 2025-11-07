'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/authContext';
// --- mockClientes foi REMOVIDO ---
import { mockEquipamentos, mockOrdensServico } from '@/lib/mock-data';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building, 
  Lock, 
  Info, 
  Loader2,
  Package,
  ClipboardList,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function PerfilPage() { // Renomeado de ClientePerfilPage para PerfilPage (genérico)
  const { user, role } = useAuth(); // <-- Pega o usuário e a role direto do Auth
  const [isLoading, setIsLoading] = useState(false);
  
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  // --- LÓGICA DE INFORMAÇÕES ÚTEIS ---
  // (Removemos o 'empresa', pois 'user' já tem os dados)
  const [equipamentosCount, setEquipamentosCount] = useState(0);
  const [chamadosAbertosCount, setChamadosAbertosCount] = useState(0);

  useEffect(() => {
    // Apenas executa os contadores se o usuário for um Cliente
    if (user && role === 'Cliente') {
      
      // O 'user.id' do Auth (ex: 17) é usado para filtrar os mocks
      // NOTA: Se o seu mock-data não tiver equipamentos para o user.id real,
      // isso retornará 0. Você precisará de uma API para isso no futuro.
      const equipamentos = mockEquipamentos.filter(e => e.clienteId === user.id);
      setEquipamentosCount(equipamentos.length);
      
      const chamados = mockOrdensServico.filter(os => 
        os.clienteId === user.id && os.status !== 'Concluída'
      );
      setChamadosAbertosCount(chamados.length);
    }
  }, [user, role]); // Roda quando o usuário é carregado

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (novaSenha !== confirmaSenha) {
      toast.error("A nova senha e a confirmação não batem.");
      setIsLoading(false);
      return;
    }
    
    // TODO: Implementar chamada de API para POST /user/change-password
    // A API deve receber { senhaAtual, novaSenha }
    
    setTimeout(() => {
      console.log("Alterando senha...", { senhaAtual, novaSenha });
      toast.success("Senha alterada com sucesso!");
      setIsLoading(false);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmaSenha('');
    }, 1000);
  };

  if (!user) { // Mostra o loading enquanto o user/me do AuthProvider é resolvido
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Helper de Avatar (Corrigido)
  const getFallback = (nome: string) => {
    // 1. Verifica se 'nome' é uma string válida
    if (!nome || typeof nome !== 'string') {
      return 'U'; // "U" de Usuário (Fallback Padrão)
    }

    // 2. Se for válida, continua a lógica
    const parts = nome.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
      
      <div className="mx-auto space-y-6">

        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
          
          {/* Card 1: Dados do Usuário (Para todos) */}
          <Card className='grid xl:col-span-1'>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {getFallback(user.nome)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-semibold">{user.nome}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="mt-2">{role}</Badge>
            </CardContent>
            <Separator />
            <CardFooter className="p-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="https://wa.me/5519993537056" target="_blank">
                  <MessageSquare className="mr-2 h-4 w-4 text-green-600" /> Contatar Suporte (WhatsApp)
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Dados da Empresa (Apenas se for Cliente) */}
          {role === 'Cliente' && (
            <Card className='grid xl:col-span-2'>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" /> Dados da Empresa
                </CardTitle>
                <CardDescription>
                  Estes são os dados cadastrais da sua empresa vinculada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* --- DADOS VINDOS DIRETAMENTE DO 'user' --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Nome Fantasia</Label>
                    {/* A API retorna 'name', não 'nomeFantasia' */}
                    <p className="font-semibold text-lg">{user.nome}</p> 
                  </div>
                  <div className="space-y-1">
                    <Label>CNPJ</Label>
                    <p className="font-semibold text-lg">{user.cnpj || 'Não cadastrado'}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Razão Social</Label>
                  <p className="text-muted-foreground">{user.razaoSocial || 'Não cadastrado'}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Alert variant="default" className="shadow-none">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Aviso</AlertTitle>
                  <AlertDescription>
                    Para alterar os dados da empresa, por favor, entre em contato com o administrador do sistema.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          )}

           {/* Se não for cliente, mostra um espaço reservado ou nada */}
           {role !== 'Cliente' && (
            <Card className='grid xl:col-span-2'>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" /> Conta de Equipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Você está logado como {role}. Os dados de clientes não se aplicam à sua conta.</p>
              </CardContent>
            </Card>
          )}

        </div>
        
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>

          {/* Card 3: Atividade (Apenas se for Cliente) */}
          {role === 'Cliente' && (
            <Card className='grid xl:col-span-2'>
              <CardHeader>
                <CardTitle>Minha Atividade</CardTitle>
                <CardDescription>
                  Resumo da sua conta e equipamentos vinculados.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-medium">Equipamentos Monitorados</span>
                  </div>
                  <span className="font-bold text-lg">{equipamentosCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <span className="font-medium">Meus Chamados Abertos</span>
                  </div>
                  <span className="font-bold text-lg">{chamadosAbertosCount}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/cliente/equipamentos">
                    Ver todos os equipamentos
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Se não for cliente, mostra um espaço reservado */}
          {role !== 'Cliente' && (
            <div className="xl:col-span-2" />
          )}
          
          {/* Card 4: Senha (Para todos) */}
          <Card className='grid xl:col-span-1'>
            <form onSubmit={handlePasswordSubmit}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" /> Alterar Senha
                </CardTitle>
                <CardDescription>
                  Para sua segurança, recomendamos o uso de uma senha forte.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senha-atual">Senha Atual</Label>
                  <Input 
                    id="senha-atual" 
                    type="password" 
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nova-senha">Nova Senha</Label>
                    <Input 
                      id="nova-senha" 
                      type="password" 
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirma-senha">Confirmar Nova Senha</Label>
                    <Input 
                      id="confirma-senha" 
                      type="password" 
                      value={confirmaSenha}
                      onChange={(e) => setConfirmaSenha(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Nova Senha
                </Button>
              </CardFooter>
            </form>
          </Card>

        </div>
        
      </div>
    </div>
  );
}