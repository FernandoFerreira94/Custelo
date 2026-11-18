"use client";

import { ShieldCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { UnidadeParaEscolher } from "@/components/pessoas/morador-sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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

/** "Autorizar retirada": alguém que retira encomenda em nome de um morador, até uma data. */
export function AutorizarSheet({
  moradorId,
  moradorNome,
  unidades,
  autorizar,
}: {
  moradorId: string;
  moradorNome: string;
  /** Unidades onde o morador tem vínculo ativo. */
  unidades: UnidadeParaEscolher[];
  autorizar: Acao;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [unidadeId, setUnidadeId] = useState(unidades[0]?.id ?? "");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [relacao, setRelacao] = useState("");
  const [valeAte, setValeAte] = useState("");
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar() {
    iniciar(async () => {
      const r = await autorizar({
        unidadeId,
        nome,
        cpf,
        relacao,
        valeAte,
        emNomeDePessoaId: moradorId,
      });
      if (!r.ok) {
        setFalha(r);
        return;
      }
      setFalha(null);
      setAberto(false);
      toast.success(r.mensagem ?? "Autorização registrada.");
      router.refresh();
    });
  }

  const campos = falha?.campos ?? {};
  const campo = (
    nomeDoCampo: string,
    rotulo: string,
    id: string,
    valor: string,
    mudar: (v: string) => void,
    tipo = "text",
  ) => (
    <Field data-invalid={campos[nomeDoCampo] ? true : undefined}>
      <FieldLabel htmlFor={id}>{rotulo}</FieldLabel>
      <Input
        id={id}
        type={tipo}
        autoComplete="off"
        value={valor}
        onChange={(e) => mudar(e.target.value)}
        aria-invalid={campos[nomeDoCampo] ? true : undefined}
        aria-describedby={campos[nomeDoCampo] ? `${id}-erro` : undefined}
      />
      {campos[nomeDoCampo] ? (
        <FieldError id={`${id}-erro`}>{campos[nomeDoCampo]}</FieldError>
      ) : null}
    </Field>
  );

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variant="outline" shape="pill">
          <ShieldCheckIcon aria-hidden />
          Autorizar retirada
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Autorizar retirada</SheetTitle>
          <SheetDescription>
            Quem retira em nome de {moradorNome}. A pessoa retira, mas não
            recebe aviso.
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
            <Field data-invalid={campos.emNomeDe ? true : undefined}>
              <FieldLabel htmlFor="au-unidade">Unidade</FieldLabel>
              <NativeSelect
                id="au-unidade"
                value={unidadeId}
                onChange={(e) => setUnidadeId(e.target.value)}
              >
                {unidades.map((u) => (
                  <NativeSelectOption key={u.id} value={u.id}>
                    {u.codigo}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              {campos.emNomeDe ? (
                <FieldError>{campos.emNomeDe}</FieldError>
              ) : null}
            </Field>
            {campo("nome", "Nome de quem retira", "au-nome", nome, setNome)}
            {campo("cpf", "CPF", "au-cpf", cpf, setCpf)}
            {campo("relacao", "Relação", "au-relacao", relacao, setRelacao)}
            {campo(
              "valeAte",
              "Vale até",
              "au-vale",
              valeAte,
              setValeAte,
              "date",
            )}
          </SheetBody>
          <SheetFooter>
            <Button type="submit" shape="pill" size="lg" disabled={pendente}>
              {pendente ? "Salvando…" : "Autorizar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
