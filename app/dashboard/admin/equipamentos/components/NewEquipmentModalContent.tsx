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

interface NewEquipmentModalProps {
  clientes: Cliente[]; 
  onClose: () => void;
}

// --- TIPO E ESTADO INICIAL ATUALIZADOS ---
// Removemos o campo 'nome' do estado inicial
const initialFormData: Omit<Equipamento, 'nome'> = {
  id: '', 
  clienteId: null, 
  aplicacao: '',
  tipo: 'Tunel de congelamento', 
  tensao: '',
  modeloCompressor: '',
  tipoGas: '',
  tipoOleo: '',
  tipoCondensador: '',
  tipoEvaporador: '',
  valvulaExpansao: '',
  statusManutencao: 'Disponível',
};

export function NewEquipmentModalContent({ clientes, onClose }: NewEquipmentModalProps) {
  // O estado agora usa o tipo 'Omit'
  const [formData, setFormData] = useState<Omit<Equipamento, 'nome'>>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth(); 

  // O 'field' agora usa o 'keyof Omit<...>'
  const handleChange = (field: keyof Omit<Equipamento, 'nome'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      // O campo 'nome' não é mais enviado
    };
    
    console.log("Enviando para API:", apiBody);
    
    try {
      const response = await fetch('http://localhost:3340/equipamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(apiBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao cadastrar equipamento.");
      }

      toast.success("Equipamento cadastrado com sucesso!");
      onClose(); 

    } catch (error: any) {
      console.error("Erro ao cadastrar equipamento:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cadastrar Novo Equipamento</DialogTitle>
        <DialogDescription>
          Preencha os dados para cadastrar um novo equipamento no sistema.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
        
        {/* --- Bloco do NOME REMOVIDO --- */}
        
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
          <Input id="aplicacao" value={formData.aplicacao} onChange={(e) => handleChange('aplicacao', e.target.value)} placeholder="Ex: Congelamento de pão de queijo" />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="tipo">Tipo (Controle Interno)</Label>
          <Select value={formData.tipo} onValueChange={(value) => handleChange('tipo' as any, value)}>
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
          <Input id="tensao" value={formData.tensao} onChange={(e) => handleChange('tensao', e.target.value)} placeholder="220V / 380V" />
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
          <Label htmlFor="valvula">Válvula de Expansão</Label>
          <Input id="valvula" value={formData.valvulaExpansao} onChange={(e) => handleChange('valvulaExpansao', e.target.value)} />
        </div>

      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Cadastrar Equipamento"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}