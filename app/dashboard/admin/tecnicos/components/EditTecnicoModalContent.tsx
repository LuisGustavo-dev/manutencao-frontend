'use client';

import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";
import { Loader2 } from "lucide-react";

interface TecnicoData {
  id: number;
  name: string;
  email: string;
  telefone?: string; 
  isActive?: boolean;
}

interface EditTecnicoModalProps {
  tecnico: TecnicoData;
  onClose: () => void;
}

export function EditTecnicoModalContent({ tecnico, onClose }: EditTecnicoModalProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: tecnico.name,
    email: tecnico.email,
    telefone: tecnico.telefone || '', 
    password: '', 
  });

  // --- MUDANÇA AQUI: Lógica de validação numérica ---
  const handleChange = (field: keyof typeof formData, value: string) => {
    
    if (field === 'telefone') {
      // O Regex /\D/g seleciona tudo que NÃO for dígito
      // Substituímos por string vazia, deixando só números
      const onlyNumbers = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [field]: onlyNumbers }));
      return;
    }

    // Comportamento padrão para os outros campos
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Nome e Email são obrigatórios.");
      return;
    }

    if (!token) {
      toast.error("Você precisa estar logado.");
      return;
    }

    try {
      setIsLoading(true);

      const payload: any = {
        name: formData.name,
        email: formData.email,
        telefone: formData.telefone,
      };

      if (formData.password && formData.password.trim() !== '') {
        payload.password = formData.password;
      }

      const response = await fetch(`http://localhost:3340/user/${tecnico.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao atualizar técnico.');
      }

      toast.success("Dados atualizados com sucesso!");
      onClose(); 

    } catch (error: any) {
      console.error("Erro na atualização:", error);
      toast.error(error.message || "Falha ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Técnico</DialogTitle>
        <DialogDescription>
          Atualize as informações de contato e acesso.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid grid-cols-1 gap-4 py-4">
        
        <div>
          <Label htmlFor="name">Nome Completo</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => handleChange('name', e.target.value)} 
            disabled={isLoading}
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email"
            value={formData.email} 
            onChange={(e) => handleChange('email', e.target.value)} 
            disabled={isLoading}
          />
        </div>

        {/* --- MUDANÇA AQUI: Input de Telefone --- */}
        <div>
          <Label htmlFor="telefone">Celular (Apenas Números)</Label>
          <Input 
            id="telefone" 
            value={formData.telefone} 
            onChange={(e) => handleChange('telefone', e.target.value)} 
            placeholder="11999999999"
            maxLength={11}       // Limita a 11 caracteres (DDD + 9 dígitos)
            inputMode="numeric"  // Abre teclado numérico no celular
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="password">Nova Senha</Label>
          <Input 
            id="password" 
            type="password"
            value={formData.password} 
            onChange={(e) => handleChange('password', e.target.value)} 
            placeholder="Deixe em branco para manter a atual"
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
          Salvar Alterações
        </Button>
      </DialogFooter>
    </>
  );
}