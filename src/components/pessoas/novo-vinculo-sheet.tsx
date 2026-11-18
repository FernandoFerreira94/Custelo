"use client";

import { LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  PAPEIS_DE_MORADOR,
  ROTULO_DO_VINCULO,
} from "@/application/pessoas/rotulos";
import type { UnidadeParaEscolher } from "@/components/pessoas/morador-sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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

/** Liga uma pessoa que já existe a outra unidade (ela pode morar em várias). */
export function NovoVinculoSheet({
  pessoaId,
  unidades,
  vincular,
}: {
  pessoaId: string;
  unidades: UnidadeParaEscolher[];
  vincular: Acao;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [unidadeId, setUnidadeId] = useState("");
  const [tipo, setTipo] =
    useState<(typeof PAPEIS_DE_MORADOR)[number]>("morador");
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar() {
    iniciar(async () => {
      const r = await vincular({ pessoaId, unidadeId, tipo });
      if (!r.ok) {
        setFalha(r);
        return;
      }
      setFalha(null);
      setAberto(false);
      toast.success(r.mensagem ?? "Vínculo criado.");
      router.refresh();
    });
  }

  const erroUnidade = falha?.campos?.unidadeId;

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variant="outline" shape="pill">
          <LinkIcon aria-hidden />
          Vincular unidade
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Vincular a uma unidade</SheetTitle>
          <SheetDescription>
            A mesma pessoa pode estar em mais de uma unidade.
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
            <Field data-invalid={erroUnidade ? true : undefined}>
              <FieldLabel htmlFor="nv-unidade">Unidade</FieldLabel>
              <NativeSelect
                id="nv-unidade"
                value={unidadeId}
                onChange={(e) => setUnidadeId(e.target.value)}
              >
                <NativeSelectOption value="">
                  Escolha a unidade
                </NativeSelectOption>
                {unidades.map((u) => (
                  <NativeSelectOption key={u.id} value={u.id}>
                    {u.codigo}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              {erroUnidade ? <FieldError>{erroUnidade}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="nv-papel">Papel</FieldLabel>
              <NativeSelect
                id="nv-papel"
                value={tipo}
                onChange={(e) =>
                  setTipo(e.target.value as (typeof PAPEIS_DE_MORADOR)[number])
                }
              >
                {PAPEIS_DE_MORADOR.map((p) => (
                  <NativeSelectOption key={p} value={p}>
                    {ROTULO_DO_VINCULO[p]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </SheetBody>
          <SheetFooter>
            <Button type="submit" shape="pill" size="lg" disabled={pendente}>
              {pendente ? "Salvando…" : "Vincular"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
