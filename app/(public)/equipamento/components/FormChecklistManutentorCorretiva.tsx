'use client';

import { Button } from "@/components/ui/button";
import { 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HardHat, FileText, Zap, Gauge } from "lucide-react"; // <-- Novos ícones para abas e título
import { ChecklistItem } from "./ChecklistItem";

// Formulário do MANUTENTOR (Corretiva) ATUALIZADO com TABS
export function FormChecklistManutentorCorretiva({ onSubmit }: { onSubmit: () => void }) {
  return (
    <>
      <DialogHeader> 
        <DialogTitle className="flex items-center gap-2 text-2xl"> 
          <HardHat className="h-6 w-6 text-primary" /> Realizar Manutenção Corretiva
        </DialogTitle>
        <DialogDescription>
          Preencha o checklist para dar baixa nesta OS. Navegue pelas abas.
        </DialogDescription>
      </DialogHeader>

      {/* Sistema de Abas para desmembrar o formulário */}
      <Tabs defaultValue="painel-eletrico" className="w-full py-4">
        {/* Lista de Abas com Ícones */}
        <TabsList className="grid w-full grid-cols-3 h-12"> {/* <-- Altura maior para as abas */}
          <TabsTrigger value="painel-eletrico" className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5" /> Painel Elétrico
          </TabsTrigger>
          <TabsTrigger value="compressor" className="flex items-center gap-2 text-base">
            <Gauge className="h-5 w-5" /> Compressor
          </TabsTrigger>
          <TabsTrigger value="resumo" className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" /> Resumo
          </TabsTrigger>
        </TabsList>
        
        {/* Aba 1: Painel Elétrico */}
        <TabsContent value="painel-eletrico">
          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto pr-2"> {/* <-- Espaçamento e scroll */}
            <ChecklistItem id="m-tensao" label="Verificar Tensão" />
            <ChecklistItem id="m-disjuntores" label="Verificar Disjuntores" />
            <ChecklistItem id="m-rele" label="Checar Relé de falta de fase" />
            <ChecklistItem id="m-alarme" label="Checar alarmes na Soft ou Inversor" />
          </div>
        </TabsContent>
        
        {/* Aba 2: Compressor */}
        <TabsContent value="compressor">
          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto pr-2"> {/* <-- Espaçamento e scroll */}
            <ChecklistItem id="m-oleo" label="Verificar Nível de Óleo" />
            <ChecklistItem id="m-press-oleo" label="Checar Pressostato de Óleo" />
            <ChecklistItem id="m-press-alta" label="Checar Pressostato de Alta Pressão" />
            <ChecklistItem id="m-temp" label="Medir Temperatura do Compressor" />
            <ChecklistItem id="m-gas" label="Verificar Nível de Gás" />
          </div>
        </TabsContent>

        {/* Aba 3: Resumo */}
        <TabsContent value="resumo">
          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto pr-2"> {/* <-- Espaçamento e scroll */}
            <div className="space-y-2">
              <Label htmlFor="txt-obs-final" className="font-semibold text-base">Resumo Geral do Serviço</Label>
              <Textarea id="txt-obs-final" placeholder="Descreva o serviço final realizado, peças totais trocadas, e o status final do equipamento." rows={8} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="pt-4"> {/* <-- Padding no rodapé */}
        <Button variant="outline" type="button">Cancelar</Button>
        <Button onClick={onSubmit}>Concluir Manutenção</Button>
      </DialogFooter>
    </>
  );
}