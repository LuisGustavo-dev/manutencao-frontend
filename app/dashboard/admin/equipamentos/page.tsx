'use client';
import { useState, useEffect } from 'react';
import { mockEquipamentos, mockClientes } from '@/lib/mock-data';
import type { Equipamento } from '@/lib/mock-data'; 
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { 
  Search,
  Settings2,
  Droplet,
  Wind,
  Bolt,
  MoreVertical,
  QrCode,
  Pencil,
  History,
  Package
} from 'lucide-react';

// Importa os componentes de modal do DIRETÓRIO LOCAL
import { QrCodeModalContent } from './components/QrCodeModalContent';
import { EditEquipmentModalContent } from './components/EditEquipmentModalContent';
import { HistoryModalContent } from './components/HistoryModalContent';

export default function AdminEquipamentosPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter(); // Pode ser usado para o botão "Novo"

  type ModalType = 'qr' | 'edit' | 'history' | null;
  const [modalState, setModalState] = useState<{
    type: ModalType;
    equipment: Equipamento | null;
  }>({ type: null, equipment: null });

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const filteredEquipamentos = mockEquipamentos.filter(eq => {
    const status = typeof window !== 'undefined' ? 
                   localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao : 
                   eq.statusManutencao;
    const clienteNome = mockClientes.find(c => c.id === eq.clienteId)?.nomeFantasia || '';
    const statusMatch = statusFilter === 'all' || status === statusFilter;
    const searchMatch = searchTerm === '' ||
      eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.modeloCompressor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const openModal = (type: ModalType, equipment: Equipamento) => {
    setModalState({ type, equipment });
  };
  const closeModal = () => {
    setModalState({ type: null, equipment: null });
  };

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO DA PÁGINA (com botão "Novo") */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Equipamentos (Admin)</h2>
          <p className="text-muted-foreground">
            Gerencie, edite e monitore todo o inventário de equipamentos.
          </p>
        </div>
        <Button onClick={() => alert('Abrir modal/página de NOVO equipamento...')}>
          + Novo Equipamento
        </Button>
      </div>

      {/* 2. BARRA DE FILTRO E PESQUISA */}
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar por nome, tipo, cliente..." 
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
      
      {/* 3. GRID DE EQUIPAMENTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipamentos.map((eq) => {
          const status = typeof window !== 'undefined' ? 
                                localStorage.getItem(`status_${eq.id}`) || eq.statusManutencao : 
                                eq.statusManutencao;
          const cliente = mockClientes.find(c => c.id === eq.clienteId);

          return (
            <Card key={eq.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="truncate">{eq.nome}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {cliente ? (
                      <>
                        <Package className="h-4 w-4" /> {cliente.nomeFantasia}
                      </>
                    ) : (
                      <span className="text-yellow-600">Sem cliente (Estoque)</span>
                    )}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  {status === 'Disponível' ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">Disponível</Badge>
                  ) : (
                    <Badge variant="destructive">Em Manutenção</Badge>
                  )}

                  {/* Dropdown Menu (Admin/Manutentor) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openModal('edit', eq)}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openModal('qr', eq)}>
                        <QrCode className="mr-2 h-4 w-4" /> Ver QR Code
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openModal('history', eq)}>
                        <History className="mr-2 h-4 w-4" /> Ver Histórico
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-muted-foreground" /><span className="truncate" title={eq.modeloCompressor}>{eq.modeloCompressor}</span></div>
                <div className="flex items-center gap-2"><Wind className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tipoGas}</span></div>
                <div className="flex items-center gap-2"><Droplet className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tipoOleo}</span></div>
                <div className="flex items-center gap-2"><Bolt className="h-4 w-4 text-muted-foreground" /><span className="truncate">{eq.tensao}</span></div>
              </CardContent>
              
              {/* O Admin NÃO tem o rodapé de "Solicitar Manutenção" */}
            </Card>
          );
        })}

        {filteredEquipamentos.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-12">
            <p>Nenhum equipamento encontrado com esses filtros.</p>
          </div>
        )}
      </div>

      {/* RENDERIZAÇÃO DO DIALOG GLOBAL */}
      <Dialog open={!!modalState.type} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-xl">
          {modalState.type === 'qr' && modalState.equipment && (
            <QrCodeModalContent 
              equipmentName={modalState.equipment.nome}
              qrUrl={`${window.location.origin}/equipamento?id=${modalState.equipment.id}`}
              onClose={closeModal} 
            />
          )}
          {modalState.type === 'edit' && modalState.equipment && (
            <EditEquipmentModalContent 
              equipment={modalState.equipment}
              clientes={mockClientes} 
              onClose={closeModal}
            />
          )}
          {modalState.type === 'history' && modalState.equipment && (
            <HistoryModalContent 
              equipmentName={modalState.equipment.nome}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}