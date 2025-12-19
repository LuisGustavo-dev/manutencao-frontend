"use client";

import { useState } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // <--- 1. Importação do Checkbox
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";

interface NewClienteModalProps {
  onClose: () => void;
}

interface RegisterClienteForm {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  password: string;
  telefone: string;
  precisaAssinatura: boolean; // <--- 2. Novo campo na interface
}

const initialFormData: RegisterClienteForm = {
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  email: "",
  password: "",
  telefone: "",
  precisaAssinatura: false, // <--- 3. Valor inicial
};

export function NewClienteModalContent({ onClose }: NewClienteModalProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] =
    useState<RegisterClienteForm>(initialFormData);

  // Alterei para aceitar string ou boolean para ser genérico,
  // mas usaremos um set direto no Checkbox para facilitar
  const handleChange = (
    field: keyof RegisterClienteForm,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
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
      const payload = {
        name: formData.nomeFantasia,
        email: formData.email,
        password: formData.password,
        cnpj: formData.cnpj,
        razaoSocial: formData.razaoSocial,
        telefone: formData.telefone,
        requiresSubscription: formData.precisaAssinatura, // <--- 4. Enviando ao backend (ajuste a chave conforme seu DTO)
      };

      const response = await fetch(
        "http://localhost:3340/user/register-cliente",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao cadastrar cliente");
      }

      toast.success("Cliente cadastrado com sucesso!");
      onClose();
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        {/* Coluna 1: Identificação */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
            <Input
              id="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={(e) => handleChange("nomeFantasia", e.target.value)}
              placeholder="Ex: Supermercado Brasa"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="razaoSocial">Razão Social</Label>
            <Input
              id="razaoSocial"
              value={formData.razaoSocial}
              onChange={(e) => handleChange("razaoSocial", e.target.value)}
              placeholder="Ltda, S.A, etc."
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => handleChange("cnpj", e.target.value)}
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
              onChange={(e) => handleChange("telefone", e.target.value)}
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
              onChange={(e) => handleChange("email", e.target.value)}
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
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="******"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* --- 5. Checkbox Adicionado Aqui (ocupa as duas colunas em telas médias) --- */}
        <div className="md:col-span-2 flex items-center space-x-2 mt-2 p-1">
          <Checkbox
            id="assinatura"
            checked={formData.precisaAssinatura}
            onCheckedChange={(checked) =>
              handleChange("precisaAssinatura", checked === true)
            }
            disabled={isLoading}
          />
          <Label
            htmlFor="assinatura"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Requer assinatura ao finalziar serviços?
          </Label>
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
