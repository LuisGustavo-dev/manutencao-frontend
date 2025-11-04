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
import type { Equipamento, Cliente } from "@/lib/mock-data"; // Importa os tipos
import toast from "react-hot-toast";

interface EditEquipmentModalProps {
  equipment: Equipamento;
  clientes: Cliente[]; 
  onClose: () => void;
}

export function EditEquipmentModalContent({ equipment, clientes, onClose }: EditEquipmentModalProps) {
  const [formData, setFormData] = useState<Equipamento>(equipment);

  const handleChange = (field: keyof Equipamento, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Lógica de salvamento (aqui apenas simulada)
    console.log("Salvando dados:", formData);
    // (Em um app real, você atualizaria o mock-data.ts aqui ou faria refetch)
    toast.success("Equipamento salvo com sucesso!");
    onClose();
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
        
        {/* Bloco 1: Informações Principais */}
        <div className="col-span-2">
          <Label htmlFor="nome">Nome do Equipamento</Label>
          <Input id="nome" value={formData.nome} onChange={(e) => handleChange('nome', e.target.value)} />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="cliente">Cliente Vinculado</Label>
          <Select 
            value={formData.clienteId || ""} // Usa string vazia se for nulo
            onValueChange={(value) => handleChange('clienteId', value)}
          >
            <SelectTrigger id="cliente"><SelectValue placeholder="Nenhum cliente" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum cliente (Estoque)</SelectItem>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nomeFantasia} ({cliente.cnpj})
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
          <Label htmlFor="tipo">Tipo</Label>
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
          <Input id="tensao" value={formData.tensao} onChange={(e) => handleChange('tensao', e.target.value)} />
        </div>

        {/* Bloco 2: Detalhes Técnicos */}
        <h4 className="col-span-2 mt-4 font-semibold text-lg border-b pb-2">Detalhes Técnicos</h4>
        
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
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Salvar Alterações</Button>
      </DialogFooter>
    </>
  );
}