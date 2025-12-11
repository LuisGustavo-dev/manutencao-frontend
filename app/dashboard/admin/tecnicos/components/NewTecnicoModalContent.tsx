'use client';

import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/contexts/authContext";


interface NewTecnicoModalProps {
  onClose: () => void;
}

// Estado inicial alinhado com o payload da API
const initialFormData = {
  name: '',
  email: '',
  password: '',
  cpf: '',
  telefone: ''
};

export function NewTecnicoModalContent({ onClose }: NewTecnicoModalProps) {
  const { token } = useAuth(); // Recupera o token
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof typeof initialFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validação básica
    if (!formData.name || !formData.email || !formData.password || !formData.cpf) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!token) {
      toast.error("Erro de autenticação. Faça login novamente.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('http://localhost:3340/user/register-tecnico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        // Tenta pegar a mensagem de erro do backend, se houver
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao cadastrar técnico.');
      }

      toast.success("Técnico cadastrado com sucesso!");
      onClose(); // Fecha o modal e (se configurado no pai) recarrega a lista
      
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast.error(error.message || "Falha ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cadastrar Novo Técnico</DialogTitle>
        <DialogDescription>
          Preencha os dados pessoais e de login para o novo membro da equipe.
        </DialogDescription>
      </DialogHeader>
      
      {/* Formulário de Criação */}
      <div className="grid grid-cols-1 gap-4 py-4">
        
        <div>
          <Label htmlFor="name">Nome Completo</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => handleChange('name', e.target.value)} 
            placeholder="Ex: João da Silva" 
            disabled={isLoading}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input 
              id="cpf" 
              value={formData.cpf} 
              onChange={(e) => handleChange('cpf', e.target.value)} 
              placeholder="000.000.000-00" 
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input 
              id="telefone" 
              value={formData.telefone} 
              onChange={(e) => handleChange('telefone', e.target.value)} 
              placeholder="(00) 00000-0000" 
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email"
            value={formData.email} 
            onChange={(e) => handleChange('email', e.target.value)} 
            placeholder="Ex: joao.silva@suaempresa.com" 
            disabled={isLoading}
          />
        </div>
        
        <div>
          <Label htmlFor="password">Senha Provisória</Label>
          <Input 
            id="password" 
            type="password"
            value={formData.password} 
            onChange={(e) => handleChange('password', e.target.value)} 
            placeholder="Mínimo 6 caracteres"
            disabled={isLoading}
          />
        </div>

      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cadastrar Técnico
        </Button>
      </DialogFooter>
    </>
  );
}