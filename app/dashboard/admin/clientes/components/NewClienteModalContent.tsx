'use client';

import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cliente } from "@/lib/mock-data"; // Importa o tipo
import toast from "react-hot-toast";

interface NewClienteModalProps {
  onClose: () => void;
}

// Define o estado inicial para um cliente novo
// Assumindo que a interface Cliente tem estes campos
const initialFormData: Cliente = {
  id: '', // O ID será gerado no submit
  nomeFantasia: '',
  razaoSocial: '',
  cnpj: '',
};

export function NewClienteModalContent({ onClose }: NewClienteModalProps) {
  const [formData, setFormData] = useState<Cliente>(initialFormData);

  const handleChange = (field: keyof Cliente, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Lógica de salvamento (aqui simulada)
    const newCliente = {
      ...formData,
      id: crypto.randomUUID() // Gera um ID único para o novo cliente
    }
    
    console.log("Salvando novo cliente:", newCliente);
    // (Em um app real, você adicionaria ao mock-data.ts aqui ou faria refetch)
    
    toast.success("Cliente cadastrado com sucesso!");
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
        <DialogDescription>
          Preencha os dados do novo cliente.
        </DialogDescription>
      </DialogHeader>
      
      {/* Formulário de Criação */}
      <div className="grid grid-cols-1 gap-4 py-4">
        
        <div>
          <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
          <Input 
            id="nomeFantasia" 
            value={formData.nomeFantasia} 
            onChange={(e) => handleChange('nomeFantasia', e.target.value)} 
            placeholder="Ex: Supermercado Brasa" 
          />
        </div>
        
        <div>
          <Label htmlFor="razaoSocial">Razão Social</Label>
          <Input 
            id="razaoSocial" 
            value={formData.razaoSocial} 
            onChange={(e) => handleChange('razaoSocial', e.target.value)} 
            placeholder="Ex: Brasa Comércio de Alimentos Ltda." 
          />
        </div>
        
        <div>
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input 
            id="cnpj" 
            value={formData.cnpj} 
            onChange={(e) => handleChange('cnpj', e.target.value)} 
            placeholder="00.000.000/0001-00"
          />
        </div>

      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Cadastrar Cliente</Button>
      </DialogFooter>
    </>
  );
}