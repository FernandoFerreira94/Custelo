"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { Falha, Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

/**
 * Diálogo de ação que pede motivo e diz o efeito antes de confirmar. Serve para
 * encerrar vínculo e revogar autorização: nenhum dos dois apaga o histórico.
 */
export function MotivoDialog({
  rotuloDoGatilho,
  titulo,
  efeito,
  rotuloDoBotao,
  executar,
  id,
}: {
  rotuloDoGatilho: string;
  titulo: string;
  efeito: string;
  rotuloDoBotao: string;
  executar: Acao;
  /** Id do vínculo que a ação recebe junto com o motivo. */
  id: string;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  function confirmar(formData: FormData) {
    iniciar(async () => {
      const r = await executar({
        vinculoId: id,
        motivo: String(formData.get("motivo") ?? ""),
      });
      if (!r.ok) {
        setFalha(r);
        return;
      }
      setFalha(null);
      setAberto(false);
      toast.success(r.mensagem ?? "Pronto.");
      router.refresh();
    });
  }

  const erroMotivo = falha?.campos?.motivo;

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {rotuloDoGatilho}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{efeito}</DialogDescription>
        </DialogHeader>
        <form action={confirmar} noValidate>
          <DialogBody className="grid gap-4">
            {falha && !falha.campos ? (
              <Alert variant="danger" role="alert">
                <AlertDescription>{falha.mensagem}</AlertDescription>
              </Alert>
            ) : null}
            <Field data-invalid={erroMotivo ? true : undefined}>
              <FieldLabel htmlFor={`motivo-${id}`}>Motivo</FieldLabel>
              <Textarea
                id={`motivo-${id}`}
                name="motivo"
                rows={3}
                aria-invalid={erroMotivo ? true : undefined}
                aria-describedby={erroMotivo ? `motivo-${id}-erro` : undefined}
              />
              {erroMotivo ? (
                <FieldError id={`motivo-${id}-erro`}>{erroMotivo}</FieldError>
              ) : null}
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              shape="pill"
              onClick={() => setAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              shape="pill"
              disabled={pendente}
            >
              {pendente ? "Salvando…" : rotuloDoBotao}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
