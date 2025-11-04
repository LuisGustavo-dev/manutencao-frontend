'use client';

import { useRef, useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { QRCodeCanvas } from 'qrcode.react'; // <-- 1. MUDANÇA IMPORTANTE: de SVG para Canvas
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Download, Copy, Check } from "lucide-react"; // <-- Novos Ícones
import toast from "react-hot-toast"; // <-- Para Feedback

interface QrCodeModalProps {
  equipmentName: string;
  qrUrl: string;
  onClose: () => void; // <-- 2. Adicionada a prop onClose
}

export function QrCodeModalContent({ equipmentName, qrUrl, onClose }: QrCodeModalProps) {
  // 3. Ref para o Canvas para podermos fazer o download
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  // 4. Função para Copiar o Link
  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    toast.success("Link copiado para a área de transferência!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reseta o ícone de "copiado"
  };

  // 5. Função para Baixar o QR Code
  const handleDownload = () => {
    if (canvasRef.current) {
      // Converte o canvas para um link de imagem PNG
      const url = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      // Define o nome do arquivo (ex: "tunel-congelamento.png")
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
          Baixe a imagem para imprimir ou copie o link para compartilhar.
        </DialogDescription>
      </DialogHeader>

      {/* 6. Novo Layout "Etiqueta" */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex flex-col items-center gap-3 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed">
          <div className="p-4 bg-white rounded-lg shadow-md">
            {/* 7. Usando o QRCodeCanvas e passando a ref */}
            <QRCodeCanvas
              // @ts-ignore (qrcode.react às vezes tem problemas de tipo com ref)
              ref={canvasRef}
              value={qrUrl}
              size={220} // Tamanho maior
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"H"} // Alta correção de erro
              includeMargin={true}
            />
          </div>
          <p className="font-semibold text-lg">{equipmentName}</p>
        </div>
      </div>

      {/* 8. Nova Seção "Copiar Link" */}
      <div className="space-y-2">
        <Label htmlFor="qr-url">Link Direto</Label>
        <div className="flex gap-2">
          <Input id="qr-url" value={qrUrl} readOnly className="flex-1" />
          <Button variant="outline" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" /> Baixar Imagem (.png)
        </Button>
      </DialogFooter>
    </>
  );
}