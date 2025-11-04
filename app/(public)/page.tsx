'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  ClipboardCheck, 
  History,
  Warehouse,    
  HardHat,      
  Scan,         
  AlertTriangle,
  CheckCircle,
  Quote,
  Clock, 
  UserX, 
  FileX,
  Factory, // <-- NOVO: Ícone de Indústria
  Package, // <-- NOVO: Ícone de Logística
  Cpu      // <-- NOVO: Ícone de Tecnologia
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; 
import Image from 'next/image'; // <-- IMPORTADO

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* --- Seção 1: Hero (Foco na Produção) --- */}
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            
            {/* Coluna Esquerda: A Promessa */}
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Seu túnel de congelamento parou. A produção inteira parou.
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Não arrisque seu *downtime* com chamados perdidos e diagnósticos lentos. Oferecemos manutenção industrial especializada para equipamentos de refrigeração pesada, garantindo a continuidade da sua operação com tecnologia de ponta.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild className="text-lg">
                  <Link href="#contato">Solicitar Vistoria Técnica</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg">
                  <Link href="#solucao">Conheça nosso Método</Link>
                </Button>
              </div>
            </div>
            
            {/* Coluna Direita: O Visual */}
            <div className="flex items-center justify-center">
              {/* Esta é a imagem que geramos */}
              <img
                src="/assets/imagem1.jpg" // <-- Use o caminho para a imagem que você gerou
                alt="Técnico profissional realizando manutenção em um túnel de congelamento industrial"
                width={600} 
                height={400} 
                className="rounded-xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Seção 2: O Problema vs. A Solução (Foco Industrial) --- */}
      <section id="solucao" className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <Badge>Nosso Diferencial</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Manutenção Reativa vs. Gestão Preditiva
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              No seu nível de operação, "consertar" não é o bastante. É preciso ter rastreabilidade, dados e transparência.
            </p>
          </div>
          
          <div className="mx-auto grid max-w-6xl items-stretch gap-y-12 gap-x-8 md:grid-cols-2">

            {/* Coluna 1: O Jeito Antigo (Problema) */}
            <div className="space-y-6 p-6 rounded-lg bg-secondary/30 border border-dashed">
              <h3 className="text-2xl font-semibold text-center text-destructive">O Serviço Comum</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Clock className="h-8 w-8 text-destructive flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Chamado "Black Box"</h4>
                    <p className="text-muted-foreground">Você liga para o gerente de manutenção e espera. A OS é aberta em uma planilha (ou nem isso). Você não tem visibilidade do processo.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <UserX className="h-8 w-8 text-destructive flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Diagnóstico "do Zero"</h4>
                    <p className="text-muted-foreground">O técnico chega sem o histórico do equipamento. O tempo de diagnóstico aumenta, e o risco de troca de peças erradas é real.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FileX className="h-8 w-8 text-destructive flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Sem Rastreabilidade (Compliance Risco)</h4>
                    <p className="text-muted-foreground">Você não possui um histórico digital de manutenções por ativo, dificultando auditorias e a conformidade com normas (ex: ISO, MAPA).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: O Jeito GrandTech (Solução) */}
            <div className="space-y-6 p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-500">
              <h3 className="text-2xl font-semibold text-center text-green-700 dark:text-green-400">Nosso Método (Baseado em Dados)</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <QrCode className="h-8 w-8 text-green-700 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Abertura de Chamado por Ativo (QR Code)</h4>
                    <p className="text-muted-foreground">O seu operador escaneia a etiqueta no equipamento. Nossa plataforma abre a OS vinculada ao ativo correto instantaneamente.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <History className="h-8 w-8 text-green-700 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Técnico com Dados em Campo</h4>
                    <p className="text-muted-foreground">Nosso técnico escaneia o QR Code e acessa o histórico completo: checklists anteriores, trocas de peças, tipo de gás e óleo.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ClipboardCheck className="h-8 w-8 text-green-700 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Checklists Digitais e Portal do Cliente</h4>
                    <p className="text-muted-foreground">Acesse seu portal e veja o laudo técnico digital, com fotos e status de cada item verificado. Dados prontos para sua auditoria.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- Seção 3: Nossos Serviços (Foco Industrial) --- */}
      <section id="servicos" className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge>Nossos Serviços</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Especialistas em Refrigeração Industrial
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Planos de manutenção desenhados para a indústria, focados na redução do *downtime*.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            
            {/* Serviço 1 */}
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Contratos de Manutenção Corretiva</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Atendimento emergencial com tempo de resposta garantido (SLA). Nossa equipe chega ao local sabendo o histórico do equipamento para um diagnóstico rápido e preciso.
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Serviço 2 */}
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Manutenção Preventiva e Preditiva</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Agendamento de vistorias, análise de óleo e vibração, e trocas programadas de componentes. Tudo gerenciado e documentado em nossa plataforma.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Serviço 3 */}
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Warehouse className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Instalação e Projetos Especiais</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Projetamos e executamos a instalação de Câmaras Frias, Túneis de Congelamento e sistemas de Climatização (HVAC) industriais de alta performance.
                </CardDescription>
              </CardContent>
            </Card>
            
          </div>
        </div>
      </section>

      {/* --- Seção 4: Depoimentos (Prova Social Industrial) --- */}
      <section id="testimonials" className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge>Quem Confia</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Parceiros que não podem parar
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Depoimento 1 */}
            <Card className="flex flex-col">
              <CardContent className="p-6 flex-1">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-xl italic">
                  "O sistema de QR Code mudou nosso chão de fábrica. O operador de máquina agora abre o chamado na hora, e eu (gestor) acompanho o status pelo portal. A rastreabilidade para auditorias melhorou 100%."
                </p>
              </CardContent>
              <CardFooter className="p-6 border-t flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>RC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Roberto Carlos</p>
                  <p className="text-sm text-muted-foreground">Gerente de Produção, Indústria Alimentícia ABC</p>
                </div>
              </CardFooter>
            </Card>
            {/* Depoimento 2 */}
            <Card className="flex flex-col">
              <CardContent className="p-6 flex-1">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-xl italic">
                  "O plano de manutenção preventiva da [GrandTech] é cirúrgico. Eles monitoram nossos compressores e agendam as paradas. Não tivemos mais quebras inesperadas em túneis de congelamento, o que era nosso maior gargalo."
                </p>
              </CardContent>
              <CardFooter className="p-6 border-t flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>MF</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Mariana Ferraz</p>
                  <p className="text-sm text-muted-foreground">Diretora de Operações, Logística Fria XYZ</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* --- Seção 5: CTA Final --- */}
      <section id="contato" className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center bg-primary text-primary-foreground p-10 md:p-16 rounded-xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Sua produção não pode esperar.
            </h2>
            <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Entre em contato agora e agende uma vistoria técnica. Descubra como nosso plano de manutenção pode proteger sua linha de produção.
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg">
              <Link href="/login">Solicitar Orçamento</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}