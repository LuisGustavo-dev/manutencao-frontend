'use client';

import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Usuario } from "@/lib/mock-data"; // Importa o tipo
import toast from "react-hot-toast";

interface NewTecnicoModalProps {
  onClose: () => void;
}

// Define o estado inicial para um técnico novo
const initialFormData = {
  nome: '',
  email: '',
  senha: '',
};

export function NewTecnicoModalContent({ onClose }: NewTecnicoModalProps) {
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (field: keyof typeof initialFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Lógica de salvamento (aqui simulada)
    const newTecnico: Usuario = {
      ...formData,
      id: crypto.randomUUID(), // Gera um ID único
      role: 'Manutentor',        // Define a role fixa
      
      // --- CORREÇÃO AQUI ---
      clienteId: null // Adiciona o campo obrigatório como nulo
      // --- FIM DA CORREÇÃO ---
    }
    
    console.log("Salvando novo técnico:", newTecnico);
    // (Em um app real, você adicionaria ao mockUsuarios aqui ou faria refetch)
    
    toast.success("Técnico cadastrado com sucesso!");
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cadastrar Novo Técnico</DialogTitle>
        <DialogDescription>
          Preencha os dados de login para o novo membro da equipe.
        </DialogDescription>
      </DialogHeader>
      
      {/* Formulário de Criação */}
      <div className="grid grid-cols-1 gap-4 py-4">
        
        <div>
          <Label htmlFor="nome">Nome Completo</Label>
          <Input 
            id="nome" 
            value={formData.nome} 
            onChange={(e) => handleChange('nome', e.target.value)} 
            placeholder="Ex: João da Silva" 
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email"
            value={formData.email} 
            onChange={(e) => handleChange('email', e.target.value)} 
            placeholder="Ex: joao.silva@suaempresa.com" 
          />
        </div>
        
        <div>
          <Label htmlFor="senha">Senha Provisória</Label>
          <Input 
            id="senha" 
            type="password"
            value={formData.senha} 
            onChange={(e) => handleChange('senha', e.target.value)} 
            placeholder="Mínimo 6 caracteres"
          />
        </div>

      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Cadastrar Técnico</Button>
      </DialogFooter>
    </>
  );
}