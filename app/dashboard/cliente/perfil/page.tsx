'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/authContext';
import { mockClientes, mockEquipamentos, mockOrdensServico } from '@/lib/mock-data';
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
  HardHat
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';

export default function ClientePerfilPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  // --- LÓGICA DE INFORMAÇÕES ÚTEIS ---
  const [empresa, setEmpresa] = useState<typeof mockClientes[0] | undefined>(undefined);
  const [equipamentosCount, setEquipamentosCount] = useState(0);
  const [chamadosAbertosCount, setChamadosAbertosCount] = useState(0);

  useEffect(() => {
    if (user) {
      const foundEmpresa = mockClientes.find(c => c.id === user.clienteId);
      setEmpresa(foundEmpresa);

      if (foundEmpresa) {
        const equipamentos = mockEquipamentos.filter(e => e.clienteId === foundEmpresa.id);
        setEquipamentosCount(equipamentos.length);
        
        const chamados = mockOrdensServico.filter(os => 
          os.clienteId === foundEmpresa.id && os.status !== 'Concluída'
        );
        setChamadosAbertosCount(chamados.length);
      }
    }
  }, [user]); // Roda quando o usuário é carregado

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (novaSenha !== confirmaSenha) {
      toast.error("A nova senha e a confirmação não batem.");
      setIsLoading(false);
      return;
    }
    // ... (outras validações)

    setTimeout(() => {
      console.log("Alterando senha...", { senhaAtual, novaSenha });
      toast.success("Senha alterada com sucesso!");
      setIsLoading(false);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmaSenha('');
    }, 1000);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
      
      {/* Layout em Grid (2 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- COLUNA 1 (ESQUERDA): Perfil e Atividade --- */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card de Perfil */}
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {user.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-semibold">{user.nome}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge className="mt-3">Usuário Cliente</Badge>
            </CardContent>
            <Separator />
            <CardFooter className="p-4">
              <Button variant="outline" className="w-full">
                <HardHat className="mr-2 h-4 w-4" /> Contatar Suporte
              </Button>
            </CardFooter>
          </Card>

          {/* Card de Atividade (INFORMAÇÃO ÚTIL) */}
          <Card>
            <CardHeader>
              <CardTitle>Minha Atividade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-medium">Equipamentos Monitorados</span>
                </div>
                <span className="font-bold text-lg">{equipamentosCount}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <span className="font-medium">Chamados Abertos</span>
                </div>
                <span className="font-bold text-lg">{chamadosAbertosCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- COLUNA 2 (DIREITA): Ações e Dados --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card de Alterar Senha */}
          <Card>
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
          
          {/* Card de Dados da Empresa */}
          {empresa ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" /> Dados da Empresa
                </CardTitle>
                <CardDescription>
                  Estes são os dados cadastrais da sua empresa vinculada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Nome Fantasia</Label>
                    <p className="font-semibold text-lg">{empresa.nomeFantasia}</p>
                  </div>
                  <div className="space-y-1">
                    <Label>CNPJ</Label>
                    <p className="font-semibold text-lg">{empresa.cnpj}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Razão Social</Label>
                  <p className="text-muted-foreground">{empresa.razaoSocial}</p>
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
          ) : (
            <Card>
              <CardContent className="p-6">
                <p>Nenhuma empresa vinculada a este usuário.</p>
              </CardContent>
            </Card>
          )}
        </div>
        
      </div>
    </div>
  );
}