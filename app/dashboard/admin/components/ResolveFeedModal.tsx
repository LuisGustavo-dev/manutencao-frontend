'use client';
import { useState } from 'react';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeedItem, technicianData } from './AdminMockData';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface ResolveFeedModalProps {
  item: FeedItem;
  onClose: () => void;
}

export function ResolveFeedModal({ item, onClose }: ResolveFeedModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Lógica de Ação (exemplo: se for OS, mostra técnicos)
  const isOsTask = item.tipo.includes('OS');
  
  const handleResolve = () => {
    setIsLoading(true);
    // Simula API
    setTimeout(() => {
      toast.success(`Item "${item.tipo}" resolvido!`);
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Resolver Pendência</DialogTitle>
        <DialogDescription>
          Você está resolvendo o item: <span className="font-semibold">{item.descricao}</span>
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4">
        {isOsTask ? (
          // Se for uma OS, a ação é "Atribuir"
          <div className="space-y-2">
            <Label htmlFor="tecnico">Atribuir a um Técnico</Label>
            <Select>
              <SelectTrigger id="tecnico">
                <SelectValue placeholder="Selecione um técnico" />
              </SelectTrigger>
              <SelectContent>
                {technicianData.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.nome} ({tech.emAndamento} OS ativas)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          // Para outros itens, a ação é "Marcar como Visto"
          <p className="text-sm text-muted-foreground">
            A ação padrão para este item é marcá-lo como "visto" ou "resolvido".
          </p>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleResolve} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isOsTask ? "Atribuir OS" : "Marcar como Resolvido"}
        </Button>
      </DialogFooter>
    </>
  );
}