'use client';

import { useState, useRef } from 'react';
import { 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
// --- Ícones Adicionados ---
import { AlertCircle, Camera, Edit3, X, UploadCloud, Loader2 } from "lucide-react"; 
import toast from 'react-hot-toast';
import { useAuth } from '@/app/contexts/authContext'; // <-- Importa o Auth

// --- 1. PROPS ATUALIZADAS ---
interface FormChecklistClienteProps {
  equipamentoId: string; // <-- ID para a rota da API
  onClose: () => void; // <-- Para o botão Cancelar
  onSuccess: () => void; // <-- Chamado após o sucesso do submit
}

export function FormChecklistCliente({ equipamentoId, onClose, onSuccess }: FormChecklistClienteProps) {
  
  // --- 2. ESTADOS DO FORMULÁRIO ---
  const [observacao, setObservacao] = useState("");
  const [picoEnergia, setPicoEnergia] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth(); // <-- Pega o token para a API

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // --- 3. LÓGICA DE SUBMISSÃO DA API ---
  const handleSubmit = async () => {
    setIsLoading(true);
    
    if (!token) {
      toast.error("Sessão expirada. Faça login novamente.");
      setIsLoading(false);
      return;
    }

    // 1. Constrói a parte 'data' (JSON stringificado)
    const dataPayload = {
      observacao: observacao,
      triagemHousePicoEnergia: picoEnergia
    };

    // 2. Constrói o FormData
    const formData = new FormData();
    formData.append('data', JSON.stringify(dataPayload));

    // 3. Anexa todos os arquivos à chave 'files'
    files.forEach((file) => {
      formData.append('files', file);
    });

    // 4. Envia para a API
    try {
      const response = await fetch(`http://localhost:3340/chamado/${equipamentoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // NÃO defina 'Content-Type', o browser faz isso para multipart/form-data
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Falha ao abrir chamado.");
      }

      toast.success("Chamado aberto com sucesso!");
      onSuccess(); // Fecha o modal e recarrega os dados na página anterior

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. LÓGICA DE VALIDAÇÃO DO BOTÃO ---
  const isButtonDisabled = observacao.trim() === "" || files.length === 0 || isLoading;

  return (
    <>
      <DialogHeader className="pb-4">
        <DialogTitle className="flex items-center gap-2 text-2xl">
          <AlertCircle className="h-6 w-6 text-destructive" /> Solicitar Manutenção Corretiva
        </DialogTitle>
        <DialogDescription>
          Descreva o problema e anexe ao menos uma foto ou vídeo para continuar.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" /> Detalhes do Problema
          </h4>
          
          {/* --- 5. INPUTS CONTROLADOS --- */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="chk-energia" 
              checked={picoEnergia}
              onCheckedChange={(checked) => setPicoEnergia(Boolean(checked))}
            />
            <Label htmlFor="chk-energia">Houve pico ou oscilação de energia recentemente?</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="txt-problema">Descreva o problema (ou código de erro) *</Label>
            <Textarea 
              id="txt-problema" 
              placeholder="Ex: Equipamento não está gelando, fazendo barulho estranho..." 
              rows={4}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload" className="flex items-center gap-2">
              <Camera className="h-4 w-4" /> Anexar fotos ou vídeos *
            </Label>
            
            <div 
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer text-muted-foreground hover:bg-secondary/20"
              onClick={triggerFileInput}
            >
              <UploadCloud className="h-8 w-8 mb-2" />
              <p className="font-semibold">Clique ou arraste os arquivos</p>
              <p className="text-sm">Você pode adicionar múltiplas imagens ou vídeos.</p>
            </div>
            
            <Input 
              id="file-upload" 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*" // Aceita imagens e vídeos
            />

            {files.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label>Arquivos adicionados:</Label>
                <ul className="space-y-2 max-h-32 overflow-y-auto">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                      <span className="truncate max-w-xs">{file.name}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- 6. BOTÕES ATUALIZADOS --- */}
      <DialogFooter className="pt-4">
        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="destructive" 
          disabled={isButtonDisabled}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Confirmar Chamado"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}