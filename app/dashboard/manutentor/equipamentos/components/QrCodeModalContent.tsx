'use client';

import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Loader2, AlertTriangle } from "lucide-react"; 
import toast from "react-hot-toast";
import { useAuth } from "@/app/contexts/authContext"; // <-- 1. Importar Auth

interface QrCodeModalProps {
  equipmentName: string;
  equipmentId: string; // <-- 2. Prop alterada (não é mais qrUrl)
  onClose: () => void;
}

export function QrCodeModalContent({ equipmentName, equipmentId, onClose }: QrCodeModalProps) {
  // --- 3. Novos estados para API ---
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth(); // <-- Pega o token para a chamada

  // --- 4. Busca o QR Code na API ---
  useEffect(() => {
    if (!equipmentId || !token) {
      toast.error("ID do equipamento ou token não encontrado.");
      setIsLoading(false);
      return;
    }

    const fetchQrCode = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3340/equipamento/${equipmentId}/qrcode`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error("Falha ao carregar QR Code.");
        }

        // --- CORREÇÃO: A API retorna TEXTO (base64), não JSON ---
        const base64String = await response.text(); 

        if (!base64String || !base64String.startsWith('data:image/png;base64,')) { 
          throw new Error("Formato de resposta da API inválido.");
        }
        
        setImageData(base64String); // Salva a string base64

      } catch (err: any) {
        toast.error(err.message || "Erro ao buscar QR Code.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQrCode();
  }, [equipmentId, token]);

  // --- 5. Lógica de Download ATUALIZADA ---
  const handleDownload = () => {
    if (imageData) {
      const link = document.createElement("a");
      link.href = imageData; // A string base64 (Data URI) é um href válido
      link.download = `${equipmentName.toLowerCase().replace(/ /g, '-')}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download da imagem iniciado!");
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-2xl">
          <QrCode className="h-6 w-6" /> Etiqueta de QR Code
        </DialogTitle>
        <DialogDescription>
          Baixe a imagem para imprimir a etiqueta de identificação.
        </DialogDescription>
      </DialogHeader>

      {/* --- 6. Layout ATUALIZADO para Loading --- */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed h-[320px] w-full">
          
          {isLoading && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-3 text-muted-foreground">Carregando QR Code...</p>
            </div>
          )}
          
          {imageData && !isLoading && (
            <>
              <div className="p-4 bg-white rounded-lg shadow-md">
                {/* --- MUDANÇA: Renderiza a imagem da API --- */}
                <img 
                  src={imageData} 
                  alt={`QR Code para ${equipmentName}`}
                  width={220}
                  height={220}
                />
              </div>
              <p className="font-semibold text-lg">{equipmentName}</p>
            </>
          )}

          {!imageData && !isLoading && (
            <div className="flex flex-col items-center text-destructive">
               <AlertTriangle className="h-10 w-10" />
               <p className="mt-3">Não foi possível carregar o QR Code.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- 7. REMOVIDO: Seção "Copiar Link" --- */}

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        <Button onClick={handleDownload} disabled={!imageData || isLoading}>
          <Download className="mr-2 h-4 w-4" /> Baixar Imagem (.png)
        </Button>
      </DialogFooter>
    </>
  );
}