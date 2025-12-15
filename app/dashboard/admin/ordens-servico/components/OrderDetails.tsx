'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/authContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, User, Wrench, ImageIcon, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MidiaResposta {
  observacao: string;
  midias: string[];
}

interface DetalhesOS {
  id: number;
  status: string;
  horaAbertura: string;
  razaoSocial: string;
  modeloCompressor: string;
  midiasUser: string[] | null; // Pode vir null
  observacaoUser: string[] | null; 
  picoEnergia: any[];
  checklistsTecnico: any[];
}

interface TimelineOS {
  id: number;
  status: string;
  tipo: string;
  horaAbertura: string;
  horaFinalizacao: string | null;
  equipamento: any | null;
  tecnico: any | null;
  respostasCliente: MidiaResposta[] | null;
  respostasTecnico: any[];
}

interface OrderDetailsResponse {
  detalhes: DetalhesOS;
  timeLine: TimelineOS;
}

interface OrderDetailsProps {
  osId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetails({ osId, isOpen, onClose }: OrderDetailsProps) {
  const { token } = useAuth();
  const [data, setData] = useState<OrderDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && osId && token) {
      fetchDetails();
    } else {
        if (!isOpen) setData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, osId, token]);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3340/chamado/detalhes/${osId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao carregar detalhes da OS');

      const result = await response.json();
      setData(result);
    } catch (error: any) {
      console.error(error);
      // Não fecha o modal automaticamente para permitir retry ou leitura do erro se quiser
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('aberto') || s.includes('pendente')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (s.includes('andamento')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (s.includes('finalizado') || s.includes('concluida')) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {isLoading ? 'Carregando...' : `Ordem de Serviço #${data?.detalhes?.id || ''}`}
            {!isLoading && data?.detalhes && (
              <Badge variant="outline" className={getStatusColor(data.detalhes.status)}>
                {data.detalhes.status}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos da solicitação e histórico.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Buscando informações...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* --- CABEÇALHO --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">Cliente:</span> {data.detalhes?.razaoSocial || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Wrench className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">Equipamento:</span> {data.detalhes?.modeloCompressor || 'N/A'}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">Abertura:</span> {formatDate(data.detalhes?.horaAbertura)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">Tipo:</span> {data.timeLine?.tipo || 'N/A'}
                </div>
              </div>
            </div>

            {/* --- RELATO --- */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-gray-900">
                <AlertCircle className="w-4 h-4" />
                Relato do Cliente
              </h3>
              <div className="bg-white p-3 rounded border text-sm text-gray-700">
                {data.detalhes?.observacaoUser && data.detalhes.observacaoUser.length > 0 ? (
                    data.detalhes.observacaoUser.map((obs, index) => (
                        <p key={index} className="mb-1 last:mb-0">{obs}</p>
                    ))
                ) : (
                    <span className="italic text-gray-400">Sem observações.</span>
                )}
              </div>
            </div>

            {/* --- EVIDÊNCIAS --- */}
            {/* CORREÇÃO AQUI: Usamos ( ... || []) para evitar erro se for null */}
            {(data.detalhes.midiasUser || []).filter(url => url).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 text-gray-900">
                  <ImageIcon className="w-4 h-4" />
                  Evidências / Mídias
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(data.detalhes.midiasUser || [])
                    .filter(url => url) // Remove null, undefined ou string vazia
                    .map((url, index) => (
                    <a 
                      key={index} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group relative aspect-square bg-gray-100 rounded-md overflow-hidden border hover:border-primary transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={url} 
                        alt={`Evidência ${index + 1}`} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* --- HISTÓRICO ADICIONAL --- */}
            {data.timeLine?.respostasCliente && data.timeLine.respostasCliente.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                    <h3 className="font-semibold text-gray-900">Histórico de Interação</h3>
                    {data.timeLine.respostasCliente.map((resp, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded text-sm">
                            <p className="font-medium text-gray-700 mb-2">Cliente comentou:</p>
                            <p className="text-gray-600 mb-2">{resp.observacao}</p>
                            {resp.midias && resp.midias.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto py-2">
                                    {resp.midias.map((m, mIdx) => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img key={mIdx} src={m} alt="Anexo resposta" className="h-16 w-16 object-cover rounded border" />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhum dado encontrado.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}