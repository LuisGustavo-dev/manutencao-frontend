"use client";

import { useState, useEffect } from "react";
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

interface ClienteFormState {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  password: string;
  precisaAssinatura: boolean; // <--- 2. Novo campo no estado
}

interface EditClienteModalProps {
  cliente: any;
  onClose: () => void;
}

export function EditClienteModalContent({
  cliente,
  onClose,
}: EditClienteModalProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Inicializa o estado
  const [formData, setFormData] = useState<ClienteFormState>({
    id: cliente.id,
    nome: cliente.nomeFantasia || cliente.name || "",
    email: cliente.email || "",
    telefone: cliente.telefone || "",
    password: "",
    precisaAssinatura: false,
  });

  useEffect(() => {
    if (cliente) {
      console.log("Dados do cliente recebidos para edição:", cliente);

      setFormData({
        id: cliente.id,
        nome: cliente.nomeFantasia || cliente.name || "",
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        password: "",
        // <--- 3. Carrega o valor atual do banco (assumindo que vem como requiresSubscription)
        precisaAssinatura: cliente.requiresSubscription || false,
      });
    }
  }, [cliente]);

  // <--- 4. Atualizado para aceitar string ou boolean
  const handleChange = (
    field: keyof ClienteFormState,
    value: string | boolean
  ) => {
    // Lógica específica para telefone (garante que value é string antes de dar replace)
    if (field === "telefone" && typeof value === "string") {
      const onlyNumbers = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [field]: onlyNumbers }));
      return;
    }

    // Atualização genérica
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Erro de autenticação.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        name: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        requiresSubscription: formData.precisaAssinatura, // <--- 5. Envia ao backend
      };

      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      const response = await fetch(`http://localhost:3340/user/${cliente.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao atualizar cliente");
      }

      toast.success("Dados atualizados com sucesso!");
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao salvar alterações.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogDescription>
          Atualize os dados de cadastro e acesso do cliente.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-4 py-4">
        {/* Campo Nome */}
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            disabled={isLoading}
            placeholder="Nome do cliente"
          />
        </div>

        {/* Campo Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={isLoading}
            placeholder="email@exemplo.com"
          />
        </div>

        {/* Campo Telefone */}
        <div>
          <Label htmlFor="telefone">Telefone / Celular</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
            disabled={isLoading}
            placeholder="11999999999"
            maxLength={11}
            inputMode="numeric"
          />
        </div>

        {/* Campo Senha */}
        <div>
          <Label htmlFor="password">Nova Senha</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            disabled={isLoading}
            placeholder="Deixe em branco para manter a atual"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Preencha apenas se desejar alterar a senha de acesso.
          </p>
        </div>

        {/* <--- 6. UI do Checkbox adicionada */}
        <div className="flex items-center space-x-2 mt-2 p-1">
          <Checkbox
            id="assinatura-edit"
            checked={formData.precisaAssinatura}
            onCheckedChange={(checked) =>
              handleChange("precisaAssinatura", checked === true)
            }
            disabled={isLoading}
          />
          <Label
            htmlFor="assinatura-edit"
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
          Salvar
        </Button>
      </DialogFooter>
    </>
  );
}
