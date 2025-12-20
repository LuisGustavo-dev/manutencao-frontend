"use client";

// --- 1. Imports Atualizados ---
import { useState, useRef, useMemo, useEffect } from "react";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HardHat,
  FileText,
  Zap,
  Gauge,
  AlertTriangle,
  Check,
  Circle,
  X,
  UploadCloud,
  Loader2,
  CheckCircle,
  Camera,
} from "lucide-react";
import { useAuth } from "@/app/contexts/authContext";
import toast from "react-hot-toast";

// --- 2. Tipos de Estado ---
type ItemStatus = "pending" | "ok" | "erro";
interface ChecklistItemState {
  status: ItemStatus;
  laudo: string;
  files: File[];
}
interface AllItemStates {
  [key: string]: ChecklistItemState;
}

// --- 3. Lista de Itens ---
const painelEletricoItems = [
  { id: "m-tensao", label: "Verificar Tensão" },
  { id: "m-disjuntores", label: "Verificar Disjuntores" },
  { id: "m-rele", label: "Checar Relé de falta de fase" },
  { id: "m-alarme", label: "Checar alarmes na Soft ou Inversor" },
];

const compressorItems = [
  { id: "m-oleo", label: "Verificar Nível de Óleo" },
  { id: "m-press-oleo", label: "Checar Pressostato de Óleo" },
  { id: "m-press-alta", label: "Checar Pressostato de Alta Pressão" },
  { id: "m-temp", label: "Medir Temperatura do Compressor" },
  { id: "m-gas", label: "Verificar Nível de Gás" },
];

const allItems = [...painelEletricoItems, ...compressorItems];

// --- 4. PROPS ATUALIZADAS ---
interface FormChecklistManutentorProps {
  equipamentoId: string; // <-- MUDANÇA: de osId para equipamentoId
  onSuccess: () => void;
  onClose: () => void;
}

