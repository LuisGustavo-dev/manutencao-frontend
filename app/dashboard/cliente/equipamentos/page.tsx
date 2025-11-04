'use client';
import { useState, useEffect } from 'react';
import { mockEquipamentos, mockClientes } from '@/lib/mock-data';
import type { Equipamento } from '@/lib/mock-data'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/app/contexts/authContext'; // Importar Auth para pegar o ID do cliente (simulado)
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, 
  Search,
  Settings2,
  Droplet,
  Wind,
  Bolt,
  Package
} from 'lucide-react';

export default function ClienteEquipamentosPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth(); // <-- Pega o usuário logado
  const router = useRouter();

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // --- LÓGICA DE FILTRO DO CLIENTE ---
  // (Simula que o 'user.id' do authContext está ligado ao 'clienteId' do equipamento)
  // (No nosso mock, 'u1' (cliente) não bate com 'cli-1' (clienteId), então vamos forçar)
  const meuClienteId = 'cli-1'; // <-- Simulação

  const filteredEquipamentos = mockEquipamentos.filter(eq => {
    // 1. Filtra SÓ os equipamentos deste cliente
    if (eq.clienteId !== meuClienteId) {
      return false;
    }
    
    const status = typeof window !== 'undefined' ? 
                   localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao : 
                   eq.statusManutencao;
                   
    const statusMatch = statusFilter === 'all' || status === statusFilter;
    
    const searchMatch = searchTerm === '' ||
      eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.modeloCompressor.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  const handleClientAction = (id: string) => {
    // O cliente é enviado para a página PÚBLICA do equipamento
    router.push(`/equipamento?id=${id}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO DA PÁGINA (Sem botão "Novo") */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meus Equipamentos</h2>
          <p className="text-muted-foreground">
            Monitore e solicite manutenção para seus equipamentos.
          </p>
        </div>
      </div>

      {/* 2. BARRA DE FILTRO E PESQUISA */}
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar por nome, tipo..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Disponível">Disponível</SelectItem>
              <SelectItem value="Manutencao">Em Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {/* 3. GRID DE EQUIPAMENTOS (Versão Cliente) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {filteredEquipamentos.map((eq) => {
          const status = typeof window !== 'undefined' ? 
                                localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao : 
                                eq.statusManutencao;

          return (
            <Card key={eq.id} className="flex flex-col hover:shadow-lg transition-shadow">
              
              <CardHeader>
                {/* O Cliente não precisa do menu dropdown, só do status */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="truncate">{eq.nome}</CardTitle>
                    <CardDescription>{eq.tipo}</CardDescription>
                  </div>
                  {status === 'Disponível' ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">Disponível</Badge>
                  ) : (
                    <Badge variant="destructive">Em Manutenção</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-muted-foreground" /><span className="truncate" title={eq.modeloCompressor}>{eq.modeloCompressor}</span></div>
                <div className="flex items-center gap-2"><Wind className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tipoGas}</span></div>
                <div className="flex items-center gap-2"><Droplet className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tipoOleo}</span></div>
                <div className="flex items-center gap-2"><Bolt className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tensao}</span></div>
              </CardContent>
              
              {/* O Cliente VÊ o rodapé de ação */}
              <CardFooter>
                {status === 'Disponível' ? (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleClientAction(eq.id)}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Solicitar Manutenção
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleClientAction(eq.id)}
                  >
                    Ver Status do Chamado
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}

        {filteredEquipamentos.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-12">
            <p>Nenhum equipamento encontrado.</p>
          </div>
        )}
      </div>

      {/* O Cliente NÃO precisa dos modais de Admin/Manutentor */}
    </div>
  );
}