"use client";

import { useState, useEffect } from "react"; // <--- Adicionado useEffect
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";

interface ClienteFormState {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  password: string;
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
  });

  // --- CORREÇÃO AQUI ---
  // Este useEffect garante que, se o objeto 'cliente' mudar (ex: abrir o modal),
  // os campos do formulário são atualizados com os dados vindos do banco.
  useEffect(() => {
    if (cliente) {
      // Dica de Debug: Olhe no console do navegador (F12) para ver
      // se o backend está mandando 'telefone', 'phone', 'celular', etc.
      console.log("Dados do cliente recebidos para edição:", cliente);

      setFormData({
        id: cliente.id,
        nome: cliente.nomeFantasia || cliente.name || "",
        email: cliente.email || "",
        telefone: cliente.telefone || "", // Verifique se no banco não está salvo como 'phone' ou 'celular'
        password: "", // Senha reseta sempre que muda o cliente
      });
    }
  }, [cliente]);
  // ---------------------

  const handleChange = (field: keyof ClienteFormState, value: string) => {
    if (field === "telefone") {
      const onlyNumbers = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [field]: onlyNumbers }));
      return;
    }
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
