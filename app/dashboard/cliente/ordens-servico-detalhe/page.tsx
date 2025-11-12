'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation'; 
import Link from 'next/link';
import type { Equipamento } from '@/lib/mock-data'; 
import { useAuth } from '@/app/contexts/authContext'; 

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle,
  Package,
  User,
  Clock,
  History,
  FileText,
  HardHat, 
  ArrowLeft,
  Play 
} from "lucide-react";
import toast from 'react-hot-toast'; 

// --- 1. TIPO DE HISTÓRICO ATUALIZADO ---
// (Tipo para a resposta do técnico)
type RespostaTecnico = {
  nome: string;
  estado: boolean;
  observacao: string;
  operacional: boolean;
  midia: string;
};

type TimelineItem = {
  id: string | number;
  data: string;
  autor: string;
  acao: string;
  icon: React.ElementType;
  color: string;
  midias?: string[]; // Mídias do cliente
  respostasTecnico?: RespostaTecnico[]; // <-- Mídias/respostas do técnico
};
// --- FIM DO TIPO ---

// Wrapper de Suspense
export default function DetalheOSWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <DetalheOSPage />
    </Suspense>
  );
}

// --- HELPER DE FORMATAÇÃO DE DATA/HORA ---
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    const data = date.toLocaleDateString('pt-BR');
    const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${data} às ${hora}`;
  } catch (e) {
    return 'Data inválida';
  }
};
// --- FIM DO HELPER ---

function DetalheOSPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, token } = useAuth(); 
  
  const osId = searchParams.get('osId'); 
  const equipId = searchParams.get('equipId'); 

  const [os, setOs] = useState<any>(null); 
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [detalhesProblema, setDetalhesProblema] = useState("");
  const [midiasProblema, setMidiasProblema] = useState<string[]>([]); // Estado para as mídias do cliente
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mapeia status da API para o status do Frontend
  const mapStatus = (status: string | null): 'Pendente' | 'Em Andamento' | 'Concluída' => {
    if (!status) return 'Pendente';
    const s = status.toLowerCase();
    if (s === 'pendente' || s === 'aberto') return 'Pendente';
    if (s === 'em andamento') return 'Em Andamento';
    if (s === 'finalizado' || s === 'concluída') return 'Concluída';
    return 'Pendente';
  };

  // --- 2. CONSTRUTOR DA LINHA DO TEMPO (ATUALIZADO) ---
  const buildTimeline = (tl: any, clienteNome: string, observacaoCliente: string) => {
    const newTimeline: TimelineItem[] = [];

    // 1. Abertura (baseado na resposta do cliente)
    if (tl.respostasCliente && tl.respostasCliente.length > 0) {
      newTimeline.push({
        id: tl.id,
        data: formatDateTime(tl.horaAbertura) || 'N/A',
        autor: clienteNome || 'Cliente',
        // Usa a observação principal (passada como parâmetro)
        acao: `Chamado aberto: "${observacaoCliente}"`, 
        icon: AlertTriangle,
        color: 'text-destructive',
        midias: tl.respostasCliente[0].midias || []
      });
    }

    // 2. Início do Atendimento
    if (tl.horaInicioAtendimento) {
      newTimeline.push({
        id: `${tl.id}_inicio`,
        data: formatDateTime(tl.horaInicioAtendimento) || 'N/A',
        autor: tl.tecnico?.nome || 'Técnico',
        acao: "Manutenção iniciada em campo.",
        icon: Play,
        color: 'text-blue-500'
      });
    }

    // 3. Finalização (com respostas do técnico)
    if (tl.horaFinalizacao && (tl.status.toLowerCase() === 'finalizado' || tl.status.toLowerCase() === 'concluída')) {
      newTimeline.push({
        id: `${tl.id}_fim`,
        data: formatDateTime(tl.horaFinalizacao) || 'N/A',
        autor: tl.tecnico?.nome || 'Técnico',
        acao: "Manutenção concluída.", // Ação principal
        icon: CheckCircle,
        color: 'text-green-600',
        respostasTecnico: tl.respostasTecnico || [] // <-- ANEXA AS RESPOSTAS
      });
    }
    
    return newTimeline.reverse();
  };
  // --- FIM DO CONSTRUTOR ---

  // --- FETCH DOS DADOS ---
  useEffect(() => {
    if (!osId || !token) { 
      setIsLoading(false);
      setError("ID da OS ou token de autenticação não encontrado.");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3340/chamado/detalhes/${osId}?_=${new Date().getTime()}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar dados da Ordem de Serviço.');
        }

        const apiData = await response.json();

        if (!apiData.detalhes || !apiData.timeLine) {
           throw new Error('Resposta da API incompleta.');
        }

        // --- 3. TRADUÇÃO DOS DADOS (ATUALIZADA) ---
        setOs(apiData.detalhes);
        
        // Pega os detalhes e mídias do objeto 'detalhes' (fonte mais confiável)
        const obsCliente = (apiData.detalhes.observacao && apiData.detalhes.observacao.length > 0) 
                           ? apiData.detalhes.observacao[0] 
                           : "Nenhuma descrição fornecida.";
        
        setDetalhesProblema(obsCliente);
        setMidiasProblema(apiData.detalhes.midias || []);

        // Passa a observação do cliente para o buildTimeline
        setTimeline(buildTimeline(apiData.timeLine, apiData.detalhes.razaoSocial, obsCliente));
        // --- FIM DA TRADUÇÃO ---

      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados.");
        toast.error(err.message || "Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [osId, token]); // Depende do osId


  // --- RENDERIZAÇÃO DE LOADING E ERRO ---
  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Carregando dados da OS...</p>
      </main>
    );
  }

  if (error || !os) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Ordem de Serviço não encontrada</h1>
        <p className="text-muted-foreground">{error || "O ID solicitado não existe."}</p>
        <Button variant="outline" asChild className="mt-6">
          <Link href="/dashboard/cliente/ordens-servico">Voltar à Lista</Link>
        </Button>
      </main>
    );
  }
  // --- FIM DA RENDERIZAÇÃO DE LOADING E ERRO ---


  // --- Helpers Visuais (usando dados da API) ---
  const statusFormatado = mapStatus(os.status);

  const getStatusIcon = (status: string) => {
    if (status === 'Pendente') return <AlertTriangle className="h-8 w-8 text-destructive" />;
    if (status === 'Em Andamento') return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />;
    if (status === 'Concluída') return <CheckCircle className="h-8 w-8 text-green-600" />;
    return <AlertTriangle className="h-8 w-8" />;
  };

  const getStatusDescription = (status: string) => {
    if (status === 'Pendente') return 'Aguardando atribuição de um técnico.';
    if (status === 'Em Andamento') return `Técnico ${os.tecnicoName || 'designado'} está trabalhando nesta OS.`;
    if (status === 'Concluída') return 'Esta OS foi resolvida e fechada.';
    return 'Status desconhecido.';
  };

  return (
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/${role?.toLowerCase()}/ordens-servico`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h2 className="text-xl font-bold tracking-tight">Voltar para lista</h2>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight">Detalhes da OS: {osId}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUNA DA ESQUERDA (O que está acontecendo) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. CARD DE STATUS */}
            <Card>
              <CardHeader>
                <CardTitle>Status Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center gap-4 p-4 rounded-lg ${
                  statusFormatado === 'Concluída' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' :
                  statusFormatado === 'Em Andamento' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200' :
                  'bg-destructive/5 dark:bg-destructive/20 border border-destructive/20'
                }`}>
                  <div className="flex-shrink-0">
                    {getStatusIcon(statusFormatado)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{statusFormatado}</h3>
                    <p className="text-muted-foreground">
                      {getStatusDescription(statusFormatado)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 2. CARD DE DESCRIÇÃO DO PROBLEMA */}
            <Card>
              <CardHeader><CardTitle>Descrição do Problema (Relato do Cliente)</CardTitle></CardHeader>
              <CardContent>
                <p className="text-lg italic text-muted-foreground">"{detalhesProblema}"</p>
                
                {/* Grid de Mídias */}
                {midiasProblema.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold mb-2">Mídias Anexadas:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {midiasProblema.map((url, index) => (
                        <a href={url} key={index} target="_blank" rel="noopener noreferrer">
                          <img
                            src={url}
                            alt={`Mídia ${index + 1}`}
                            className="rounded-lg object-cover w-full h-24 md:h-32 transition-transform hover:scale-105"
                          />
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 3. CARD DE LINHA DO TEMPO */}
            <Card>
              <CardHeader>
                <CardTitle>Linha do Tempo</CardTitle>
                <CardDescription>O que aconteceu com este chamado.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {timeline.length === 0 && (
                  <p className="text-muted-foreground text-center">Nenhum evento na linha do tempo.</p>
                )}
                {timeline.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${index === 0 ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-px h-full bg-border my-1" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{item.acao}</p>
                      <p className="text-sm text-muted-foreground">{item.data} - por {item.autor}</p>
                      
                      {/* Mídias Anexadas (CLIENTE) */}
                      {item.midias && item.midias.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {item.midias.map((url, idx) => (
                            <a href={url} key={idx} target="_blank" rel="noopener noreferrer">
                              <img 
                                src={url} 
                                alt={`Anexo ${idx+1}`} 
                                className="h-16 w-16 rounded-md object-cover transition-transform hover:scale-105"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                      
                      {/* --- 4. NOVO BLOCO: RESPOSTAS DO TÉCNICO --- */}
                      {item.respostasTecnico && item.respostasTecnico.length > 0 && (
                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-dashed">
                          {item.respostasTecnico.map((resp, idx) => (
                            <div key={idx} className="text-sm">
                              <p className="font-semibold">{resp.nome}</p>
                              <p className={`font-medium ${resp.estado ? 'text-green-600' : 'text-destructive'}`}>
                                {resp.estado ? "Status: OK" : "Status: Erro"}
                              </p>
                              <p className="italic text-muted-foreground">"{resp.observacao}"</p>
                              {resp.midia && (
                                <a href={resp.midia} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block">
                                  <img 
                                    src={resp.midia} 
                                    alt={`Evidência ${idx+1}`} 
                                    className="h-16 w-16 rounded-md object-cover transition-transform hover:scale-105"
                                  />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* --- FIM DO NOVO BLOCO --- */}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* COLUNA DA DIREITA (Informações e Aviso) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 4. CARD DE INFORMAÇÕES-CHAVE */}
            <Card>
              <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="text-xs">Equipamento</Label>
                    <p className="font-semibold">{os.modeloCompressor}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="text-xs">Cliente</Label>
                    <p className="font-semibold">{os.razaoSocial}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <HardHat className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="text-xs">Técnico Atribuído</Label>
                    <p className="font-semibold">{os.tecnicoName || "Nenhum (Pendente)"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="text-xs">Data de Abertura</Label>
                    <p className="font-semibold">{formatDateTime(os.horaAbertura) || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. CARD DE AVISO (Apenas para o Cliente) */}
            {role === 'Cliente' && (
              <Alert variant="default" className="shadow-md">
                <FileText className="h-5 w-5" />
                <AlertTitle>Status do Chamado</AlertTitle>
                <AlertDescription>
                  Esta página é para acompanhamento. Qualquer atualização do técnico aparecerá na Linha do Tempo.
                </AlertDescription>
              </Alert>
            )}
            
          </div>
        </div>
      </main>
  );
}