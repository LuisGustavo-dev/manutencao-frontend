'use client';

import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import type { Equipamento, Cliente } from "@/lib/mock-data"; 
import toast from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext";
import { Loader2 } from "lucide-react";

interface EditEquipmentModalProps {
  equipment: Equipamento;
  clientes: Cliente[]; 
  onClose: () => void;
}

export function EditEquipmentModalContent({ equipment, clientes, onClose }: EditEquipmentModalProps) {
  const [formData, setFormData] = useState<Equipamento>(equipment);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth(); 

  const handleChange = (field: keyof Equipamento, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- NOVA LÓGICA: Adiciona V ao sair do campo ---
 const handleBlurTensao = () => {
    let valor = formData.tensao;
    
    // Se estiver vazio, não faz nada
    if (!valor) return;

    // 1. Remove qualquer combinação de espaços e letras 'v' (maiúscula ou minúscula) do final
    // A regex /\s*v+\s*$/i significa:
    // \s* -> qualquer espaço (opcional)
    // v+   -> uma ou mais letras 'v'
    // \s* -> qualquer espaço depois (opcional)
    // $    -> no fim da linha
    // i    -> ignora maiúsculas/minúsculas
    const valorLimpo = valor.replace(/\s*v+\s*$/i, '').trim();

    // 2. Define o valor limpo + " V" padrão
    handleChange('tensao', `${valorLimpo}`);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    if (!token) {
      toast.error("Sessão expirada. Faça login novamente.");
      setIsLoading(false);
      return;
    }

    const getUserId = () => {
      if (!formData.clienteId) {
        return null; 
      }
      const idAsNumber = parseInt(formData.clienteId, 10);
      return isNaN(idAsNumber) ? null : idAsNumber; 
    }

    const apiBody = {
      modeloCompressor: formData.modeloCompressor,
      tipoGas: formData.tipoGas,
      tipoOleo: formData.tipoOleo,
      tipoEvaporador: formData.tipoEvaporador,
      tipoCondensador: formData.tipoCondensador,
      tipoValvula: formData.valvulaExpansao, 
      tensao: formData.tensao,
      aplicacao: formData.aplicacao,
      user: getUserId() 
    };

    const apiUrl = `http://localhost:3340/equipamento/${equipment.id}`; 

    console.log("Atualizando dados:", apiUrl, apiBody);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(apiBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao atualizar equipamento.");
      }

      toast.success("Equipamento salvo com sucesso!");
      onClose(); 

    } catch (error: any) {
      console.error("Erro ao atualizar equipamento:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Equipamento</DialogTitle>
        <DialogDescription>
          Faça alterações nos dados cadastrais deste equipamento.
        </DialogDescription>
      </DialogHeader>
      
      {/* Formulário de Edição */}
      <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
        
        <div className="col-span-2">
          <Label htmlFor="cliente">Cliente Vinculado</Label>
          <Select 
            value={formData.clienteId || "none"} 
            onValueChange={(value) => handleChange('clienteId', value === "none" ? "" : value)}
          >
            <SelectTrigger id="cliente"><SelectValue placeholder="Nenhum cliente" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum cliente (Estoque)</SelectItem>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nomeFantasia} (ID: {cliente.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="aplicacao">Aplicação</Label>
          <Input id="aplicacao" value={formData.aplicacao} onChange={(e) => handleChange('aplicacao', e.target.value)} />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="tipo">Tipo (Controle Interno)</Label>
          <Select value={formData.tipo} onValueChange={(value) => handleChange('tipo', value)}>
            <SelectTrigger id="tipo"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Tunel de congelamento">Túnel de congelamento</SelectItem>
              <SelectItem value="Camara de congelado">Câmara de congelado</SelectItem>
              <SelectItem value="Camara de resfriado">Câmara de resfriado</SelectItem>
              <SelectItem value="Girofreezer">Girofreezer</SelectItem>
              <SelectItem value="Maquina de gelo">Máquina de gelo</SelectItem>
              <SelectItem value="Climatização">Climatização</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="tensao">Tensão</Label>
          <Input 
            id="tensao" 
            value={formData.tensao} 
            onChange={(e) => handleChange('tensao', e.target.value)}
            onBlur={handleBlurTensao} /* <-- Evento adicionado aqui */
          />
        </div>

        {/* Bloco 2: Detalhes Técnicos */}
        <h4 className="col-span-2 mt-4 font-semibold text-lg border-b pb-2">Detalhes Técnicos (API)</h4>
        
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="compressor">Modelo Compressor</Label>
          <Input id="compressor" value={formData.modeloCompressor} onChange={(e) => handleChange('modeloCompressor', e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="gas">Tipo de Gás</Label>
          <Input id="gas" value={formData.tipoGas} onChange={(e) => handleChange('tipoGas', e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="oleo">Tipo de Óleo</Label>
          <Input id="oleo" value={formData.tipoOleo} onChange={(e) => handleChange('tipoOleo', e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="condensador">Tipo de Condensador</Label>
          <Input id="condensador" value={formData.tipoCondensador} onChange={(e) => handleChange('tipoCondensador', e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="evaporador">Tipo de Evaporador</Label>
          <Input id="evaporador" value={formData.tipoEvaporador} onChange={(e) => handleChange('tipoEvaporador', e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="valvula">Válvula de Expansão (tipoValvula)</Label>
          <Input id="valvula" value={formData.valvulaExpansao} onChange={(e) => handleChange('valvulaExpansao', e.target.value)} />
        </div>

      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}