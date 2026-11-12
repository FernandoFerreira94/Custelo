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
import type { Falha, Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

/** Desativar pede confirmação e diz o efeito. Quem tem vínculo ativo é recusado pelo caso de uso. */
export function DesativarUnidade({
  id,
  codigo,
  desativar,
}: {
  id: string;
  codigo: string;
  desativar: Acao;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  function confirmar() {
    iniciar(async () => {
      const r = await desativar({ id });
      if (!r.ok) {
        setFalha(r);
        return;
      }
      setFalha(null);
      setAberto(false);
      toast.success(r.mensagem ?? "Unidade desativada.");
      router.refresh();
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Desativar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desativar {codigo}?</DialogTitle>
          <DialogDescription>
            A unidade some da portaria e deixa de ser destino de encomenda. O
            histórico fica guardado e dá para reativar depois.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {falha ? (
            <Alert variant="danger" role="alert">
              <AlertDescription>{falha.mensagem}</AlertDescription>
            </Alert>
          ) : null}
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
            type="button"
            variant="destructive"
            shape="pill"
            disabled={pendente}
            onClick={confirmar}
          >
            {pendente ? "Desativando…" : "Desativar unidade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
