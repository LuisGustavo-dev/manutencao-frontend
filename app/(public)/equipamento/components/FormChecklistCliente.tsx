'use client';

import { Button } from "@/components/ui/button";
import { 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Camera, Edit3 } from "lucide-react"; // <-- Novos ícones

// Formulário do CLIENTE (Checklist Curto)
export function FormChecklistCliente({ onSubmit }: { onSubmit: () => void }) {
  return (
    <>
      <DialogHeader className="pb-4"> {/* <-- Adicionado padding */}
        <DialogTitle className="flex items-center gap-2 text-2xl"> {/* <-- Ícone no título */}
          <AlertCircle className="h-6 w-6 text-destructive" /> Solicitar Manutenção Corretiva
        </DialogTitle>
        <DialogDescription>
          Por favor, verifique os itens abaixo e descreva o problema.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 py-4"> {/* <-- Espaçamento maior */}
        <div className="p-4 bg-secondary/20 rounded-lg space-y-3"> {/* <-- Seção com fundo sutil */}
          <h4 className="font-semibold text-lg flex items-center gap-2"> {/* <-- Ícone no subtítulo */}
            <Edit3 className="h-5 w-5 text-primary" /> Checklist Inicial
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* <-- Layout em grid */}
            <div className="flex items-center space-x-2">
              <Checkbox id="chk-energia" />
              <Label htmlFor="chk-energia">Houve pico/oscilação de energia?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="chk-porta" />
              <Label htmlFor="chk-porta">A porta foi deixada aberta?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="chk-evaporador" />
              <Label htmlFor="chk-evaporador">O evaporador está ligado?</Label>
            </div>
          </div>
        </div>

        <Separator /> {/* <-- Separador entre seções */}

        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" /> Detalhes do Problema
          </h4>
          <div className="space-y-2">
            <Label htmlFor="txt-problema">Descreva o problema (ou código de erro)</Label>
            <Textarea id="txt-problema" placeholder="Ex: Equipamento não está gelando, fazendo barulho estranho..." rows={4} /> {/* <-- Mais linhas */}
          </div>
          <div className="space-y-2">
            <Label htmlFor="txt-foto" className="flex items-center gap-2"> {/* <-- Ícone na label */}
              <Camera className="h-4 w-4" /> Enviar foto ou vídeo (opcional)
            </Label>
            <Input id="txt-foto" type="file" />
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4"> {/* <-- Padding no rodapé */}
        <Button variant="outline" type="button">Cancelar</Button>
        <Button onClick={onSubmit} variant="destructive">Confirmar Chamado</Button>
      </DialogFooter>
    </>
  );
}