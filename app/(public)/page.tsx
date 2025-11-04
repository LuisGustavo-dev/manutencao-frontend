'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { QrCode, ClipboardCheck, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Adicionando o import que faltou

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100vh]">
      {/* Seção 1: Hero */}
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24">
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Gerencie sua Manutenção de Frio com Inteligência
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Da abertura do chamado via QR Code à gestão completa do seu inventário de climatização. Tudo em um só lugar.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/login">Acessar Painel</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Saber Mais</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              {/* Você pode substituir isso por uma imagem real do seu app */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-2xl p-8">
                <QrCode className="h-40 w-40 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 2: Recursos */}
      <section id="features" className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <Badge>Recursos</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Tudo que você precisa para uma gestão eficiente
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Foco no que importa: reduzir o tempo de parada do equipamento e organizar seus checklists.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">Chamados via QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Seu cliente escaneia o código no equipamento e abre uma solicitação corretiva na hora, já identificando o ativo.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">Checklists Digitais</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Padronize suas manutenções preventivas e corretivas com checklists detalhados para o técnico em campo.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">Inventário e Histórico</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tenha um cadastro completo de cada equipamento (gás, óleo, compressor) e acesse todo o histórico de manutenções.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seção 3: Como Funciona */}
      <section id="how-it-works" className="w-full py-20 md:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Um fluxo de trabalho simples e poderoso
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Dois perfis, um objetivo: equipamento funcionando.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-10">
            <div className="flex flex-col items-center gap-4 p-6 rounded-lg">
              <div className="p-4 rounded-full bg-primary text-primary-foreground">
                <span className="text-2xl font-bold">1. Cliente</span>
              </div>
              <h3 className="text-xl font-bold">Solicita</h3>
              <p className="text-muted-foreground">
                Equipamento parou? Cliente escaneia o QR Code, preenche o checklist inicial (porta aberta, pico de energia) e envia.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-lg">
              <div className="p-4 rounded-full bg-secondary text-secondary-foreground">
                <span className="text-2xl font-bold">2. Manutentor</span>
              </div>
              <h3 className="text-xl font-bold">Executa</h3>
              <p className="text-muted-foreground">
                Técnico recebe a OS, vai a campo, executa o checklist (nível de gás, tensão) e marca a OS como concluída.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}