// --- COMPONENTE DO FORMULÁRIO PRINCIPAL ---
export function FormChecklistManutentorCorretiva({
  equipamentoId, // <-- MUDANÇA
  onSuccess,
  onClose,
}: FormChecklistManutentorProps) {
  const { token } = useAuth();
  const [laudoGeral, setLaudoGeral] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const [activeTab, setActiveTab] = useState("painel-eletrico");

  // --- 5. Estado unificado (apenas para validação) ---
  const [itemStates, setItemStates] = useState<AllItemStates>(() => {
    return Object.fromEntries(
      allItems.map((item) => [
        item.id,
        { status: "pending", laudo: "", files: [] },
      ])
    );
  });

  // --- 6. Lógica de Validação e Conclusão ---

  const updateItemStateInParent = (
    id: string,
    newState: ChecklistItemState
  ) => {
    setItemStates((prev) => ({
      ...prev,
      [id]: newState,
    }));
  };

  const isItemCompleted = (item: ChecklistItemState) => {
    if (item.status === "ok") return true;
    if (
      item.status === "erro" &&
      item.laudo.trim() !== "" &&
      item.files.length > 0
    )
      return true;
    return false;
  };

  const {
    isPainelEletricoCompleted,
    isCompressorCompleted,
    isResumoCompleted,
  } = useMemo(() => {
    const isTabCompleted = (itemIds: string[]) => {
      return itemIds.every((id) => isItemCompleted(itemStates[id]));
    };

    return {
      isPainelEletricoCompleted: isTabCompleted(
        painelEletricoItems.map((i) => i.id)
      ),
      isCompressorCompleted: isTabCompleted(compressorItems.map((i) => i.id)),
      isResumoCompleted: laudoGeral.trim() !== "",
    };
  }, [itemStates, laudoGeral]);

  const isSubmitDisabled =
    !isPainelEletricoCompleted ||
    !isCompressorCompleted ||
    !isResumoCompleted ||
    isFinishing;

  // --- 7. HandleSubmit (Envia SÓ o laudo final) ---
  const handleSubmitFinal = async () => {
    setIsFinishing(true);
    if (!token) {
      toast.error("Sessão expirada.");
      setIsFinishing(false);
      return;
    }

    // --- MUDANÇA: Rota de finalização (assumida) ---
    // (O backend precisa de uma rota para finalizar o chamado usando o ID do equipamento)
    const apiUrl = `http://localhost:3340/chamado/finalizar/equipamento/${equipamentoId}`;
    console.log("Enviando Laudo Final para:", apiUrl, { laudo: laudoGeral });

    try {
      const response = await fetch(apiUrl, {
        method: "PATCH", // ou POST
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ laudoGeral: laudoGeral }),
      });
      if (!response.ok) throw new Error("Falha ao finalizar chamado.");

      toast.success("Manutenção Concluída!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-2xl">
          <HardHat className="h-6 w-6 text-primary" /> Realizar Manutenção
          Corretiva
        </DialogTitle>
        <DialogDescription>
          Preencha o checklist para dar baixa nesta OS. Cada item é salvo
          individualmente.
        </DialogDescription>
      </DialogHeader>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full py-4"
      >
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger
            value="painel-eletrico"
            className="flex items-center gap-2 text-base"
          >
            {isPainelEletricoCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <Zap className="h-5 w-5" /> Painel Elétrico
          </TabsTrigger>

          <TabsTrigger
            value="compressor"
            className="flex items-center gap-2 text-base"
          >
            {isCompressorCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <Gauge className="h-5 w-5" /> Compressor
          </TabsTrigger>

          <TabsTrigger
            value="resumo"
            className="flex items-center gap-2 text-base"
          >
            {isResumoCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <FileText className="h-5 w-5" /> Resumo
          </TabsTrigger>
        </TabsList>

        {/* --- 8. CONTEÚDO DAS ABAS (Passando novas props) --- */}

        <TabsContent value="painel-eletrico">
          <div className="space-y-6 py-4 max-h-[50vh] overflow-y-auto pr-2">
            {painelEletricoItems.map((item) => (
              <ChecklistItem
                key={item.id}
                id={item.id}
                label={item.label}
                equipamentoId={equipamentoId} // <-- MUDANÇA: Passa o ID do Equipamento
                token={token}
                onStateChange={(newState) =>
                  updateItemStateInParent(item.id, newState)
                }
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compressor">
          <div className="space-y-6 py-4 max-h-[50vh] overflow-y-auto pr-2">
            {compressorItems.map((item) => (
              <ChecklistItem
                key={item.id}
                id={item.id}
                label={item.label}
                equipamentoId={equipamentoId} // <-- MUDANÇA: Passa o ID do Equipamento
                token={token}
                onStateChange={(newState) =>
                  updateItemStateInParent(item.id, newState)
                }
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resumo">
          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label
                htmlFor="txt-obs-final"
                className="font-semibold text-base"
              >
                Resumo Geral do Serviço *
              </Label>
              <Textarea
                id="txt-obs-final"
                placeholder="Descreva o serviço finalizado, peças trocadas, e o status final do equipamento."
                rows={8}
                value={laudoGeral}
                onChange={(e) => setLaudoGeral(e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="pt-4">
        <Button
          variant="outline"
          type="button"
          onClick={onClose}
          disabled={isFinishing}
        >
          Cancelar
        </Button>
        <Button onClick={handleSubmitFinal} disabled={isSubmitDisabled}>
          {isFinishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Concluir Manutenção
        </Button>
      </DialogFooter>
    </>
  );
}

// --- 9. COMPONENTE INTERNO: ChecklistItem (com lógica de API) ---
// ---
interface ChecklistItemProps {
  id: string;
  label: string;
  equipamentoId: string; // <-- MUDANÇA: de osId para equipamentoId
  token: string | null;
  onStateChange: (newState: ChecklistItemState) => void;
}

function ChecklistItem({
  id,
  label,
  equipamentoId,
  token,
  onStateChange,
}: ChecklistItemProps) {
  const [status, setStatus] = useState<ItemStatus>("pending");
  const [laudo, setLaudo] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // --- LÓGICA DE AUTO-SALVAMENTO ---
  useEffect(() => {
    // 1. Define se o item está "completo"
    const checkCompletion = () => {
      if (status === "ok") return true;
      if (status === "erro" && laudo.trim() !== "" && files.length > 0)
        return true;
      return false;
    };

    const newIsComplete = checkCompletion();
    setIsComplete(newIsComplete);

    // 2. Notifica o pai sobre o estado (para a validação do botão "Concluir")
    onStateChange({ status, laudo, files });

    // 3. Se acabou de ser concluído, salva na API
    if (newIsComplete) {
      handleApiSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, laudo, files]);

  // --- API SUBMIT (POR ITEM) ---
  const handleApiSubmit = async () => {
    setIsSaving(true);
    if (!token) {
      toast.error("Sessão expirada.");
      setIsSaving(false);
      return;
    }

    const formData = new FormData();

    // 1. Constrói o JSON 'data' (com apenas 1 item no array)
    const checklistsTecnico = [
      {
        nomeChecklist: label,
        observacao: laudo || (status === "ok" ? "OK" : ""),
        //operacional: status === "ok",
        nomeArquivoReferencia: files.map((f) => f.name),
      },
    ];

    formData.append("data", JSON.stringify({ checklistsTecnico }));

    // 2. Anexa os arquivos deste item
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // --- MUDANÇA: Rota da API atualizada ---
      const response = await fetch(
        `http://localhost:3340/chamado/atualizar-por-check/equipamento/${equipamentoId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        setStatus("pending");
        throw new Error("Falha ao salvar item.");
      }

      toast.success(`Item "${label}" salvo!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLaudoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLaudo(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all 
      ${status === "pending" ? "bg-background" : ""}
      ${
        status === "ok"
          ? "bg-green-50 border-green-200 dark:bg-green-900/20"
          : ""
      }
      ${
        status === "erro" && !isComplete
          ? "bg-destructive/5 border-destructive/20"
          : ""
      }
      ${
        status === "erro" && isComplete
          ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20"
          : ""
      }
    `}
    >
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="text-base font-semibold">
          {label}
        </Label>

        <div className="flex gap-2 items-center">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}

          <Button
            variant={status === "ok" ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setStatus("ok")}
            disabled={isSaving}
          >
            <Check className="h-4 w-4" /> OK
          </Button>
          <Button
            variant={status === "erro" ? "destructive" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setStatus("erro")}
            disabled={isSaving}
          >
            <AlertTriangle className="h-4 w-4" /> Erro
          </Button>
        </div>
      </div>

      {status === "erro" && (
        <div className="mt-4 space-y-4 pt-4 border-t border-destructive/20">
          <div className="space-y-2">
            <Label
              htmlFor={`${id}-laudo`}
              className="text-destructive font-semibold flex items-center gap-1"
            >
              <AlertTriangle className="h-4 w-4" /> Laudo do Problema *
            </Label>
            <Textarea
              id={`${id}-laudo`}
              placeholder="Descreva o erro encontrado..."
              rows={3}
              value={laudo}
              onChange={handleLaudoChange}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor={`${id}-files`}
              className="text-destructive font-semibold flex items-center gap-1"
            >
              <Camera className="h-4 w-4" /> Anexar Evidências *
            </Label>
            <MiniFileUploader
              files={files}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
              disabled={isSaving}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- 10. SUB-COMPONENTE INTERNO: MiniFileUploader ---
interface MiniFileUploaderProps {
  files: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
}

function MiniFileUploader({
  files,
  onFileChange,
  onRemoveFile,
  disabled = false,
}: MiniFileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center justify-center p-3 border-2 border-dashed rounded-lg text-muted-foreground ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-secondary/20"
        }`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <UploadCloud className="h-5 w-5 mr-2" />
        <p className="text-sm">Clique para adicionar arquivos</p>
      </div>

      <Input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*,video/*"
        disabled={disabled}
      />

      {files.length > 0 && (
        <ul className="space-y-1 max-h-24 overflow-y-auto">
          {files.map((file, index) => (
            <li
              key={index}
              className="text-sm flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-md"
            >
              <span className="truncate max-w-[200px]">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-destructive hover:text-destructive"
                onClick={() => onRemoveFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
