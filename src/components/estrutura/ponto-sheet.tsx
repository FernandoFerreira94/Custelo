"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { Ponto } from "@/application/estrutura/ports";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Falha, Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

/**
 * Ponto de recebimento (UNI-004): portaria ou sala onde a encomenda fica.
 * As prateleiras entram na I4, junto dos locais de guarda.
 */
export function PontoSheet({ ponto, salvar }: { ponto?: Ponto; salvar: Acao }) {
  const router = useRouter();
  const editando = Boolean(ponto);
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState(ponto?.nome ?? "");
  const [funcionamento, setFuncionamento] = useState(
    ponto?.funcionamento ?? "",
  );
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar() {
    iniciar(async () => {
      const r = await salvar(
        editando
          ? { id: ponto!.id, nome, funcionamento }
          : { nome, funcionamento },
      );
      if (!r.ok) {
        setFalha(r);
        return;
      }
      setFalha(null);
      setAberto(false);
      toast.success(r.mensagem ?? "Ponto salvo.");
      router.refresh();
    });
  }

  const erroNome = falha?.campos?.nome;

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        {editando ? (
          <Button variant="ghost" size="sm">
            <PencilIcon aria-hidden />
            Editar
          </Button>
        ) : (
          <Button variant="outline" shape="pill" size="sm">
            <PlusIcon aria-hidden />
            Ponto
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {editando ? `Editar ${ponto!.nome}` : "Novo ponto de recebimento"}
          </SheetTitle>
          <SheetDescription>
            Portaria ou sala onde as encomendas ficam guardadas.
          </SheetDescription>
        </SheetHeader>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
          className="grid gap-4"
        >
          <SheetBody className="grid content-start gap-4">
            {falha && !falha.campos ? (
              <Alert variant="danger" role="alert">
                <AlertDescription>{falha.mensagem}</AlertDescription>
              </Alert>
            ) : null}
            <Field data-invalid={erroNome ? true : undefined}>
              <FieldLabel htmlFor="pt-nome">Nome</FieldLabel>
              <Input
                id="pt-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                aria-invalid={erroNome ? true : undefined}
                aria-describedby={erroNome ? "pt-nome-erro" : undefined}
              />
              {erroNome ? (
                <FieldError id="pt-nome-erro">{erroNome}</FieldError>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="pt-func">Funciona</FieldLabel>
              <Input
                id="pt-func"
                value={funcionamento}
                onChange={(e) => setFuncionamento(e.target.value)}
              />
              <FieldDescription>Ex.: 24 h, ou 07:00 às 19:00.</FieldDescription>
            </Field>
          </SheetBody>
          <SheetFooter>
            <Button type="submit" shape="pill" size="lg" disabled={pendente}>
              {pendente ? "Salvando…" : "Salvar ponto"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
