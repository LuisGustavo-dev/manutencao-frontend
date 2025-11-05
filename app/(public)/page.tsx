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
  Factory, 
  Package, 
  Cpu,
  Snowflake // <-- NOVO: Ícone de Refrigeração
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; 

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* --- Seção 1: Hero (Foco na Produção) --- */}
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            
            {/* Coluna Esquerda: A Promessa */}
            <div className="flex flex-col justify-center space-y-6">
              
              {/* --- TÍTULO ATUALIZADO --- */}
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Refrigeração Industrial que Não Para a sua Produção.
              </h1>
              
              {/* --- PARÁGRAFO ATUALIZADO (SEM ** e com texto mais claro) --- */}
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Nós <span className="font-bold text-primary">projetamos e instalamos</span> seu sistema de frio (Túneis de Congelamento, Câmaras Frias) e o <span className="font-bold text-primary">mantemos funcionando</span> com a tecnologia de gestão mais avançada do mercado. Menos downtime, mais lucratividade.
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
              <img
                src="/assets/imagem1.jpg" // Use o caminho para a imagem que você gerou
                alt="Técnico profissional realizando manutenção em um túnel de congelamento industrial"
                width={600} 
                height={400} 
                className="rounded-xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Seção 2: Nossos Pilares (Vendas + Serviços) --- */}
      <section id="pilares" className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <Badge>Nossa Especialidade</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Projetamos para Durar, Cuidamos para Não Parar.
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Oferecemos a solução completa: equipamentos robustos feitos sob medida para sua indústria e o serviço de manutenção mais transparente do mercado.
            </p>
          </div>
          
          <div className="mx-auto grid max-w-6xl items-stretch gap-y-12 gap-x-8 md:grid-cols-2">

            {/* Coluna 1: Venda de Equipamentos */}
            <div className="space-y-6 p-6 rounded-lg bg-secondary/30 border-2 border-primary border-dashed">
              <h3 className="text-2xl font-semibold text-center text-primary flex items-center justify-center gap-2">
                <Warehouse className="h-6 w-6" /> Venda e Instalação
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Snowflake className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Projetos Sob Medida</h4>
                    <p className="text-muted-foreground">Desenhamos a solução exata para sua demanda: Túneis de Congelamento, Câmaras Frias, Girofreezers e Máquinas de Gelo industriais.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Factory className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Equipamentos de Ponta</h4>
                    <p className="text-muted-foreground">Trabalhamos apenas com componentes de alta performance, garantindo eficiência energética e durabilidade para sua operação.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Cpu className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Instalação e Climatização (HVAC)</h4>
                    <p className="text-muted-foreground">Nossa equipe de engenharia instala e comissiona todo o sistema, incluindo projetos de climatização industrial.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: Serviços de Manutenção (com QR Code) */}
            <div className="space-y-6 p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-500 border-dashed">
              <h3 className="text-2xl font-semibold text-center text-green-700 dark:text-green-400 flex items-center justify-center gap-2">
                <HardHat className="h-6 w-6" /> Contratos de Manutenção
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <QrCode className="h-8 w-8 text-green-700 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Abertura de Chamado por QR Code</h4>
                    <p className="text-muted-foreground">Nossos equipamentos (e os seus já existentes) recebem uma etiqueta. Escaneie e abra uma OS corretiva em 30 segundos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <History className="h-8 w-8 text-green-700 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Técnico com Histórico Completo</h4>
                    <p className="text-muted-foreground">Nosso técnico escaneia o código e vê o histórico completo de reparos, peças, gás e óleo daquela máquina no celular.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ClipboardCheck className="h-8 w-8 text-green-700 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Checklists Digitais e Portal do Cliente</h4>
                    <p className="text-muted-foreground">Acesse seu portal online e veja o laudo técnico digital, com fotos e status. Transparência total para sua auditoria.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- Seção 3: Nossos Serviços (Refinada) --- */}
      <section id="servicos" className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge>Nossos Serviços</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Focados em Performance Industrial
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Atendemos equipamentos de todas as marcas, sejam eles fornecidos por nós ou não.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Manutenção Corretiva 24h</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Atendimento emergencial com tempo de resposta garantido (SLA) para toda sua planta de refrigeração.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Manutenção Preventiva Preditiva</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Contratos de manutenção preventiva e preditiva (análise de vibração, óleo) para reduzir o *downtime* inesperado.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Scan className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sistema de Gestão (QR Code)</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Implementamos nosso sistema de etiquetagem por QR Code em **todo o seu parque de máquinas**, mesmo em equipamentos antigos ou de terceiros.
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
            <Card className="flex flex-col">
              <CardContent className="p-6 flex-1">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-xl italic">
                  "O sistema de QR Code mudou nosso chão de fábrica. O operador de máquina agora abre o chamado na hora, e eu (gestor) acompanho o status pelo portal. A rastreabilidade para auditorias melhorou 100%."
                </p>
              </CardContent>
              <CardFooter className="p-6 border-t flex items-center gap-4">
                <Avatar><AvatarFallback>RC</AvatarFallback></Avatar>
                <div>
                  <p className="font-semibold">Roberto Carlos</p>
                  <p className="text-sm text-muted-foreground">Gerente de Produção, Indústria Alimentícia ABC</p>
                </div>
              </CardFooter>
            </Card>
            <Card className="flex flex-col">
              <CardContent className="p-6 flex-1">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-xl italic">
                  "O plano de manutenção preventiva da [GrandTech] é cirúrgico. Eles monitoram nossos compressores e agendam as paradas. Não tivemos mais quebras inesperadas em túneis de congelamento."
                </p>
              </CardContent>
              <CardFooter className="p-6 border-t flex items-center gap-4">
                <Avatar><AvatarFallback>MF</AvatarFallback></Avatar>
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
              Seja para um novo projeto de câmara fria ou para um contrato de manutenção completo, fale com nossos especialistas.
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