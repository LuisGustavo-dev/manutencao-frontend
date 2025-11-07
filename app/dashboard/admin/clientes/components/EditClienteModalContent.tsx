'use client';

import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cliente } from "@/lib/mock-data"; // Importa o tipo
import toast from "react-hot-toast";

interface EditClienteModalProps {
  cliente: Cliente;
  onClose: () => void;
}

export function EditClienteModalContent({ cliente, onClose }: EditClienteModalProps) {
  const [formData, setFormData] = useState<Cliente>(cliente);

  const handleChange = (field: keyof Cliente, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Lógica de salvamento (aqui simulada)
    console.log("Atualizando dados:", formData);
    // (Em um app real, você atualizaria o mock-data.ts aqui ou faria refetch)
    
    toast.success("Cliente salvo com sucesso!");
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogDescription>
          Faça alterações nos dados cadastrais deste cliente.
        </DialogDescription>
      </DialogHeader>
      
      {/* Formulário de Edição */}
      <div className="grid grid-cols-1 gap-4 py-4">
        
        <div>
          <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
          <Input 
            id="nomeFantasia" 
            value={formData.nomeFantasia} 
            onChange={(e) => handleChange('nomeFantasia', e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="razaoSocial">Razão Social</Label>
          <Input 
            id="razaoSocial" 
            value={formData.razaoSocial} 
            onChange={(e) => handleChange('razaoSocial', e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input 
            id="cnpj" 
            value={formData.cnpj} 
            onChange={(e) => handleChange('cnpj', e.target.value)} 
          />
        </div>

      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Salvar Alterações</Button>
      </DialogFooter>
    </>
  );
}