'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// Importa todos os mocks
import { mockOrdensServico, mockEquipamentos, mockTecnicos } from '@/lib/mock-data';
// Importa o hook de auth que criamos
import { useAuth } from '@/app/contexts/authContext'; 

import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  QrCode, 
  Loader, 
  AlertTriangle, 
  CheckCircle,
  Package,
  User,
  Clock,
  History,
  FileText,
  HardHat, // (Ícone do Técnico)
  ArrowLeft
} from 'lucide-react';

// --- MOCK DO HISTÓRICO (para demonstração) ---
// (Em um app real, isso viria do banco de dados)
const mockHistorico = [
  { 
    id: 1, 
    data: "04/11/2025 10:00", 
    autor: "Cliente A (Padaria)", 
    acao: "Ordem de serviço criada via QR Code." 
  },
  { 
    id: 2, 
    data: "04/11/2025 10:15", 
    autor: "Admin", 
    acao: "OS atribuída a Luis Gustavo." 
  },
  { 
    id: 3, 
    data: "04/11/2025 14:30", 
    autor: "Luis Gustavo", 
    acao: "Manutenção iniciada em campo (via QR Code)." 
  },
  { 
    id: 4, 
    data: "04/11/2025 15:15", 
    autor: "Luis Gustavo", 
    acao: "Checklist 'Painel Elétrico' concluído com 1 erro (Relé de fase)." 
  },
];
// --- FIM DO MOCK ---

// Wrapper de Suspense (Obrigatório para useSearchParams)
export default function DetalheOSWrapper() {
  return (
    <Suspense fallback={<div>Carregando Ordem de Serviço...</div>}>
      <DetalheOSPage />
    </Suspense>
  );
}

function DetalheOSPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useAuth(); // <-- Usa o hook de auth principal
  const id = searchParams.get('id');

  // Encontra a OS e enriquece os dados
  const [os, setOs] = useState(() => mockOrdensServico.find(o => o.id === id));
  const equipamento = os ? mockEquipamentos.find(e => e.id === os.equipamentoId) : null;
  const tecnico = os ? mockTecnicos.find(t => t.id === os.tecnicoId) : null;
  
  if (!os || !equipamento) {
    return <div>Ordem de serviço não encontrada.</div>
  }

  // --- Helpers Visuais ---
  const getStatusIcon = (status: string) => {
    if (status === 'Pendente') return <AlertTriangle className="h-8 w-8 text-destructive" />;
    if (status === 'Em Andamento') return <Loader className="h-8 w-8 text-blue-500 animate-spin" />;
    if (status === 'Concluída') return <CheckCircle className="h-8 w-8 text-green-600" />;
    return <AlertTriangle className="h-8 w-8" />;
  };

  const getStatusDescription = (status: string) => {
    if (status === 'Pendente') return 'Aguardando atribuição de um técnico.';
    if (status === 'Em Andamento') return `Técnico ${tecnico?.nome || 'designado'} está trabalhando nesta OS.`;
    if (status === 'Concluída') return 'Esta OS foi resolvida e fechada.';
    return 'Status desconhecido.';
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon">
          <Link href="/dashboard/admin/ordens-servico">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-xl font-bold tracking-tight">Voltar para lista</h2>
      </div>
      <h2 className="text-3xl font-bold tracking-tight">Detalhes da OS: {os.id} ({os.tipo})</h2>

      {/* --- LAYOUT REDESENHADO --- */}
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
                os.status === 'Concluída' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' :
                os.status === 'Em Andamento' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200' :
                'bg-destructive/5 dark:bg-destructive/20 border border-destructive/20'
              }`}>
                <div className="flex-shrink-0">
                  {getStatusIcon(os.status)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{os.status}</h3>
                  <p className="text-muted-foreground">
                    {getStatusDescription(os.status)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 2. CARD DE DESCRIÇÃO DO PROBLEMA */}
          <Card>
            <CardHeader><CardTitle>Descrição do Problema / Serviço</CardTitle></CardHeader>
            <CardContent>
              <p className="text-lg italic text-muted-foreground">"{os.detalhes}"</p>
            </CardContent>
          </Card>

          {/* 3. CARD DE LINHA DO TEMPO */}
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo</CardTitle>
              <CardDescription>O que aconteceu com este chamado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockHistorico.map((item, index) => (
                <div key={item.id} className="flex gap-3">
                  {/* O Ícone e a Linha Vertical */}
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${index === 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      <History className="h-4 w-4" />
                    </div>
                    {/* Renderiza a linha se não for o último item */}
                    {index < mockHistorico.length - 1 && (
                      <div className="w-px h-full bg-border my-1" />
                    )}
                  </div>
                  {/* O Texto */}
                  <div>
                    <p className="font-semibold">{item.acao}</p>
                    <p className="text-sm text-muted-foreground">{item.data} - por {item.autor}</p>
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
                  <p className="font-semibold">{equipamento.nome}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <Label className="text-xs">Cliente</Label>
                  <p className="font-semibold">{os.clienteNome}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <HardHat className="h-5 w-5 text-primary" />
                <div>
                  <Label className="text-xs">Técnico Atribuído</Label>
                  <p className="font-semibold">{tecnico?.nome || "Nenhum (Pendente)"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <Label className="text-xs">Data de Abertura</Label>
                  <p className="font-semibold">{os.dataAbertura}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. CARD DE AVISO (Seu Requisito) */}
          {(role === 'Manutentor' || role === 'Admin') && (
            <Alert variant="default" className="shadow-md">
              <QrCode className="h-5 w-5" />
              <AlertTitle>Modo de Acompanhamento</AlertTitle>
              <AlertDescription>
                Esta é uma visualização de acompanhamento. Para executar ou alterar esta OS, por favor, escaneie o QR Code no equipamento.
              </AlertDescription>
            </Alert>
          )}

          {/* Aviso para o Cliente */}
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
    </div>
  );
}