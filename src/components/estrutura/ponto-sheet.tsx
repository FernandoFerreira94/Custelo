"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { LocalGuarda } from "@/application/custodia/ports";
import type { Ponto } from "@/application/estrutura/ports";
import {
  type PrateleiraEditavel,
  PrateleirasCampos,
  paraEnvio,
} from "@/components/estrutura/prateleiras-campos";
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
 * Ponto de recebimento (UNI-004): portaria ou sala onde a encomenda fica, com as
 * prateleiras (locais de guarda). Salva o ponto e depois a lista de prateleiras.
 */
export function PontoSheet({
  ponto,
  salvar,
  prateleiras = [],
  salvarPrateleiras,
}: {
  ponto?: Ponto;
  salvar: Acao;
  prateleiras?: LocalGuarda[];
  salvarPrateleiras?: Acao;
}) {
  const router = useRouter();
  // Ponto criado nesta abertura: se as prateleiras falharem, o reenvio edita, não duplica.
  const [criadoId, setCriadoId] = useState<string | null>(null);
  const pontoId = ponto?.id ?? criadoId;
  const [aberto, setAberto] = useState(false);
  const [lista, setLista] = useState<PrateleiraEditavel[]>(() =>
    prateleiras.map((l) => ({
      chave: l.id,
      id: l.id,
      codigo: l.codigo,
      capacidade: l.capacidade === null ? "" : String(l.capacidade),
      volumeGrande: l.volumeGrande,
      usado: l.usado,
    })),
  );
  const [nome, setNome] = useState(ponto?.nome ?? "");
  const [funcionamento, setFuncionamento] = useState(
    ponto?.funcionamento ?? "",
  );
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar() {
    iniciar(async () => {
      const r = await salvar(
        pontoId
          ? { id: pontoId, nome, funcionamento }
          : { nome, funcionamento },
      );
      if (!r.ok) {
        setFalha(r);
        return;
      }
      const id = pontoId ?? (r.data as { id: string }).id;
      if (!pontoId) setCriadoId(id);
      if (salvarPrateleiras) {
        const p = await salvarPrateleiras({
          pontoId: id,
          prateleiras: paraEnvio(lista),
        });
        if (!p.ok) {
          setFalha(p);
          router.refresh();
          return;
        }
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
        {ponto ? (
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
            {ponto ? `Editar ${ponto.nome}` : "Novo ponto de recebimento"}
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
            {falha && (!falha.campos || !erroNome) ? (
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
            {salvarPrateleiras ? (
              <PrateleirasCampos
                lista={lista}
                mudar={setLista}
                erros={falha?.campos}
              />
            ) : null}
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
