"use client";

import { UserPlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  PAPEIS_DE_MORADOR,
  ROTULO_DO_VINCULO,
} from "@/application/pessoas/rotulos";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export type UnidadeParaEscolher = { id: string; codigo: string };

/**
 * "Novo morador" na ordem da prancha: unidade primeiro, depois nome, papel e contatos.
 * O consentimento só nasce aqui, quando o gestor marca que o morador autorizou.
 */
export function MoradorSheet({
  unidades,
  criar,
}: {
  unidades: UnidadeParaEscolher[];
  criar: Acao;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [unidadeId, setUnidadeId] = useState("");
  const [nome, setNome] = useState("");
  const [tipo, setTipo] =
    useState<(typeof PAPEIS_DE_MORADOR)[number]>("titular");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [autorizou, setAutorizou] = useState(false);
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar() {
    iniciar(async () => {
      const r = await criar({
        unidadeId,
        nome,
        tipo,
        whatsapp,
        email,
        cpf,
        moradorAutorizou: autorizou,
      });
      if (!r.ok) {
        setFalha(r);
        return;
      }
      setFalha(null);
      setAberto(false);
      toast.success(r.mensagem ?? "Morador cadastrado.");
      router.refresh();
    });
  }

  const campos = falha?.campos ?? {};
  const erro = (campo: string, id: string) =>
    campos[campo] ? <FieldError id={id}>{campos[campo]}</FieldError> : null;
  const ligado = (campo: string, id: string) =>
    campos[campo]
      ? ({ "aria-invalid": true, "aria-describedby": id } as const)
      : {};

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button shape="pill">
          <UserPlusIcon aria-hidden />
          Novo morador
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Novo morador</SheetTitle>
          <SheetDescription>
            Comece pela unidade. O aviso só sai para quem autorizou.
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
            <Field data-invalid={campos.unidadeId ? true : undefined}>
              <FieldLabel htmlFor="mo-unidade">Unidade</FieldLabel>
              <NativeSelect
                id="mo-unidade"
                value={unidadeId}
                onChange={(e) => setUnidadeId(e.target.value)}
                {...ligado("unidadeId", "mo-unidade-erro")}
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
              {erro("unidadeId", "mo-unidade-erro")}
            </Field>
            <Field data-invalid={campos.nome ? true : undefined}>
              <FieldLabel htmlFor="mo-nome">Nome</FieldLabel>
              <Input
                id="mo-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                {...ligado("nome", "mo-nome-erro")}
              />
              {erro("nome", "mo-nome-erro")}
            </Field>
            <Field>
              <FieldLabel htmlFor="mo-papel">Papel</FieldLabel>
              <NativeSelect
                id="mo-papel"
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
            <Field data-invalid={campos.whatsapp ? true : undefined}>
              <FieldLabel htmlFor="mo-whats">WhatsApp</FieldLabel>
              <Input
                id="mo-whats"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                {...ligado("whatsapp", "mo-whats-erro")}
              />
              {erro("whatsapp", "mo-whats-erro")}
            </Field>
            <Field data-invalid={campos.email ? true : undefined}>
              <FieldLabel htmlFor="mo-email">E-mail (opcional)</FieldLabel>
              <Input
                id="mo-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                {...ligado("email", "mo-email-erro")}
              />
              {erro("email", "mo-email-erro")}
            </Field>
            <Field data-invalid={campos.cpf ? true : undefined}>
              <FieldLabel htmlFor="mo-cpf">CPF (opcional)</FieldLabel>
              <Input
                id="mo-cpf"
                inputMode="numeric"
                autoComplete="off"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                {...ligado("cpf", "mo-cpf-erro")}
              />
              {campos.cpf ? (
                erro("cpf", "mo-cpf-erro")
              ) : (
                <FieldDescription>
                  Só para quem o condomínio precisa identificar na retirada.
                  Fica guardado e aparece mascarado.
                </FieldDescription>
              )}
            </Field>
            <div className="flex items-start gap-3">
              <Checkbox
                id="mo-autorizou"
                checked={autorizou}
                onCheckedChange={(v) => setAutorizou(v === true)}
              />
              <div className="grid gap-1">
                <Label htmlFor="mo-autorizou" className="leading-snug">
                  O morador autorizou receber avisos por WhatsApp
                </Label>
                <p className="text-xs text-muted-foreground">
                  Marque só se ele disse que sim. Fica registrado quem marcou e
                  quando; sem isso, nenhum aviso sai.
                </p>
              </div>
            </div>
            {falha?.codigo === "DUPLICADO" ? (
              <p className="text-sm">
                <Link className="underline" href="/gestao/pessoas">
                  Abrir a lista de pessoas
                </Link>
              </p>
            ) : null}
          </SheetBody>
          <SheetFooter>
            <Button type="submit" shape="pill" size="lg" disabled={pendente}>
              {pendente ? "Salvando…" : "Cadastrar morador"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
