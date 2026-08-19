"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";

import {
  recoverSchema,
  type RecoverInput,
} from "@/components/auth/recover-schema";
import { requestRecovery } from "@/components/auth/request-recovery";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type RecoverAccessFormProps = {
  onBack: () => void;
  onSent: () => void;
};

export function RecoverAccessForm({ onBack, onSent }: RecoverAccessFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverInput>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: RecoverInput) {
    await requestRecovery(values);
    onSent();
  }

  return (
    <Card
      data-login-card
      className="w-full max-w-[420px] font-sans shadow-[var(--shadow-elevation-3)] [--card-spacing:--spacing(8)]"
    >
      <CardHeader>
        <div className="mb-4 flex flex-col items-center gap-3 lg:hidden">
          <Image
            src="/brand/logo-custelo-icon.png"
            alt=""
            width={56}
            height={68}
            className="h-14 w-auto"
          />
          <p className="text-xl font-semibold tracking-tight text-foreground">
            Custelo
          </p>
        </div>
        <CardTitle className="font-sans text-2xl font-semibold tracking-tight">
          <h1 className="contents">Recuperar acesso</h1>
        </CardTitle>
        <CardDescription>
          Enviaremos um link para você definir uma nova senha.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="recover-email">E-mail</FieldLabel>
              <Input
                id="recover-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="condominio@condominio.com.br"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "recover-email-error" : "recover-email-help"
                }
                className="h-12 min-h-[var(--size-touch-min)]"
                {...register("email")}
              />
              {errors.email ? (
                <FieldError id="recover-email-error">
                  {errors.email.message}
                </FieldError>
              ) : (
                <FieldDescription id="recover-email-help">
                  O link vale por 30 min e só pode ser usado uma vez
                </FieldDescription>
              )}
            </Field>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 min-h-[var(--size-touch-primary)] w-full"
            >
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" aria-label="Carregando" />
                  Enviando…
                </>
              ) : (
                "Enviar link de recuperação"
              )}
            </Button>

            <Button
              type="button"
              variant="link"
              onClick={onBack}
              className="h-auto min-h-[var(--size-touch-min)] w-full underline"
            >
              Voltar para o login
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="bg-muted">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Se existir uma conta com esse e-mail, o link será enviado. Por
          segurança, não confirmamos quais e-mails estão cadastrados.
        </p>
      </CardFooter>
    </Card>
  );
}
