'use client';
import { useState, useEffect, useMemo } from 'react';
// import { mockEquipamentos, mockClientes } from '@/lib/mock-data'; // (Removido)
import type { Equipamento } from '@/lib/mock-data'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/app/contexts/authContext';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, 
  Search,
  Settings2,
  Droplet,
  Wind,
  Bolt,
  Package,
  Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast'; 

export default function ClienteEquipamentosPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user, token } = useAuth(); 
  const router = useRouter();

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setBaseUrl(window.location.origin);

    const fetchEquipamentos = async () => {
      if (!token) {
        setIsLoading(false);
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3340/equipamento', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar equipamentos');
        }

        const dataFromApi = await response.json();

        const transformedData: Equipamento[] = dataFromApi.map((apiEq: any) => {
          const statusManutencao: 'Disponível' | 'Manutencao' = 
            apiEq.status === 'manutencao' ? 'Manutencao' : 'Disponível';

          return {
            id: String(apiEq.id),
            clienteId: apiEq.user ? String(apiEq.user.id) : null,
            
            // Campo 'nome' mantido apenas para satisfazer o tipo, mas não será usado
            nome: apiEq.nome || 'Equipamento s/ nome', 
            
            tipo: apiEq.tipo || 'Climatização',
            tipoCondensador: apiEq.tipoCondensador || 'N/A',
            tipoEvaporador: apiEq.tipoEvaporador || 'N/A',
            valvulaExpansao: apiEq.valvulaExpansao || 'N/A',
            
            statusManutencao: statusManutencao,
            modeloCompressor: apiEq.modeloCompressor || 'N/A',
            tipoGas: apiEq.tipoGas || 'N/A',
            tipoOleo: apiEq.tipoOleo || 'N/A',
            tensao: String(apiEq.tensao) + 'V', 
            aplicacao: apiEq.aplicacao || 'N/A',
          };
        });

        setEquipamentos(transformedData);

      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipamentos();
  }, [token]); 

  // --- LÓGICA DE FILTRO ATUALIZADA ---
  const filteredEquipamentos = useMemo(() => {
    return equipamentos.filter(eq => {
      
      const status = typeof window !== 'undefined' ? 
                       localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao : 
                       eq.statusManutencao;
                      
      const statusMatch = statusFilter === 'all' || status === statusFilter;
      
      // --- ATUALIZADO: Pesquisa por ID, Tipo ou Compressor ---
      const searchMatch = searchTerm === '' ||
        eq.id.toLowerCase().includes(searchTerm.toLowerCase()) || // <-- MUDADO
        eq.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.modeloCompressor.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [equipamentos, searchTerm, statusFilter]);

  const handleClientAction = (id: string) => {
    router.push(`/equipamento?id=${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Carregando seus equipamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO DA PÁGINA */}
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
              // --- ATUALIZADO: Placeholder ---
              placeholder="Pesquisar por ID, tipo..." 
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    
                    {/* --- ATUALIZADO: Título e Descrição --- */}
                    <CardTitle className="truncate">Equipamento #{eq.id}</CardTitle>
                    <CardDescription>{eq.aplicacao}</CardDescription>
                  
                  </div>
                  {status === 'Disponível' ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">Disponível</Badge>
                  ) : (
                    <Badge variant="destructive">Manutenção</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-muted-foreground" /><span className="truncate" title={eq.modeloCompressor}>{eq.modeloCompressor}</span></div>
                <div className="flex items-center gap-2"><Wind className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tipoGas}</span></div>
                <div className="flex items-center gap-2"><Droplet className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tipoOleo}</span></div>
                <div className="flex items-center gap-2"><Bolt className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tensao}</span></div>
              </CardContent>
              
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

        {!isLoading && filteredEquipamentos.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-12">
            <Package className="h-10 w-10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhum equipamento encontrado</h3>
            <p>Você ainda não possui equipamentos cadastrados ou eles não correspondem ao filtro.</p>
          </div>
        )}
      </div>

    </div>
  );
}