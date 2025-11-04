'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { EnrichedOS } from '../page';
import { Tecnico } from '@/lib/mock-data';
import toast from 'react-hot-toast';

interface AssignTechnicianModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  os: EnrichedOS | null;
  tecnicos: Tecnico[];
  onSubmit: (tecnicoId: string) => void;
}

export function AssignTechnicianModal({ 
  isOpen, 
  onOpenChange, 
  os, 
  tecnicos, 
  onSubmit 
}: AssignTechnicianModalProps) {
  
  const [selectedTechnician, setSelectedTechnician] = useState<string | undefined>(undefined);

  const handleSubmit = () => {
    if (!selectedTechnician) {
      toast.error("Por favor, selecione um técnico.");
      return;
    }
    onSubmit(selectedTechnician);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atribuir Técnico</DialogTitle>
          <DialogDescription>
            Selecione um técnico para a OS <span className="font-bold">{os?.id}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tecnico" className="text-right">
              Técnico
            </Label>
            <Select 
              value={selectedTechnician} 
              onValueChange={setSelectedTechnician}
            >
              <SelectTrigger id="tecnico" className="col-span-3">
                <SelectValue placeholder="Selecione um técnico" />
              </SelectTrigger>
              <SelectContent>
                {tecnicos.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar Atribuição</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}