'use client';

import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Usuario } from "@/lib/mock-data"; // Importa o tipo
import toast from "react-hot-toast";

interface EditTecnicoModalProps {
  tecnico: Usuario;
  onClose: () => void;
}

export function EditTecnicoModalContent({ tecnico, onClose }: EditTecnicoModalProps) {
  // Omitimos a senha, pois ela é redefinida, não editada
  const [formData, setFormData] = useState({
    nome: tecnico.nome,
    email: tecnico.email,
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Lógica de salvamento (aqui simulada)
    const updatedTecnico = {
      ...tecnico, // Mantém ID, role, etc.
      ...formData  // Sobrescreve nome e email
    }

    console.log("Atualizando dados:", updatedTecnico);
    // (Em um app real, você atualizaria o mockUsuarios aqui ou faria refetch)
    
    toast.success("Técnico salvo com sucesso!");
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Técnico</DialogTitle>
        <DialogDescription>
          Faça alterações nos dados cadastrais deste técnico.
        </DialogDescription>
      </DialogHeader>
      
      {/* Formulário de Edição */}
      <div className="grid grid-cols-1 gap-4 py-4">
        
        <div>
          <Label htmlFor="nome">Nome Completo</Label>
          <Input 
            id="nome" 
            value={formData.nome} 
            onChange={(e) => handleChange('nome', e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email"
            value={formData.email} 
            onChange={(e) => handleChange('email', e.target.value)} 
          />
        </div>
        
        <p className="text-sm text-muted-foreground">
          Para alterar a senha, utilize a opção "Redefinir Senha" no menu de ações.
        </p>

      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Salvar Alterações</Button>
      </DialogFooter>
    </>
  );
}