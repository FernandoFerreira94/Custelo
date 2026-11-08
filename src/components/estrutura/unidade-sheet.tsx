"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { UnidadeResumo } from "@/application/estrutura/ports";
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
import { TagsInput } from "@/components/ui/tags-input";
import { montarCodigo, semAcento } from "@/domain/estrutura/unidade";
import type { TipoUnidade } from "@/domain/estrutura/unidade";
import type { Falha, Resultado } from "@/lib/resultado";

type Acao = (entrada: unknown) => Promise<Resultado<unknown>>;

const TIPOS: { valor: TipoUnidade; rotulo: string }[] = [
  { valor: "apartamento", rotulo: "Apartamento" },
  { valor: "casa", rotulo: "Casa" },
  { valor: "sala", rotulo: "Sala" },
  { valor: "loja", rotulo: "Loja" },
  { valor: "area_comum", rotulo: "Área comum" },
  { valor: "outro", rotulo: "Outro" },
];

/** O que vai aparecer na portaria, calculado com a mesma regra do servidor. */
export function codigoAoVivo(e: {
  bloco: string;
  numero: string;
  tipo: TipoUnidade;
}): string {
  if (!e.numero.trim()) return "";
  return semAcento(
    montarCodigo({ bloco: e.bloco, numero: e.numero, tipo: e.tipo }),
  );
}

/**
 * Nova unidade (bloco, número, tipo) ou edição (código direto). Os apelidos ajudam a
 * leitura da etiqueta a achar a unidade certa.
 */
export function UnidadeSheet({
  unidade,
  salvar,
}: {
  unidade?: UnidadeResumo;
  salvar: Acao;
}) {
  const router = useRouter();
  const editando = Boolean(unidade);
  const [aberto, setAberto] = useState(false);
  const [bloco, setBloco] = useState("");
  const [numero, setNumero] = useState("");
  const [codigo, setCodigo] = useState(unidade?.codigo ?? "");
  const [tipo, setTipo] = useState<TipoUnidade>(unidade?.tipo ?? "apartamento");
  const [apelidos, setApelidos] = useState<string[]>(unidade?.apelidos ?? []);
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  const aparece = editando
    ? codigo.trim()
    : codigoAoVivo({ bloco, numero, tipo });

  function enviar() {
    iniciar(async () => {
      const r = await salvar(
        editando
          ? { id: unidade!.id, codigo, tipo, apelidos }
          : { bloco, numero, tipo, apelidos },
      );
      if (!r.ok) {
        setFalha(r);
        return;
      }
      setFalha(null);
      setAberto(false);
      toast.success(r.mensagem ?? "Unidade salva.");
      router.refresh();
    });
  }

  const erroNumero = falha?.campos?.numero;
  const duplicada = falha?.codigo === "DUPLICADO";

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        {editando ? (
          <Button variant="ghost" size="sm">
            <PencilIcon aria-hidden />
            Editar
          </Button>
        ) : (
          <Button shape="pill">
            <PlusIcon aria-hidden />
            Nova unidade
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {editando ? `Editar ${unidade!.codigo}` : "Nova unidade"}
          </SheetTitle>
          <SheetDescription>
            {editando
              ? "Mudar o código muda como a unidade aparece na portaria."
              : "Informe bloco e número; o código é montado para você."}
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
                <AlertDescription>
                  {falha.mensagem}
                  {duplicada ? (
                    <>
                      {" "}
                      <Link
                        className="underline"
                        href={`/gestao/unidades?q=${encodeURIComponent(aparece)}`}
                      >
                        Abrir {aparece}
                      </Link>
                    </>
                  ) : null}
                </AlertDescription>
              </Alert>
            ) : null}
            {editando ? (
              <Field>
                <FieldLabel htmlFor="un-codigo">Código</FieldLabel>
                <Input
                  id="un-codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
              </Field>
            ) : (
              <>
                <Field>
                  <FieldLabel htmlFor="un-bloco">Bloco (opcional)</FieldLabel>
                  <Input
                    id="un-bloco"
                    value={bloco}
                    onChange={(e) => setBloco(e.target.value)}
                  />
                </Field>
                <Field data-invalid={erroNumero ? true : undefined}>
                  <FieldLabel htmlFor="un-numero">Número</FieldLabel>
                  <Input
                    id="un-numero"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    aria-invalid={erroNumero ? true : undefined}
                    aria-describedby={erroNumero ? "un-numero-erro" : undefined}
                  />
                  {erroNumero ? (
                    <FieldError id="un-numero-erro">{erroNumero}</FieldError>
                  ) : null}
                </Field>
              </>
            )}
            <Field>
              <FieldLabel htmlFor="un-tipo">Tipo</FieldLabel>
              <NativeSelect
                id="un-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoUnidade)}
              >
                {TIPOS.map((t) => (
                  <NativeSelectOption key={t.valor} value={t.valor}>
                    {t.rotulo}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="un-apelidos">
                Outros jeitos de escrever
              </FieldLabel>
              <TagsInput
                id="un-apelidos"
                value={apelidos}
                onValueChange={setApelidos}
                placeholder="Ex.: BL B AP 304"
                max={20}
              />
              <FieldDescription>
                Os jeitos de escrever ajudam a leitura da etiqueta a achar a
                unidade certa.
              </FieldDescription>
            </Field>
            <p
              aria-live="polite"
              className="rounded-2xl bg-muted px-4 py-3 text-sm"
            >
              {aparece ? (
                <>
                  Vai aparecer como{" "}
                  <strong className="font-mono">{aparece}</strong>
                </>
              ) : (
                "Informe o número para ver como vai aparecer."
              )}
            </p>
          </SheetBody>
          <SheetFooter>
            <Button type="submit" shape="pill" size="lg" disabled={pendente}>
              {pendente ? "Salvando…" : editando ? "Salvar" : "Criar unidade"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
