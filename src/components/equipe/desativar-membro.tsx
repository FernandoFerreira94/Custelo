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

/** Desativar pede confirmação com motivo; o efeito vem escrito no texto. */
export function DesativarMembro({
  usuarioId,
  nome,
  desativar,
}: {
  usuarioId: string;
  nome: string;
  desativar: Acao;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  function confirmar(formData: FormData) {
    iniciar(async () => {
      const resultado = await desativar({
        usuarioId,
        motivo: String(formData.get("motivo") ?? ""),
      });
      if (!resultado.ok) {
        setFalha(resultado);
        return;
      }
      setFalha(null);
      setAberto(false);
      toast.success(resultado.mensagem ?? "Acesso desativado.");
      router.refresh();
    });
  }

  const erroMotivo = falha?.campos?.motivo;

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="ghost">Desativar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desativar {nome}?</DialogTitle>
          <DialogDescription>
            A pessoa sai de todos os aparelhos agora e não entra mais. O
            histórico dela continua guardado.
          </DialogDescription>
        </DialogHeader>
        <form action={confirmar} noValidate>
          <DialogBody className="grid gap-4">
            {falha && !falha.campos ? (
              <Alert variant="danger" role="alert">
                <AlertDescription>{falha.mensagem}</AlertDescription>
              </Alert>
            ) : null}
            <Field data-invalid={erroMotivo ? true : undefined}>
              <FieldLabel htmlFor={`motivo-${usuarioId}`}>Motivo</FieldLabel>
              <Textarea
                id={`motivo-${usuarioId}`}
                name="motivo"
                rows={3}
                aria-invalid={erroMotivo ? true : undefined}
                aria-describedby={
                  erroMotivo ? `motivo-${usuarioId}-erro` : undefined
                }
              />
              {erroMotivo ? (
                <FieldError id={`motivo-${usuarioId}-erro`}>
                  {erroMotivo}
                </FieldError>
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
              {pendente ? "Desativando…" : "Desativar acesso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
