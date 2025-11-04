'use client';

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react"; // <-- Novos ícones para OK/Erro
import { Button } from "@/components/ui/button";

export function ChecklistItem({ label, id }: { label: string, id: string }) {
  const [status, setStatus] = useState<'ok' | 'erro' | null>(null);

  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 ${status === 'erro' ? 'border-destructive' : status === 'ok' ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : 'border-border'}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor={`radio-${id}`} className="font-semibold text-md">{label}</Label>
        <div className="flex justify-end">
          <Button 
            variant={status === 'ok' ? 'default' : 'outline'}
            className={`w-[100px] ${status === 'ok' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
            size="sm"
            onClick={() => setStatus('ok')}
          >
            <Check className="" />
            OK
          </Button>

          <Button 
            variant={status === 'erro' ? 'destructive' : 'outline'}
            className="w-[100px]"
            size="sm"
            onClick={() => setStatus('erro')}
          >
            <X className="h-4 w-4" /> Erro
          </Button>
        </div>
      </div>

      {/* Seção Condicional "Erro" */}
      {status === 'erro' && (
        <div className="mt-4 pt-4 border-t border-dashed space-y-3">
          <Label htmlFor={`obs-${id}`} className="text-sm">Descreva o problema e a solução aplicada:</Label>
          <Textarea id={`obs-${id}`} placeholder="Ex: Relé de fase queimado, foi substituído." className="mt-1" />
          <Label htmlFor={`file-${id}`} className="text-sm">Anexar evidência (foto/vídeo)</Label>
          <Input id={`file-${id}`} type="file" className="mt-1" />
        </div>
      )}
    </div>
  );
}