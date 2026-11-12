"use client";

import { SendIcon, UserPlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { PAPEIS_CONVIDAVEIS, ROTULO_PAPEL } from "@/application/equipe/rotulos";
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

/** USR-003. O servidor decide o empreendimento: o formulário só manda e-mail e papel. */
export function ConvidarFuncionario({ convidar }: { convidar: Acao }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [falha, setFalha] = useState<Falha | null>(null);
  const [pendente, iniciar] = useTransition();

  function enviar(formData: FormData) {
    iniciar(async () => {
      const resultado = await convidar({
        email: String(formData.get("email") ?? "").trim(),
        papel: String(formData.get("papel") ?? ""),
      });
      if (!resultado.ok) {
        setFalha(resultado);
        return;
      }
      setFalha(null);
      setAberto(false);
      toast.success(resultado.mensagem ?? "Convite enviado.");
      router.refresh();
    });
  }

  const erroEmail = falha?.campos?.email;

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button shape="pill">
          <UserPlusIcon aria-hidden />
          Convidar
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Convidar pessoa</SheetTitle>
          <SheetDescription>
            A pessoa recebe um link por e-mail e cria a própria senha. Ninguém
            da equipe vê ou define a senha de outra pessoa.
          </SheetDescription>
        </SheetHeader>
        <form action={enviar} className="grid gap-4" noValidate>
          <SheetBody className="grid gap-4">
            {falha && !falha.campos ? (
              <Alert variant="danger" role="alert">
                <AlertDescription>{falha.mensagem}</AlertDescription>
              </Alert>
            ) : null}
            <Field data-invalid={erroEmail ? true : undefined}>
              <FieldLabel htmlFor="convite-email">E-mail</FieldLabel>
              <Input
                id="convite-email"
                name="email"
                type="email"
                autoComplete="off"
                aria-invalid={erroEmail ? true : undefined}
                aria-describedby={erroEmail ? "convite-email-erro" : undefined}
              />
              {erroEmail ? (
                <FieldError id="convite-email-erro">{erroEmail}</FieldError>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="convite-papel">Papel</FieldLabel>
              <NativeSelect
                id="convite-papel"
                name="papel"
                defaultValue="recepcionista"
              >
                {PAPEIS_CONVIDAVEIS.map((p) => (
                  <NativeSelectOption key={p} value={p}>
                    {ROTULO_PAPEL[p]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </SheetBody>
          <SheetFooter>
            <Button type="submit" shape="pill" size="lg" disabled={pendente}>
              <SendIcon aria-hidden />
              {pendente ? "Enviando…" : "Enviar convite"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
