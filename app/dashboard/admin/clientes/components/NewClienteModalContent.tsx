'use client';

import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";

interface NewClienteModalProps {
  onClose: () => void;
}

// Interface local para o formulário de cadastro
interface RegisterClienteForm {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  password: string;
  telefone: string;
}

const initialFormData: RegisterClienteForm = {
  nomeFantasia: '',
  razaoSocial: '',
  cnpj: '',
  email: '',
  password: '',
  telefone: '',
};

export function NewClienteModalContent({ onClose }: NewClienteModalProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterClienteForm>(initialFormData);

  const handleChange = (field: keyof RegisterClienteForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validação básica
    if (!formData.nomeFantasia || !formData.email || !formData.password) {
      toast.error("Preencha os campos obrigatórios (Nome, Email, Senha).");
      return;
    }

    if (!token) {
      toast.error("Erro de autenticação.");
      return;
    }

    setIsLoading(true);

    try {
      // Monta o objeto exatamente como o backend espera
      const payload = {
        name: formData.nomeFantasia, // Mapeia Nome Fantasia -> name
        email: formData.email,
        password: formData.password,
        cnpj: formData.cnpj,
        razaoSocial: formData.razaoSocial,
        telefone: formData.telefone
      };

      const response = await fetch('http://localhost:3340/user/register-cliente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao cadastrar cliente');
      }

      toast.success("Cliente cadastrado com sucesso!");
      onClose(); // Fecha o modal e dispara a atualização na tabela (via refetch no pai)

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
        <DialogDescription>
          Preencha os dados de acesso e identificação da empresa.
        </DialogDescription>
      </DialogHeader>
      
      {/* Formulário de Criação - Grid de 2 colunas para caber melhor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        
        {/* Coluna 1: Identificação */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
            <Input 
              id="nomeFantasia" 
              value={formData.nomeFantasia} 
              onChange={(e) => handleChange('nomeFantasia', e.target.value)} 
              placeholder="Ex: Supermercado Brasa" 
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="razaoSocial">Razão Social</Label>
            <Input 
              id="razaoSocial" 
              value={formData.razaoSocial} 
              onChange={(e) => handleChange('razaoSocial', e.target.value)} 
              placeholder="Ltda, S.A, etc." 
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input 
              id="cnpj" 
              value={formData.cnpj} 
              onChange={(e) => handleChange('cnpj', e.target.value)} 
              placeholder="00.000.000/0001-00"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Coluna 2: Contato e Acesso */}
        <div className="space-y-4">
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

          <div>
            <Label htmlFor="email">Email de Acesso *</Label>
            <Input 
              id="email" 
              type="email"
              value={formData.email} 
              onChange={(e) => handleChange('email', e.target.value)} 
              placeholder="admin@cliente.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password">Senha Inicial *</Label>
            <Input 
              id="password" 
              type="password"
              value={formData.password} 
              onChange={(e) => handleChange('password', e.target.value)} 
              placeholder="******"
              disabled={isLoading}
            />
          </div>
        </div>

      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cadastrar Cliente
        </Button>
      </DialogFooter>
    </>
  );
}