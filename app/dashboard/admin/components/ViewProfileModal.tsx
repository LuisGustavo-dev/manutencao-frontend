'use client';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Technician } from './AdminMockData';
import { HardHat, CheckCircle, Percent, Loader2 } from "lucide-react";

interface ViewProfileModalProps {
  tecnico: Technician;
  onClose: () => void;
}

export function ViewProfileModal({ tecnico, onClose }: ViewProfileModalProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10">{tecnico.avatar}</AvatarFallback>
          </Avatar>
          <div>
            <div>{tecnico.nome}</div>
            <DialogDescription>Perfil do Técnico</DialogDescription>
          </div>
        </DialogTitle>
      </DialogHeader>
      
      <div className="py-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Estatísticas de performance deste técnico no mês atual.
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-secondary rounded-lg">
            <Label className="text-xs">Concluídas</Label>
            <p className="text-2xl font-bold">{tecnico.concluidas}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <Label className="text-xs">Em Andamento</Label>
            <p className="text-2xl font-bold">{tecnico.emAndamento}</p>
          </div>
          <div className="p-3 bg-secondary rounded-lg">
            <Label className="text-xs">Taxa Sucesso</Label>
            <p className="text-2xl font-bold text-green-600">{tecnico.taxa}</p>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        <Button>Ver Relatório Completo</Button>
      </DialogFooter>
    </>
  );
}