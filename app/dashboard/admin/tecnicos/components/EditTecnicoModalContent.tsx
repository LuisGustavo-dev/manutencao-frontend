'use client';

import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext"; // Importação do Auth
import { Loader2 } from "lucide-react";

// Interface compatível com o backend (name ao invés de nome)
interface TecnicoData {
  id: number;
  name: string;
  email: string;
  isActive?: boolean;
}

interface EditTecnicoModalProps {
  tecnico: TecnicoData;
  onClose: () => void;
}

export function EditTecnicoModalContent({ tecnico, onClose }: EditTecnicoModalProps) {
  const { token } = useAuth(); // Recupera o token
  const [isLoading, setIsLoading] = useState(false);

  // Inicializa o state com os dados atuais do técnico
  const [formData, setFormData] = useState({
    name: tecnico.name, // Ajustado para 'name'
    email: tecnico.email,
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Preencha todos os campos.");
      return;
    }

    if (!token) {
      toast.error("Você precisa estar logado.");
      return;
    }

    try {
      setIsLoading(true);

      // Rota dinâmica com o ID do técnico
      const response = await fetch(`http://localhost:3340/user/${tecnico.id}`, {
        method: 'PATCH', // Geralmente updates usam PATCH ou PUT
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao atualizar técnico.');
      }

      toast.success("Dados atualizados com sucesso!");
      onClose(); // Fecha o modal (o pai deve recarregar a lista)

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
          Faça alterações nos dados cadastrais deste técnico.
        </DialogDescription>
      </DialogHeader>
      
      {/* Formulário de Edição */}
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
        
        <p className="text-sm text-muted-foreground mt-2">
          Nota: A edição de senha não é feita aqui. Solicite uma redefinição caso necessário.
        </p>

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