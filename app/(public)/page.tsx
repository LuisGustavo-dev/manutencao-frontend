'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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
  Factory, 
  Cpu,
  Snowflake,
  Shield,          
  Layers,
  ZoomIn 
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; 

import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  type CarouselApi 
} from "@/components/ui/carousel";

import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";

export default function LandingPage() {
  const whatsappLink = "https://api.whatsapp.com/send?phone=5519971382628&text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20uma%20visita%20t%C3%A9cnica.";

  // --- DADOS DO PORTFÓLIO ---
  const portfolioItems = [
  { src: "/assets/carrosel1.jpg" },
  { src: "/assets/carrosel2.jpg" },
  { src: "/assets/carrosel3.jpg" },
  { src: "/assets/carrosel4.jpg" },
  { src: "/assets/carrosel5.jpg" },
  { src: "/assets/carrosel6.jpg" },
  { src: "/assets/carrosel7.jpg" },
  { src: "/assets/carrosel8.jpg" },
];

  // --- DADOS DOS CLIENTES ---
  const clientLogos = [
    { src: "/assets/brasa.png", alt: "Logo Cliente Brasa" },
    { src: "/assets/croissant.png", alt: "Logo Cliente Croissant & Cia" },
    { src: "/assets/sorvetao.png", alt: "Logo Cliente Sorvetão" },
    { src: "/assets/diso.jpeg", alt: "Logo Cliente Diso" },
    { src: "/assets/dellys.avif", alt: "Logo Cliente Dellys" },
    { src: "/assets/halipar.jpeg", alt: "Logo Cliente Halipar" },
    { src: "/assets/neves.jpeg", alt: "Logo Cliente Salgados Neves" },
    { src: "/assets/indaia_pescados.png", alt: "Logo Cliente Indaiá Pescados" },
    { src: "/assets/sabores_do_acai.jpeg", alt: "Logo Cliente Sabores do Açaí" },
    { src: "/assets/diskbreja.avif", alt: "Logo Cliente Disc Breja" },
    { src: "/assets/desanta.png", alt: "Logo Cliente D.Santa Logística" },
  ];

  // --- HOOKS PARA O CARROSSEL (Portfólio) ---
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
 
  useEffect(() => {
    if (!api) { return }
    setCount(api.scrollSnapList().length) 
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => { setCurrent(api.selectedScrollSnap()) })
    api.on("resize", () => { setCount(api.scrollSnapList().length) })
  }, [api])

  // --- HOOKS PARA O CARROSSEL (Clientes) ---
  const [clientApi, setClientApi] = useState<CarouselApi>()
  const [clientCurrent, setClientCurrent] = useState(0)
  const [clientCount, setClientCount] = useState(0)

  useEffect(() => {
    if (!clientApi) { return }
    setClientCount(clientApi.scrollSnapList().length) 
    setClientCurrent(clientApi.selectedScrollSnap())
    clientApi.on("select", () => { setClientCurrent(clientApi.selectedScrollSnap()) })
    clientApi.on("resize", () => { setClientCount(clientApi.scrollSnapList().length) })
  }, [clientApi]) // <-- Depende do clientApi

  // --- HOOK PARA O MODAL (Dialog) ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* --- Seção 1: Hero (Fundo Imersivo / Texto na Esquerda / Responsivo) --- */}
      <section className="w-full h-screen min-h-[700px] relative flex items-center">
        
        {/* Imagem de Fundo */}
        <div className="absolute inset-0 z-[-2]">
          <img
            src="/assets/compressores.jpg"
            alt="Compressores de refrigeração industrial em operação"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Overlay Escuro (Para Legibilidade) */}
        <div className="absolute inset-0 bg-black/60 z-[-1]"></div>
        
        {/* Conteúdo (Layout de Grid) */}
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            
            {/* Coluna 1: A Promessa (Texto na Esquerda) */}
            <div className="flex flex-col justify-center space-y-6 text-white items-center text-center lg:items-start lg:text-left">
              
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Engenharia de Frio que Gera Solução.
              </h1>
              
              <p className="max-w-[600px] text-lg text-gray-200">
                Na indústria, refrigeração parada é prejuízo na certa. 
                Nós garantimos que sua operação funcione, 
                protegendo seu produto e sua lucratividade. 
                Deixe o frio conosco e foque em produzir.
              </p>
              
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                
                <Button asChild>
                  <a 
                    href={whatsappLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Solicitar Vistoria Técnica
                  </a>
                </Button>
                
                <Button variant="secondary" asChild>
                  <Link href="#pilares">Conheça nosso Método</Link>
                </Button>
              </div>
            </div>
            
            {/* Coluna 2: Vazia (Para mostrar a imagem à direita) */}
            <div className="hidden lg:block"> {/* Esta coluna é oculta em telas pequenas */}
              {/* Este espaço fica vazio para o texto ficar à esquerda */}
            </div>

          </div>
        </div>
      </section>

      {/* --- SEÇÃO 2: PORTFÓLIO (CARROSSEL ATUALIZADO) --- */}
      <section id="portfolio" className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge>Obras Realizadas</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Nosso Portfólio Industrial
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Veja na prática o que nossa engenharia pode fazer pelo seu negócio.
            </p>
          </div>
          
          <Carousel 
            setApi={setApi}
            className="w-full max-w-6xl mx-auto"
            opts={{
              loop: true,
              align: "start",
            }}
          >
            <CarouselContent>
              {portfolioItems.map((item, index) => (
                <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3"> 
                  <div className="p-2">
                    <Card 
                      className="overflow-hidden select-none rounded-xl group relative cursor-pointer"
                      onClick={() => setSelectedImage(item.src)}
                    >
                      <img
                        src={item.src}
                        alt={index + 1 + "ª Obra Realizada"}
                        width={600}
                        height={450}
                        className="object-cover w-full h-80 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                        <ZoomIn className="h-10 w-10 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    current === index ? 'w-4 bg-primary' : 'bg-muted-foreground/50'
                  }`}
                  aria-label={`Ir para o slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
          
          <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
            <DialogContent className="max-w-5xl w-auto p-2 border-0 bg-transparent shadow-none">
              <img 
                src={selectedImage || ''} 
                alt="Obra Realizada" 
                className="max-h-[90vh] max-w-full w-auto h-auto object-contain rounded-lg"
              />
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* --- Seção 3: Pilares (ATUALIZADA COM BG-PRIMARY) --- */}
      <section id="pilares" className="w-full py-20 md:py-32 bg-primary"> 
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            
            <Badge variant="secondary">Nossa Especialidade</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-primary-foreground">
              Projetamos para Durar, Cuidamos para Não Parar.
            </h2>
            <p className="max-w-[900px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Oferecemos a solução completa: equipamentos robustos feitos sob medida para sua indústria e o serviço de manutenção mais transparente do mercado.
            </p>
          </div>
          
          <div className="mx-auto grid max-w-6xl items-stretch gap-y-12 gap-x-8 md:grid-cols-2">

            <Card className="flex flex-col p-6"> 
              <h3 className="text-2xl font-semibold text-center text-primary flex items-center justify-center gap-2 mb-6">
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
            </Card>

            <Card className="flex flex-col p-6"> 
              <h3 className="text-2xl font-semibold text-center text-green-700 dark:text-green-400 flex items-center justify-center gap-2 mb-6">
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
            </Card>

          </div>
        </div>
      </section>

      {/* --- Seção 4: Números (Layout 3 + 2 com 5 estatísticas) --- */}
      <section id="numeros" className="w-full py-20 md:py-24 bg-white dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Resultados que constroem confiança
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Nossos números comprovam o compromisso com a sua operação.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-5xl mx-auto">
            
            <div className="flex flex-col items-center text-center p-6">
              <span className="text-6xl font-bold text-primary mb-2">
                +15
              </span>
              <p className="text-lg text-muted-foreground">
                anos de experiência
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <span className="text-6xl font-bold text-primary mb-2">
                +100
              </span>
              <p className="text-lg text-muted-foreground">
                clientes atendidos
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <span className="text-6xl font-bold text-primary mb-2">
                +300
              </span>
              <p className="text-lg text-muted-foreground">
                projetos entregues
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <span className="text-6xl font-bold text-primary mb-2">
                +50
              </span>
              <p className="text-lg text-muted-foreground">
                contratos de manutenção
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <span className="text-6xl font-bold text-primary mb-2">
                +500
              </span>
              <p className="text-lg text-muted-foreground">
                equipamentos sob gestão
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* --- Seção 5: Clientes (COM CARROSSEL SHADCN) --- */}
      <section id="clientes-parceiros" className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <Badge>Quem Confia</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Grandes indústrias que confiam em nosso trabalho
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Construímos parcerias de longo prazo com empresas que não podem parar.
            </p>
          </div>

          <Carousel 
            setApi={setClientApi} 
            className="w-full max-w-6xl mx-auto"
            opts={{
              loop: true,
              align: "start",
            }}
          >
            <CarouselContent className="-ml-4 select-none">
              {clientLogos.map((logo, index) => (
                <CarouselItem key={index} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"> 
                  <div className="p-4 flex items-center justify-center h-28" title={logo.alt}>
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      width={140}
                      height={70}
                      className="object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: clientCount }).map((_, index) => ( 
                <button
                  key={index}
                  onClick={() => clientApi?.scrollTo(index)} 
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    clientCurrent === index ? 'w-4 bg-primary' : 'bg-muted-foreground/50' 
                  }`}
                  aria-label={`Ir para o slide de clientes ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </section>

      {/* --- Seção 6: Serviços (COM FUNDO BG-PRIMARY) --- */}
      <section id="servicos" className="w-full py-20 md:py-32 bg-primary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge variant="secondary">Nossas Soluções</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-primary-foreground">
              Do Projeto à Manutenção Contínua
            </h2>
            <p className="max-w-[900px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Atendemos equipamentos de todas as marcas, sejam eles fornecidos por nós ou não, cobrindo todo o ciclo de vida do seu sistema de frio.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl items-stretch gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Factory className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Projetos Especiais de Engenharia</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Desenvolvemos projetos de refrigeração industrial do zero, focados em eficiência energética e performance para a sua necessidade específica.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Isolamento Térmico e Montagem</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Montagem de painéis isotérmicos, portas frigoríficas e todo o isolamento necessário para garantir a eficiência da sua câmara fria ou túnel.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <Snowflake className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Máquinas de Gelo e Girofreezers</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Fornecimento e instalação de máquinas de gelo (em escamas, cubos) de alta capacidade e sistemas de congelamento rápido (Girofreezers).
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Manutenção Corretiva</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Atendimento emergencial com tempo de resposta garantido para toda sua planta de refrigeração.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Manutenção Preventiva</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>
                  Contratos de manutenção preventiva (análise de vibração, óleo) para reduzir o downtime inesperado.
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
                  Implementamos nosso sistema de etiquetagem por QR Code em todo o seu parque de máquinas, mesmo em equipamentos antigos ou de terceiros.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --- Seção 7: Equipe e Normas --- */}
      <section id="equipe-normas" className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge>Qualidade e Segurança</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Equipe Qualificada e Compromisso com Normas
            </h2>
          </div>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <img
                src="/assets/frota.jpg" 
                alt="Frota de veículos e equipe técnica"
                width={600}
                height={350}
                className="rounded-xl shadow-lg object-cover"
              />
            <div className="space-y-6">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" /> Segurança em Primeiro Lugar
                </h3>
                <p className="text-muted-foreground">
                  A segurança da sua equipe e da nossa é inegociável. Todos os nossos projetos e 
                  serviços seguem rigorosamente as Normas Regulamentadoras:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold">NR-10 (Eletricidade)</h4>
                      <p className="text-sm text-muted-foreground">Equipe certificada para serviços em instalações elétricas.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold">NR-18 (Construção Civil)</h4>
                      <p className="text-sm text-muted-foreground">Procedimentos seguros para montagem e instalações.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold">NR-35 (Trabalho em Altura)</h4>
                      <p className="text-sm text-muted-foreground">Qualificação para instalação de evaporadores e tubulações.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold">NR-13 (Vasos de Pressão)</h4>
                      <p className="text-sm text-muted-foreground">Gestão e manutenção de compressores e vasos de amônia/fluidos.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Seção 8: Depoimentos --- */}
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
                  <p className="text-sm text-muted-foreground">Gerente de Produção</p>
                </div>
              </CardFooter>
            </Card>
            <Card className="flex flex-col">
              <CardContent className="p-6 flex-1">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-xl italic">
                  "O plano de manutenção preventiva da MGR Refrigeração é cirúrgico. Eles monitoram nossos compressores e agendam as paradas. Não tivemos mais quebras inesperadas em túneis de congelamento."
                </p>
              </CardContent>
              <CardFooter className="p-6 border-t flex items-center gap-4">
                <Avatar><AvatarFallback>MF</AvatarFallback></Avatar>
                <div>
                  <p className="font-semibold">Mariana Ferraz</p>
                  <p className="text-sm text-muted-foreground">Diretora de Operações</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 9: CONTATO (Localização Correta) --- */}
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
              <a 
                href={whatsappLink}
                target="_blank" 
                rel="noopener noreferrer"
              >
                Solicitar Visita Técnica
              </a>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}