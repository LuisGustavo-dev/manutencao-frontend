'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DialogContent, // <-- Importe o DialogContent
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
import type { EnrichedOS } from '../page'; // Importa o tipo da página pai
import { mockTecnicos } from '@/lib/mock-data'; // Importa o mock de tecnicos
import type { Tecnico } from '@/lib/mock-data'; // Importa o tipo
import toast from 'react-hot-toast';

interface AssignTechnicianModalProps {
  os: EnrichedOS;
  tecnicos: Tecnico[];
  onClose: () => void;
  onSubmit: (osId: string, tecnicoId: string) => void;
}

export function AssignTechnicianModal({ 
  os, 
  tecnicos, 
  onClose, 
  onSubmit 
}: AssignTechnicianModalProps) {
  
  // O estado agora usa o os.tecnicoId ou undefined
  const [selectedTechnician, setSelectedTechnician] = useState<string | undefined>(os.tecnicoId || undefined);

  const handleSubmit = () => {
    if (!selectedTechnician) {
      toast.error("Por favor, selecione um técnico.");
      return;
    }
    onSubmit(os.id, selectedTechnician);
  };

  return (
    // O <DialogContent> é o contêiner principal do modal
    <>
      <DialogHeader>
        <DialogTitle>Atribuir Técnico</DialogTitle>
        <DialogDescription>
          Selecione um técnico para a OS <span className="font-bold">{os?.id}</span>
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex items-center gap-4">
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
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Salvar Atribuição</Button>
      </DialogFooter>
    </>
  );
}